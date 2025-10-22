"use client";

import type { ReactNode } from "react";
import type { ResourceTarget } from "@/mvvm/k8s/models/k8s.model";
import { BaseNode } from "./base-node";

interface NodeHemProps {
	target: ResourceTarget;
	mainCard: ReactNode;
	hemCard: ReactNode;
}

export default function NodeHem({
	target,
	mainCard,
	hemCard,
}: NodeHemProps) {
	// Single background card with offset
	const offset = 6;
	const rotationAngle = -3;

	const backgroundCard = (
		<div
			className="absolute inset-0 transition-transform duration-300 ease-out"
			style={{
				transform: `translate(${offset}px, -${offset}px) rotate(${rotationAngle}deg)`,
				transformOrigin: "top left",
				zIndex: 1,
			}}
		>
			<BaseNode target={target}>
				{hemCard}
			</BaseNode>
		</div>
	);

	return (
		<div className="relative">
			{/* Background card */}
			{backgroundCard}

			{/* Front card (main component) */}
			<div
				style={{
					zIndex: 2,
					position: "relative",
				}}
				className="cursor-default"
			>
				{mainCard}
			</div>
		</div>
	);
}
