"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const infoVariants = cva(
	"flex flex-col rounded-lg border bg-background-tertiary text-card-foreground shadow-sm",
	{
		variants: {
			size: {
				default: "p-4",
				compact: "p-3",
				large: "p-6",
			},
			variant: {
				default: "border-border",
				accent: "border-accent",
				destructive: "border-destructive",
				outline: "border-2",
			},
		},
		defaultVariants: {
			size: "default",
			variant: "default",
		},
	},
);

// Root container
export const Root = ({
	className,
	size = "default",
	variant = "default",
	asChild = false,
	...props
}: ComponentProps<"div"> &
	VariantProps<typeof infoVariants> & {
		asChild?: boolean;
	}) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="info-root"
			className={cn(infoVariants({ size, variant, className }))}
			{...props}
		/>
	);
};

// Header section
export const Header = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="info-header"
			className={cn("flex items-center justify-between", className)}
			{...props}
		/>
	);
};

// Content section
export const Content = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="info-content"
			className={cn("flex-1 py-2", className)}
			{...props}
		/>
	);
};

// Footer section
export const Footer = ({
	className,
	asChild = false,
	...props
}: ComponentProps<"div"> & { asChild?: boolean }) => {
	const Comp = asChild ? Slot : "div";
	return (
		<Comp
			data-slot="info-footer"
			className={cn("mt-auto flex items-center justify-between pt-2", className)}
			{...props}
		/>
	);
};
