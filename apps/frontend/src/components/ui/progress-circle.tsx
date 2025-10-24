"use client";

import { cn } from "@sealos-brain/shared/misc/utils";
import * as React from "react";

interface ProgressCircleProps {
	value: number;
	size?: number;
	strokeWidth?: number;
	className?: string;
	indicatorClassName?: string;
	trackClassName?: string;
	children?: React.ReactNode;
}

const ProgressCircle = React.forwardRef<HTMLDivElement, ProgressCircleProps>(
	(
		{
			value,
			size = 32,
			strokeWidth = 2,
			className,
			indicatorClassName,
			trackClassName,
			children,
			...props
		},
		ref,
	) => {
		const radius = (size - strokeWidth) / 2;
		const circumference = radius * 2 * Math.PI;
		const strokeDasharray = circumference;
		const strokeDashoffset = circumference - (value / 100) * circumference;

		return (
			<div
				ref={ref}
				className={cn("relative flex items-center justify-center", className)}
				style={{ width: size, height: size }}
				{...props}
			>
				<svg width={size} height={size} className="absolute inset-0 -rotate-90">
					{/* Track circle */}
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						stroke="currentColor"
						strokeWidth={strokeWidth}
						fill="none"
						className={cn("text-muted-foreground/20", trackClassName)}
					/>
					{/* Progress circle */}
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						stroke="currentColor"
						strokeWidth={strokeWidth}
						fill="none"
						strokeDasharray={strokeDasharray}
						strokeDashoffset={strokeDashoffset}
						className={cn(
							"transition-all duration-300 ease-out",
							indicatorClassName,
						)}
						style={{
							strokeLinecap: "round",
						}}
					/>
				</svg>
				{/* Children content */}
				{children && (
					<div className="relative z-10 flex items-center justify-center">
						{children}
					</div>
				)}
			</div>
		);
	},
);

ProgressCircle.displayName = "ProgressCircle";

export { ProgressCircle };
