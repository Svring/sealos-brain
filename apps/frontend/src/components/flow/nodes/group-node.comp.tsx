"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const groupNodeVariants = cva(
	"relative cursor-grab rounded-xl border border-dashed border-muted-foreground/45 bg-transparent hover:border-muted-foreground/60 transition-colors",
	{
		variants: {
			size: {
				default: "h-50 w-70",
				flat: "h-14 w-70",
				large: "h-60 w-80",
			},
		},
		defaultVariants: {
			size: "default",
		},
	},
);

export interface GroupNodeProps extends ComponentProps<"button">, VariantProps<typeof groupNodeVariants> {
	label?: string;
	labelPosition?: "bottom-left" | "bottom-right" | "top-left" | "top-right" | "center";
}

export function GroupNode({
	className,
	size = "default",
	label = "Group",
	labelPosition = "bottom-left",
	onClick,
	...props
}: GroupNodeProps) {
	const positionClasses = {
		"bottom-left": "absolute bottom-2 left-2",
		"bottom-right": "absolute bottom-2 right-2",
		"top-left": "absolute top-2 left-2",
		"top-right": "absolute top-2 right-2",
		center: "absolute inset-0 flex items-center justify-center",
	};

	return (
		<button
			type="button"
			className={cn(groupNodeVariants({ size, className }))}
			onClick={onClick}
			{...props}
		>
			<div className={cn(
				positionClasses[labelPosition],
				"text-sm font-medium text-muted-foreground pointer-events-none"
			)}>
				{label}
			</div>
		</button>
	);
}