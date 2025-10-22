"use client";

import { SearchIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTemplates } from "@/hooks/template/use-templates";
import type { TemplateItem } from "../models/template-object.model";
import { TemplateCard } from "./template-card.vm";
import { TemplateInfo } from "./template-info.vm";

export default function TemplateStore() {
	const { data, isLoading, error } = useTemplates();
	const templates = data?.templates || [];
	const menuKeys = data?.menuKeys || "";
	const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");

	// Extract categories from menuKeys
	const categories = useMemo(() => {
		return menuKeys ? menuKeys.split(",").map((key: string) => key.trim()) : [];
	}, [menuKeys]);

	// Filter templates based on search term and category
	const filteredTemplates = useMemo(() => {
		return (templates as TemplateItem[]).filter((template) => {
			const matchesSearch =
				template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				template.description.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesCategory =
				selectedCategory === "all" ||
				template.category.includes(selectedCategory);

			return matchesSearch && matchesCategory;
		});
	}, [templates, searchTerm, selectedCategory]);

	// Handlers
	const handleViewDetails = useCallback((template: TemplateItem) => {
		setSelectedTemplate(template);
	}, []);

	const handleBackToList = useCallback(() => {
		setSelectedTemplate(null);
	}, []);

	const handleDeploy = useCallback(() => {
		toast.success("Deploy functionality coming soon!");
	}, []);

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div>Loading templates...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div>Error loading templates: {error.message}</div>
			</div>
		);
	}

	// If a template is selected, show the details view
	if (selectedTemplate) {
		return (
			<TemplateInfo
				template={selectedTemplate}
				onBack={handleBackToList}
				onDeploy={handleDeploy}
			/>
		);
	}

	return (
		<>
			{/* ===== Content ===== */}
			<div className="h-full w-full gap-2 flex flex-col overflow-scroll">
				<div className="flex items-start justify-between">
					<div className="gap-2 p-2 pt-4">
						<h1 className="font-bold text-2xl tracking-tight">
							Deploy from templates
						</h1>
					</div>
				</div>

				{/* Scrollable content area */}
				<div className="flex-1 overflow-y-auto gap-4 scrollbar-hide scroll-smooth">
					{/* Fixed search and categories bar */}
					<div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 gap-4 py-2">
						<div className="my-4 mx-1 flex items-end justify-between sm:my-0 sm:items-center">
							<div className="relative">
								<SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									className="h-9 w-40 pl-9 lg:w-[300px]"
									onChange={(e) => setSearchTerm(e.target.value)}
									placeholder="Filter templates..."
									value={searchTerm}
								/>
							</div>
							<div className="flex flex-wrap gap-2">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setSelectedCategory("all")}
									className={`h-9 transition-all duration-200 ${
										selectedCategory === "all" ? "bg-muted" : undefined
									}`}
								>
									All Categories
								</Button>
								{categories.map((category: string) => (
									<Button
										key={category}
										variant="ghost"
										size="sm"
										onClick={() => setSelectedCategory(category)}
										className={`h-9 transition-all duration-200 ${
											selectedCategory === category ? "bg-muted" : undefined
										}`}
									>
										{category.charAt(0).toUpperCase() + category.slice(1)}
									</Button>
								))}
							</div>
						</div>
					</div>

					{/* Templates grid */}
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
						{filteredTemplates.map((template: TemplateItem) => (
							<TemplateCard
								key={template.name}
								onViewDetails={handleViewDetails}
								template={template}
							/>
						))}
					</div>
					{filteredTemplates.length === 0 && (
						<div className="py-8 text-center text-gray-500">
							No templates found matching your criteria
						</div>
					)}
				</div>
			</div>
		</>
	);
}
