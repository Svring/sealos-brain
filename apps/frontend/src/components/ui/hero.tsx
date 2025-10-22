"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TextRevealProps {
	text: string;
	className?: string;
	delay?: number;
}

const TextReveal = ({ text, className, delay = 0 }: TextRevealProps) => {
	const words = text.split(" ");
	let charIndex = 0;

	return (
		<div className={cn("overflow-hidden", className)}>
			{words.map((word, _) => (
				<span key={word} className="inline-block whitespace-nowrap mr-4">
					{word.split("").map((char, _) => {
						const currentDelay = delay + charIndex * 0.03;
						charIndex++;
						return (
							<span
								key={charIndex}
								className="inline-block animate-text-reveal"
								style={{
									animationDelay: `${currentDelay}s`,
								}}
							>
								{char}
							</span>
						);
					})}
				</span>
			))}
		</div>
	);
};

interface ActionProps {
	variant?:
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link";
	href?: string;
	label: string;
	onClick?: () => void;
}

export interface HeroProps extends React.HTMLAttributes<HTMLElement> {
	gradient?: boolean;
	blur?: boolean;
	heroTitle: React.ReactNode;
	subtitle?: React.ReactNode;
	actions?: ActionProps[];
	titleClassName?: string;
	subtitleClassName?: string;
	actionsClassName?: string;
}

const Hero = React.forwardRef<HTMLElement, HeroProps>(
	(
		{
			className,
			gradient = true,
			blur = true,
			heroTitle,
			subtitle,
			actions,
			titleClassName,
			subtitleClassName,
			actionsClassName,
			...props
		},
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
						<h1
							className={cn(
								"text-foreground text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight p-0 m-0",
								titleClassName,
							)}
						>
							<TextReveal text={String(heroTitle)} delay={0.3} />
						</h1>
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
						{actions && actions.length > 0 && (
							<div className={cn("flex gap-4 p-0 m-0", actionsClassName)}>
								{actions.map((action: ActionProps) => (
									<Button
										key={action.label}
										variant={action.variant || "default"}
										onClick={action.onClick}
									>
										{action.label}
									</Button>
								))}
							</div>
						)}
					</div>
				</div>
			</section>
		);
	},
);
Hero.displayName = "Hero";

export { Hero };
