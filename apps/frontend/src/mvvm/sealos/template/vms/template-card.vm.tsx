"use client";

import { memo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import type { TemplateItem } from "../models/template-object.model";

export type TemplateCardProps = {
	template: TemplateItem;
	onViewDetails: (template: TemplateItem) => void;
};

export const TemplateCard = memo(function TemplateCard({
	template,
	onViewDetails,
}: TemplateCardProps) {
	const handleClickCard = useCallback(
		() => onViewDetails(template),
		[onViewDetails, template],
	);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				onViewDetails(template);
			}
		},
		[onViewDetails, template],
	);

	return (
		<button
			type="button"
			className="group relative cursor-pointer rounded-xl border border-border/50 p-4 text-left bg-background-secondary hover:bg-background-tertiary min-h-[200px] flex flex-col w-full"
			onClick={handleClickCard}
			onKeyDown={handleKeyDown}
		>
			{/* Header with icon and title */}
			<div className="mb-3 flex items-center gap-4">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted p-1">
					{template.icon ? (
						<img
							alt={`${template.name} icon`}
							className="size-7 rounded-lg"
							height={24}
							src={template.icon}
							width={24}
						/>
					) : (
						<div className="size-6 rounded bg-gray-300" />
					)}
				</div>
				<h2 className="font-semibold text-base leading-tight">
					{template.name}
				</h2>
			</div>

			{/* Description aligned to the left */}
			<div className="mb-4">
				<p className="line-clamp-2 text-muted-foreground text-sm leading-relaxed">
					{template.description || "No description available"}
				</p>
			</div>

			{/* Categories at bottom left */}
			{template.category && template.category.length > 0 && (
				<div className="mt-auto pt-4 flex flex-wrap gap-1">
					{template.category.slice(0, 3).map((category: string) => {
						const displayCategory =
							category.toLowerCase() === "ai"
								? "AI"
								: category.charAt(0).toUpperCase() + category.slice(1);
						return (
							<Badge
								key={category}
								variant="outline"
								className="bg-background-tertiary"
							>
								{displayCategory}
							</Badge>
						);
					})}
				</div>
			)}
		</button>
	);
});
