"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type Effect = "default" | "spark" | "wave" | "vortex";

export default function V0ParticleAnimation() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [currentEffect, setCurrentEffect] = useState<Effect>("default");
	const sceneRef = useRef<{
		scene: THREE.Scene;
		camera: THREE.PerspectiveCamera;
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
		const camera = new THREE.PerspectiveCamera(
			75,
			canvas.width / canvas.height,
			0.1,
			1000,
		);
		const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

		renderer.setSize(canvas.width, canvas.height);
		renderer.setClearColor(0x000000);

		const raycaster = new THREE.Raycaster();
		const mouse = new THREE.Vector2();
		const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

		// Generate particles
		const numParticles = 12000;
		const thickness = 0.2;
		const positions = new Float32Array(numParticles * 3);
		const colors = new Float32Array(numParticles * 3);

		let i = 0;
		const maxAttempts = 1200000;
		let attempts = 0;

		while (i < numParticles && attempts < maxAttempts) {
			attempts++;
			const x = Math.random() * 4 - 2;
			const y = Math.random() * 2 - 1;
			const z = Math.random() * thickness - thickness / 2;

			if (dist(x, y) <= 0) {
				positions[i * 3] = x;
				positions[i * 3 + 1] = y;
				positions[i * 3 + 2] = z;
				colors[i * 3] = 1;
				colors[i * 3 + 1] = 1;
				colors[i * 3 + 2] = 1;
				i++;
			}
		}

		const originalPositions = positions.slice();
		const phases = new Float32Array(i);
		const velocities = new Float32Array(i * 3);

		for (let j = 0; j < i; j++) {
			phases[j] = Math.random() * Math.PI * 2;
		}

		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
		geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

		const material = new THREE.PointsMaterial({
			size: 0.005,
			sizeAttenuation: true,
			vertexColors: true,
		});

		const points = new THREE.Points(geometry, material);
		scene.add(points);
		camera.position.set(0, 0, 2.0);

		// Store scene data
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
			particleCount: i,
		};

		// Mouse move handler for particle effects
		const handleMouseMove = (event: MouseEvent) => {
			if (!sceneRef.current) return;

			const rect = canvas.getBoundingClientRect();
			const offsetX = event.clientX - rect.left;
			const offsetY = event.clientY - rect.top;

			mouse.x = (offsetX / canvas.clientWidth) * 2 - 1;
			mouse.y = -(offsetY / canvas.clientHeight) * 2 + 1;

			raycaster.setFromCamera(mouse, camera);
			const intersect = new THREE.Vector3();
			if (raycaster.ray.intersectPlane(plane, intersect)) {
				sceneRef.current.intersectionPoint = intersect;
			}
		};

		const handleMouseLeave = () => {
			if (sceneRef.current) {
				sceneRef.current.intersectionPoint = null;
			}
		};

		canvas.addEventListener("mousemove", handleMouseMove);
		canvas.addEventListener("mouseleave", handleMouseLeave);

		// Animation loop
		let animationId: number;
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

			const positionAttribute = geometry.getAttribute(
				"position",
			) as THREE.BufferAttribute;
			const colorAttribute = geometry.getAttribute(
				"color",
			) as THREE.BufferAttribute;

			const radiusSwirl = 0.01;
			const angularSpeed = 1;
			const effectRadius = 0.3;

			let repelStrength = 0;
			if (currentEffect === "default") {
				repelStrength = 0.05;
			} else if (currentEffect === "spark") {
				repelStrength = 0.5;
			}

			const attractStrength = 0.05;
			const damping = 0.95;

			// Update rotations
			points.rotation.y += (rotationY - points.rotation.y) * 0.1;
			points.rotation.x += (rotationX - points.rotation.x) * 0.1;

			// Compute inverse quaternion
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

			// Update particles
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

				// Special effects
				if (localIntersection) {
					const dx = px - localIntersection.x;
					const dy = py - localIntersection.y;
					const dz = pz - localIntersection.z;
					const distSq = dx * dx + dy * dy + dz * dz;
					const dist = Math.sqrt(distSq);

					if (currentEffect === "wave") {
						if (distSq < effectRadius * effectRadius) {
							const waveStrength = 0.3;
							const waveFreq = 15;
							const wavePhase = time * 8 - dist * waveFreq;
							const waveForce =
								Math.sin(wavePhase) * waveStrength * (1 - dist / effectRadius);
							if (dist > 0.001) {
								vx += (dx / dist) * waveForce;
								vy += (dy / dist) * waveForce;
								vz += waveForce * 0.5;
							}
						}
					} else if (currentEffect === "vortex") {
						if (distSq < effectRadius * effectRadius && dist > 0.05) {
							const vortexStrength = 0.15;
							const spiralForce = vortexStrength * (1 - dist / effectRadius);

							const tangentX = -dy;
							const tangentY = dx;
							const tangentLength = Math.sqrt(
								tangentX * tangentX + tangentY * tangentY,
							);
							if (tangentLength > 0.001) {
								vx += (tangentX / tangentLength) * spiralForce;
								vy += (tangentY / tangentLength) * spiralForce;
							}

							const pullStrength = spiralForce * 0.3;
							vx -= (dx / dist) * pullStrength;
							vy -= (dy / dist) * pullStrength;
						}
					} else if (currentEffect === "default" || currentEffect === "spark") {
						if (distSq < effectRadius * effectRadius && distSq > 0.0001) {
							const force = (1 - dist / effectRadius) * repelStrength;
							vx += (dx / dist) * force;
							vy += (dy / dist) * force;
							vz += (dz / dist) * force;
						}
					}
				}

				// Attract to target
				const attractDx = targetX - px;
				const attractDy = targetY - py;
				const attractDz = targetZ - pz;
				vx += attractDx * attractStrength;
				vy += attractDy * attractStrength;
				vz += attractDz * attractStrength;

				// Damping
				vx *= damping;
				vy *= damping;
				vz *= damping;

				// Update position
				px += vx;
				py += vy;
				pz += vz;

				positionAttribute.setXYZ(j, px, py, pz);

				velocities[idx] = vx;
				velocities[idx + 1] = vy;
				velocities[idx + 2] = vz;

				// Color effects
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
						g = (Math.sin(angle + (Math.PI * 2) / 3) * 0.5 + 0.5) * intensity;
						b = (Math.sin(angle + (Math.PI * 4) / 3) * 0.5 + 0.5) * intensity;
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

		// Cleanup
		return () => {
			cancelAnimationFrame(animationId);
			canvas.removeEventListener("mousemove", handleMouseMove);
			canvas.removeEventListener("mouseleave", handleMouseLeave);
			geometry.dispose();
			material.dispose();
			renderer.dispose();
		};
	}, [currentEffect]);

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

	// Zoom handlers
	const handleZoomIn = () => {
		if (sceneRef.current) {
			sceneRef.current.camera.position.z = Math.max(
				1,
				sceneRef.current.camera.position.z - 0.5,
			);
			sceneRef.current.camera.updateProjectionMatrix();
		}
	};

	const handleZoomOut = () => {
		if (sceneRef.current) {
			sceneRef.current.camera.position.z = Math.min(
				5,
				sceneRef.current.camera.position.z + 0.5,
			);
			sceneRef.current.camera.updateProjectionMatrix();
		}
	};

	return (
		<div className="relative flex items-center justify-center min-h-screen">
			<canvas
				ref={canvasRef}
				width={1200}
				height={600}
				className="block"
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
					onClick={handleZoomIn}
					className="px-5 py-2.5 text-2xl bg-white/10 border border-white text-white cursor-pointer transition-colors hover:bg-white/30"
				>
					+
				</button>
				<button
					onClick={handleZoomOut}
					className="px-5 py-2.5 text-2xl bg-white/10 border border-white text-white cursor-pointer transition-colors hover:bg-white/30"
				>
					-
				</button>
			</div>

			{/* Effect menu */}
			<div className="absolute top-5 left-5 flex flex-col gap-2.5">
				<label htmlFor="effect-select" className="text-lg text-white">
					{""}
				</label>
				<select
					id="effect-select"
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
