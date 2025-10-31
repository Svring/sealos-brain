"use client";

import { cn } from "@sealos-brain/shared/misc/utils";
import * as React from "react";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";

interface ParticleTitleProps {
	text: string;
	className?: string;
}

const ParticleTitle = ({ text, className }: ParticleTitleProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const sceneRef = useRef<{
		scene: THREE.Scene;
		camera: THREE.Camera;
		renderer: THREE.WebGLRenderer;
		points: THREE.Points;
		geometry: THREE.BufferGeometry;
		originalPositions: Float32Array;
		velocities: Float32Array;
		phases: Float32Array;
		particleCount: number;
	} | null>(null);

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
		const pixelRatio = Math.min(window.devicePixelRatio, 2);
		renderer.setPixelRatio(pixelRatio);
		renderer.setSize(displayWidth, displayHeight, false);
		renderer.setClearColor(0x000000, 0); // Transparent background

		// Variables for async setup & cleanup
		let animationId: number;
		let geometry: THREE.BufferGeometry | null = null;
		let material: THREE.PointsMaterial | null = null;
		let points: THREE.Points | null = null;
		let handleResize: (() => void) | null = null;

		// Load the font
		const loader = new FontLoader();
		loader.load(
			"/grafolita.json",
			(font) => {
				// Generate TextGeometry
				const textGeometry = new TextGeometry(text, {
					font: font,
					size: 4.5, // Increased significantly for larger text
					curveSegments: 12,
					bevelEnabled: false,
				});
				textGeometry.computeBoundingBox();

				// Calculate bounding box dimensions
				const boundingBox = textGeometry.boundingBox;
				const textWidth = boundingBox
					? boundingBox.max.x - boundingBox.min.x
					: 10;
				const textHeight = boundingBox
					? boundingBox.max.y - boundingBox.min.y
					: 10;

				// Use fixed view size based on canvas dimensions, not text size
				// This ensures text appears larger when we increase its size
				// Smaller viewSize = larger text appearance
				const aspect = displayWidth / displayHeight;
				const fixedViewSize = 11; // Reduced from 12 to make text appear larger
				const viewSize = fixedViewSize;

				// Position text at bottom instead of center
				// Move text down so bottom edge is near bottom of view
				const bottomOffset = boundingBox ? boundingBox.min.y : 0;
				const centerOffsetX = boundingBox
					? (boundingBox.max.x + boundingBox.min.x) / 2
					: 0;
				textGeometry.translate(
					-centerOffsetX,
					-bottomOffset - viewSize * 1.0, // Increased from 0.6 to move text lower
					0,
				); // Position at bottom with padding

				// Generate particles using MeshSurfaceSampler
				const numParticles = 20000;
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

				// Setup particle system
				const originalPositions = positions.slice();
				const phases = new Float32Array(numParticles);
				const velocities = new Float32Array(numParticles * 3);

				for (let j = 0; j < numParticles; j++) {
					phases[j] = Math.random() * Math.PI * 2;
				}

				geometry = new THREE.BufferGeometry();
				geometry.setAttribute(
					"position",
					new THREE.BufferAttribute(positions, 3),
				);
				geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

				material = new THREE.PointsMaterial({
					size: 0.03,
					sizeAttenuation: true,
					vertexColors: true,
				});

				points = new THREE.Points(geometry, material);
				scene.add(points);

				// Setup orthographic camera bounds to fit text with padding
				// viewSize and aspect already calculated above

				camera.left = -viewSize * aspect;
				camera.right = viewSize * aspect;
				camera.top = viewSize;
				camera.bottom = -viewSize;
				camera.updateProjectionMatrix();

				// Position camera
				camera.position.set(0, 0, 10);
				camera.lookAt(0, 0, 0);

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
					particleCount: numParticles,
				};

				// Store initial view size for resize
				(sceneRef.current as any).initialViewSize = viewSize;
				(sceneRef.current as any).aspect = aspect;

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
						(sceneRef.current as any)?.initialViewSize || viewSize;
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

				// Animation loop - simplified, only default effect
				const animate = (time: number) => {
					if (!sceneRef.current) return;

					time *= 0.001;

					const {
						geometry,
						points,
						originalPositions,
						velocities,
						phases,
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
					const attractStrength = 0.05;
					const damping = 0.95;

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

						// Attract particles back to their target positions
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

						// Set colors (white particles)
						colorAttribute.setXYZ(j, 1, 1, 1);
					}

					positionAttribute.needsUpdate = true;
					colorAttribute.needsUpdate = true;

					renderer.render(scene, camera);
					animationId = requestAnimationFrame(animate);
				};

				animationId = requestAnimationFrame(animate);
			},
			undefined,
			(error) => {
				console.error("An error happened while loading the font:", error);
			},
		);

		// Cleanup
		return () => {
			if (animationId) cancelAnimationFrame(animationId);
			if (handleResize) {
				window.removeEventListener("resize", handleResize);
			}
			if (geometry) geometry.dispose();
			if (material) material.dispose();
			if (points) scene.remove(points);
			renderer.dispose();
			sceneRef.current = null;
		};
	}, [text]);

	return (
		<canvas ref={canvasRef} className={cn("block w-full h-full", className)} />
	);
};

export interface HeroParticlesProps extends React.HTMLAttributes<HTMLElement> {
	text: string;
	subtitle?: React.ReactNode;
	titleClassName?: string;
	subtitleClassName?: string;
}

const HeroParticles = React.forwardRef<HTMLElement, HeroParticlesProps>(
	(
		{ className, text, subtitle, titleClassName, subtitleClassName, ...props },
		ref,
	) => {
		return (
			<section
				ref={ref}
				className={cn(
					"relative z-0 flex h-[43vh] w-full items-end justify-center overflow-hidden rounded-md bg-transparent",
					className,
				)}
				{...props}
			>
				<div className="relative z-50 container flex justify-center flex-1 flex-col px-5 md:px-10 gap-4 -translate-y-7">
					<div className="flex flex-col items-center text-center gap-2">
						<div
							className={cn(
								"w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] flex items-center justify-center",
								titleClassName,
							)}
						>
							<ParticleTitle text={text} />
						</div>
						{subtitle && (
							<p
								className={cn(
									"text-xl text-muted-foreground p-0 m-0 animate-fade-in",
									subtitleClassName,
								)}
								style={{
									animationDelay: "0.8s",
								}}
							>
								{subtitle}
							</p>
						)}
					</div>
				</div>
			</section>
		);
	},
);
HeroParticles.displayName = "HeroParticles";

export { HeroParticles };
