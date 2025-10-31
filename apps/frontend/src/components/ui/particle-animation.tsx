"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";

type Effect = "default" | "spark" | "wave" | "vortex";

export default function V0ParticleAnimation() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [currentEffect, setCurrentEffect] = useState<Effect>("default");
	const sceneRef = useRef<{
		scene: THREE.Scene;
		camera: THREE.Camera; // Changed to Camera to support both Perspective and Orthographic
		renderer: THREE.WebGLRenderer;
		points: THREE.Points;
		geometry: THREE.BufferGeometry;
		originalPositions: Float32Array;
		velocities: Float32Array;
		phases: Float32Array;
		intersectionPoint: THREE.Vector3 | null;
		rotationX: number;
		rotationY: number;
		isDragging: boolean;
		previousMouseX: number;
		previousMouseY: number;
		particleCount: number;
	} | null>(null);

	// Clamp utility
	const clamp = (value: number, min: number, max: number) => {
		return Math.max(min, Math.min(max, value));
	};

	// Distance to rounded box
	const e = (px: number, py: number, sx: number, sy: number) => {
		const dx = Math.abs(px) - sx;
		const dy = Math.abs(py) - sy;
		return (
			Math.sqrt(Math.max(dx, 0) ** 2 + Math.max(dy, 0) ** 2) +
			Math.min(Math.max(dx, dy), 0)
		);
	};

	// Distance to capsule
	const g = (
		px: number,
		py: number,
		ax: number,
		ay: number,
		cx: number,
		cy: number,
		w: number,
	) => {
		const pax = px - ax;
		const pay = py - ay;
		const bax = cx - ax;
		const bay = cy - ay;
		const dotBaBa = bax * bax + bay * bay;
		const dotPaBa = pax * bax + pay * bay;
		const h = clamp(dotPaBa / dotBaBa, 0, 1);
		const dx = pax - bax * h;
		const dy = pay - bay * h;
		return Math.sqrt(dx * dx + dy * dy) - w;
	};

	// Distance to v0 logo shape
	const dist = (px: number, py: number) => {
		const w = 0.06;
		return Math.min(
			g(px, py, -0.8, 0.2, -0.26, -0.36, w),
			Math.min(
				g(px, py, -0.25, -0.36, -0.25, 0.24, w),
				Math.min(
					e(px - 0, py - -0.04, w, 0.33),
					Math.min(
						e(px - 0.38, py - 0.35, 0.32, w),
						Math.min(
							g(px, py, 0, -0.36, 0.69, 0.35, w),
							Math.min(
								e(px - 0.31, py - -0.36, 0.32, w),
								Math.min(e(px - 0.69, py - 0.02, w, 0.32), 1e5),
							),
						),
					),
				),
			),
		);
	};

	useEffect(() => {
		if (!canvasRef.current) return;

		const canvas = canvasRef.current;
		const scene = new THREE.Scene();

		// Get actual display size
		const container = canvas.parentElement;
		const displayWidth = container?.clientWidth || window.innerWidth;
		const displayHeight = container?.clientHeight || window.innerHeight;

		// Set canvas internal size to match display size
		canvas.width = displayWidth;
		canvas.height = displayHeight;

		// Use OrthographicCamera for parallel projection (no perspective distortion)
		// Initial bounds will be set after text geometry is loaded
		const aspect = displayWidth / displayHeight;
		const viewSize = 12; // Base view size, will be adjusted based on text
		const camera = new THREE.OrthographicCamera(
			-viewSize * aspect, // left
			viewSize * aspect, // right
			viewSize, // top
			-viewSize, // bottom
			0.1,
			1000,
		);
		const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

		// Handle device pixel ratio for crisp rendering on high-DPI displays
		const pixelRatio = Math.min(window.devicePixelRatio, 2); // Cap at 2 for performance
		renderer.setPixelRatio(pixelRatio);
		renderer.setSize(displayWidth, displayHeight, false);
		renderer.setClearColor(0x000000);

		const raycaster = new THREE.Raycaster();
		const mouse = new THREE.Vector2();
		const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

		// --- NEW: Define variables for async setup & cleanup ---
		let animationId: number;
		let geometry: THREE.BufferGeometry | null = null;
		let material: THREE.PointsMaterial | null = null;
		let points: THREE.Points | null = null;
		let handleMouseMove: ((event: MouseEvent) => void) | null = null;
		let handleMouseLeave: (() => void) | null = null;
		let handleResize: (() => void) | null = null;

		// --- NEW: Load the font ---
		const loader = new FontLoader();
		loader.load(
			"/grafolita.json",
			(font) => {
				// --- Font is loaded, now we can build the scene ---

				// 1. Generate TextGeometry
				const textGeometry = new TextGeometry("Sealos Brain", {
					// Or any text
					font: font,
					size: 2.0, // Increased size for better visibility
					curveSegments: 12,
					bevelEnabled: false,
				});
				textGeometry.computeBoundingBox();
				textGeometry.center(); // Center the text

				// Calculate bounding box dimensions
				const boundingBox = textGeometry.boundingBox;
				const textWidth = boundingBox
					? boundingBox.max.x - boundingBox.min.x
					: 10;
				const textHeight = boundingBox
					? boundingBox.max.y - boundingBox.min.y
					: 10;
				const textDepth = boundingBox
					? boundingBox.max.z - boundingBox.min.z
					: 2;

				// 2. Generate particles using MeshSurfaceSampler
				const numParticles = 12000;
				const positions = new Float32Array(numParticles * 3);
				const colors = new Float32Array(numParticles * 3);
				const textMesh = new THREE.Mesh(textGeometry);
				const sampler = new MeshSurfaceSampler(textMesh).build();

				const tempPosition = new THREE.Vector3();
				for (let i = 0; i < numParticles; i++) {
					sampler.sample(tempPosition);
					positions[i * 3] = tempPosition.x;
					positions[i * 3 + 1] = tempPosition.y;
					positions[i * 3 + 2] = tempPosition.z;
					colors[i * 3] = 1;
					colors[i * 3 + 1] = 1;
					colors[i * 3 + 2] = 1;
				}
				textGeometry.dispose(); // Clean up geometry

				// --- (REMOVED) Old particle generation loop using dist() ---

				// 3. Setup particle system (same as before)
				const originalPositions = positions.slice();
				const phases = new Float32Array(numParticles);
				const velocities = new Float32Array(numParticles * 3);

				for (let j = 0; j < numParticles; j++) {
					phases[j] = Math.random() * Math.PI * 2;
				}

				geometry = new THREE.BufferGeometry(); // Assign to outer var
				geometry.setAttribute(
					"position",
					new THREE.BufferAttribute(positions, 3),
				);
				geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

				material = new THREE.PointsMaterial({
					// Assign to outer var
					size: 0.015, // Increased particle size for better visibility
					sizeAttenuation: true,
					vertexColors: true,
				});

				points = new THREE.Points(geometry, material); // Assign to outer var
				scene.add(points);

				// Setup orthographic camera bounds to fit text with padding
				// Use the larger dimension and add padding (1.3x for comfortable margin)
				const maxDimension = Math.max(textWidth, textHeight);
				const viewSize = (maxDimension / 2) * 1.3;
				const aspect = displayWidth / displayHeight;

				camera.left = -viewSize * aspect;
				camera.right = viewSize * aspect;
				camera.top = viewSize;
				camera.bottom = -viewSize;
				camera.updateProjectionMatrix();

				// Position camera closer for orthographic view
				camera.position.set(0, 0, 10);
				camera.lookAt(0, 0, 0); // Look at the center where text is

				// Store initial view size for zoom controls
				const initialViewSize = viewSize;

				// 4. Store scene data
				sceneRef.current = {
					scene,
					camera,
					renderer,
					points,
					geometry,
					originalPositions,
					velocities,
					phases,
					intersectionPoint: null,
					rotationX: 0,
					rotationY: 0,
					isDragging: false,
					previousMouseX: 0,
					previousMouseY: 0,
					particleCount: numParticles,
				};

				// Store initial view size for zoom limits
				(sceneRef.current as any).initialViewSize = initialViewSize;
				(sceneRef.current as any).aspect = aspect;

				// 5. Mouse move handler for particle effects
				handleMouseMove = (event: MouseEvent) => {
					if (!sceneRef.current) return;
					const rect = canvas.getBoundingClientRect();
					const offsetX = event.clientX - rect.left;
					const offsetY = event.clientY - rect.top;
					mouse.x = (offsetX / rect.width) * 2 - 1;
					mouse.y = -(offsetY / rect.height) * 2 + 1;
					raycaster.setFromCamera(mouse, camera);
					const intersect = new THREE.Vector3();
					if (raycaster.ray.intersectPlane(plane, intersect)) {
						sceneRef.current.intersectionPoint = intersect;
					}
				};

				handleMouseLeave = () => {
					if (sceneRef.current) {
						sceneRef.current.intersectionPoint = null;
					}
				};

				canvas.addEventListener("mousemove", handleMouseMove);
				canvas.addEventListener("mouseleave", handleMouseLeave);

				// Handle window resize
				handleResize = () => {
					const container = canvas.parentElement;
					const newWidth = container?.clientWidth || window.innerWidth;
					const newHeight = container?.clientHeight || window.innerHeight;

					canvas.width = newWidth;
					canvas.height = newHeight;

					// Update orthographic camera bounds for new aspect ratio
					const newAspect = newWidth / newHeight;
					const currentViewSize =
						(sceneRef.current as any)?.initialViewSize || initialViewSize;
					camera.left = -currentViewSize * newAspect;
					camera.right = currentViewSize * newAspect;
					camera.top = currentViewSize;
					camera.bottom = -currentViewSize;
					camera.updateProjectionMatrix();

					(sceneRef.current as any).aspect = newAspect;

					const pixelRatio = Math.min(window.devicePixelRatio, 2);
					renderer.setPixelRatio(pixelRatio);
					renderer.setSize(newWidth, newHeight, false);
				};

				window.addEventListener("resize", handleResize);

				// 6. Animation loop
				const animate = (time: number) => {
					if (!sceneRef.current) return;

					time *= 0.001;

					const {
						geometry,
						points,
						originalPositions,
						velocities,
						phases,
						intersectionPoint,
						rotationX,
						rotationY,
						particleCount,
					} = sceneRef.current;

					// --- (The rest of your animate function is identical) ---
					// ... (particle physics, color updates, etc.) ...
					// ...

					const positionAttribute = geometry.getAttribute(
						"position",
					) as THREE.BufferAttribute;
					const colorAttribute = geometry.getAttribute(
						"color",
					) as THREE.BufferAttribute;

					const radiusSwirl = 0.01;
					const angularSpeed = 1;
					const effectRadius = 0.6; // Increased effect radius for more visible hover area

					let repelStrength = 0;
					if (currentEffect === "default") {
						repelStrength = 0.3; // Increased from 0.05 for more intense default effect
					} else if (currentEffect === "spark") {
						repelStrength = 1.2; // Increased from 0.5 for much stronger spark effect
					}

					const attractStrength = 0.03; // Slightly reduced so particles don't snap back as quickly
					const damping = 0.9; // Reduced from 0.95 so movement persists more

					points.rotation.y += (rotationY - points.rotation.y) * 0.1;
					points.rotation.x += (rotationX - points.rotation.x) * 0.1;

					const euler = new THREE.Euler(
						points.rotation.x,
						points.rotation.y,
						points.rotation.z,
						"XYZ",
					);
					const inverseQuaternion = new THREE.Quaternion()
						.setFromEuler(euler)
						.invert();

					let localIntersection: THREE.Vector3 | null = null;
					if (intersectionPoint) {
						localIntersection = intersectionPoint
							.clone()
							.applyQuaternion(inverseQuaternion);
					}

					for (let j = 0; j < particleCount; j++) {
						const idx = j * 3;
						const ox = originalPositions[idx];
						const oy = originalPositions[idx + 1];
						const oz = originalPositions[idx + 2];

						const theta = angularSpeed * time + phases[j];
						const swirlDx = radiusSwirl * Math.cos(theta);
						const swirlDy = radiusSwirl * Math.sin(theta);

						const targetX = ox + swirlDx;
						const targetY = oy + swirlDy;
						const targetZ = oz;

						let px = positionAttribute.getX(j);
						let py = positionAttribute.getY(j);
						let pz = positionAttribute.getZ(j);

						let vx = velocities[idx];
						let vy = velocities[idx + 1];
						let vz = velocities[idx + 2];

						if (localIntersection) {
							const dx = px - localIntersection.x;
							const dy = py - localIntersection.y;
							const dz = pz - localIntersection.z;
							const distSq = dx * dx + dy * dy + dz * dz;
							const dist = Math.sqrt(distSq);

							if (currentEffect === "wave") {
								if (distSq < effectRadius * effectRadius) {
									const waveStrength = 0.9; // Increased from 0.3 for more intense waves
									const waveFreq = 15;
									const wavePhase = time * 12 - dist * waveFreq; // Faster wave propagation
									const waveForce =
										Math.sin(wavePhase) *
										waveStrength *
										(1 - dist / effectRadius);
									if (dist > 0.001) {
										vx += (dx / dist) * waveForce;
										vy += (dy / dist) * waveForce;
										vz += waveForce * 0.5;
									}
								}
							} else if (currentEffect === "vortex") {
								if (distSq < effectRadius * effectRadius && dist > 0.05) {
									const vortexStrength = 0.5; // Increased from 0.15 for stronger vortex
									const spiralForce =
										vortexStrength * (1 - dist / effectRadius);

									const tangentX = -dy;
									const tangentY = dx;
									const tangentLength = Math.sqrt(
										tangentX * tangentX + tangentY * tangentY,
									);
									if (tangentLength > 0.001) {
										vx += (tangentX / tangentLength) * spiralForce;
										vy += (tangentY / tangentLength) * spiralForce;
									}

									const pullStrength = spiralForce * 0.5; // Increased from 0.3 for stronger pull
									vx -= (dx / dist) * pullStrength;
									vy -= (dy / dist) * pullStrength;
								}
							} else if (
								currentEffect === "default" ||
								currentEffect === "spark"
							) {
								if (distSq < effectRadius * effectRadius && distSq > 0.0001) {
									const force = (1 - dist / effectRadius) * repelStrength;
									vx += (dx / dist) * force;
									vy += (dy / dist) * force;
									vz += (dz / dist) * force;
								}
							}
						}

						const attractDx = targetX - px;
						const attractDy = targetY - py;
						const attractDz = targetZ - pz;
						vx += attractDx * attractStrength;
						vy += attractDy * attractStrength;
						vz += attractDz * attractStrength;

						vx *= damping;
						vy *= damping;
						vz *= damping;

						px += vx;
						py += vy;
						pz += vz;

						positionAttribute.setXYZ(j, px, py, pz);

						velocities[idx] = vx;
						velocities[idx + 1] = vy;
						velocities[idx + 2] = vz;

						let r = 1,
							g = 1,
							b = 1;
						if (localIntersection) {
							const dx = px - localIntersection.x;
							const dy = py - localIntersection.y;
							const dz = pz - localIntersection.z;
							const distSq = dx * dx + dy * dy + dz * dz;
							const dist = Math.sqrt(distSq);

							if (
								currentEffect === "wave" &&
								distSq < effectRadius * effectRadius
							) {
								const wavePhase = time * 8 - dist * 15;
								const intensity =
									Math.abs(Math.sin(wavePhase)) * (1 - dist / effectRadius) + 1;
								r = intensity * 0.5 + 0.8;
								g = intensity * 0.8 + 0.6;
								b = intensity * 1.2 + 0.4;
							} else if (
								currentEffect === "vortex" &&
								distSq < effectRadius * effectRadius
							) {
								const angle = Math.atan2(dy, dx) + time * 5;
								const intensity = (1 - dist / effectRadius) * 2 + 1;
								r = (Math.sin(angle) * 0.5 + 0.5) * intensity;
								g =
									(Math.sin(angle + (Math.PI * 2) / 3) * 0.5 + 0.5) * intensity;
								b =
									(Math.sin(angle + (Math.PI * 4) / 3) * 0.5 + 0.5) * intensity;
							}
						}
						colorAttribute.setXYZ(j, r, g, b);
					}

					positionAttribute.needsUpdate = true;
					colorAttribute.needsUpdate = true;

					renderer.render(scene, camera);
					animationId = requestAnimationFrame(animate);
				};

				animationId = requestAnimationFrame(animate);
			},
			// --- (Optional) Progress and error handlers for FontLoader ---
			undefined,
			(error) => {
				console.error("An error happened while loading the font:", error);
			},
		);

		// --- Cleanup (this part runs synchronously) ---
		return () => {
			// This cleanup function will be called when the component
			// unmounts or when `currentEffect` changes
			if (animationId) cancelAnimationFrame(animationId);
			if (canvas) {
				if (handleMouseMove)
					canvas.removeEventListener("mousemove", handleMouseMove);
				if (handleMouseLeave)
					canvas.removeEventListener("mouseleave", handleMouseLeave);
			}
			if (handleResize) {
				window.removeEventListener("resize", handleResize);
			}
			if (geometry) geometry.dispose();
			if (material) material.dispose();
			if (points) scene.remove(points);
			renderer.dispose();
			sceneRef.current = null;
		};
	}, [currentEffect]); // Effect still reruns when `currentEffect` changes

	// Mouse drag handlers
	const handleMouseDown = (event: React.MouseEvent) => {
		if (!sceneRef.current) return;
		sceneRef.current.isDragging = true;
		sceneRef.current.previousMouseX = event.clientX;
		sceneRef.current.previousMouseY = event.clientY;
	};

	const handleMouseMove = (event: React.MouseEvent) => {
		if (!sceneRef.current || !sceneRef.current.isDragging) return;

		const deltaX = event.clientX - sceneRef.current.previousMouseX;
		const deltaY = event.clientY - sceneRef.current.previousMouseY;

		sceneRef.current.rotationY -= deltaX * 0.005;
		sceneRef.current.rotationX -= deltaY * 0.005;

		sceneRef.current.previousMouseX = event.clientX;
		sceneRef.current.previousMouseY = event.clientY;
	};

	const handleMouseUp = () => {
		if (sceneRef.current) {
			sceneRef.current.isDragging = false;
		}
	};

	// Touch handlers
	const handleTouchStart = (event: React.TouchEvent) => {
		if (!sceneRef.current) return;
		sceneRef.current.isDragging = true;
		sceneRef.current.previousMouseX = event.touches[0].clientX;
		sceneRef.current.previousMouseY = event.touches[0].clientY;
	};

	const handleTouchMove = (event: React.TouchEvent) => {
		if (!sceneRef.current || !sceneRef.current.isDragging) return;

		const deltaX = event.touches[0].clientX - sceneRef.current.previousMouseX;
		const deltaY = event.touches[0].clientY - sceneRef.current.previousMouseY;

		sceneRef.current.rotationY -= deltaX * 0.005;
		sceneRef.current.rotationX -= deltaY * 0.005;

		sceneRef.current.previousMouseX = event.touches[0].clientX;
		sceneRef.current.previousMouseY = event.touches[0].clientY;
	};

	const handleTouchEnd = () => {
		if (sceneRef.current) {
			sceneRef.current.isDragging = false;
		}
	};

	// Zoom handlers (for orthographic camera, zoom is done by changing view size)
	const handleZoomIn = () => {
		if (
			sceneRef.current &&
			sceneRef.current.camera instanceof THREE.OrthographicCamera
		) {
			const camera = sceneRef.current.camera;
			const initialViewSize = (sceneRef.current as any).initialViewSize || 12;
			const aspect = (sceneRef.current as any).aspect || 1;

			// Calculate current view size
			const currentViewSize = camera.top;
			const newViewSize = Math.max(
				initialViewSize * 0.3, // Allow zooming in to 30% of initial size
				currentViewSize * 0.9, // Zoom in by 10%
			);

			camera.left = -newViewSize * aspect;
			camera.right = newViewSize * aspect;
			camera.top = newViewSize;
			camera.bottom = -newViewSize;
			camera.updateProjectionMatrix();
		}
	};

	const handleZoomOut = () => {
		if (
			sceneRef.current &&
			sceneRef.current.camera instanceof THREE.OrthographicCamera
		) {
			const camera = sceneRef.current.camera;
			const initialViewSize = (sceneRef.current as any).initialViewSize || 12;
			const aspect = (sceneRef.current as any).aspect || 1;

			// Calculate current view size
			const currentViewSize = camera.top;
			const newViewSize = Math.min(
				initialViewSize * 2, // Allow zooming out to 200% of initial size
				currentViewSize * 1.1, // Zoom out by 10%
			);

			camera.left = -newViewSize * aspect;
			camera.right = newViewSize * aspect;
			camera.top = newViewSize;
			camera.bottom = -newViewSize;
			camera.updateProjectionMatrix();
		}
	};

	return (
		<div className="relative flex items-center justify-center min-h-screen w-full h-full">
			<canvas
				ref={canvasRef}
				className="block w-full h-full"
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseUp}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
			/>

			{/* Zoom controls */}
			<div className="absolute top-5 right-5 flex flex-col gap-2.5">
				<button
					type="button"
					onClick={handleZoomIn}
					className="px-5 py-2.5 text-2xl bg-white/10 border border-white text-white cursor-pointer transition-colors hover:bg-white/30"
				>
					+
				</button>
				<button
					type="button"
					onClick={handleZoomOut}
					className="px-5 py-2.5 text-2xl bg-white/10 border border-white text-white cursor-pointer transition-colors hover:bg-white/30"
				>
					-
				</button>
			</div>

			{/* Effect menu */}
			<div className="absolute top-5 left-5 flex flex-col gap-2.5">
				<select
					value={currentEffect}
					onChange={(e) => setCurrentEffect(e.target.value as Effect)}
					className="px-2.5 py-2.5 text-base bg-white/10 border border-white text-white cursor-pointer"
				>
					<option value="default">Default (Light Scatter)</option>
					<option value="spark">Spark (Strong Scatter)</option>
					<option value="wave">Wave (Ripple Effect)</option>
					<option value="vortex">Vortex (Spiral Pull)</option>
				</select>
			</div>
		</div>
	);
}
