"use client";

import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTemplateObject } from "@/hooks/template/use-template-object";
import type { TemplateItem } from "../models/template-object.model";

import "@/styles/github-markdown-dark.css";

export type TemplateInfoProps = {
	template: TemplateItem;
	onBack: () => void;
	onDeploy: (template: TemplateItem) => void;
};

export function TemplateInfo({
	template,
	onBack,
	onDeploy,
}: TemplateInfoProps) {
	const [readmeContent, setReadmeContent] = useState<string>("");
	const [isLoadingReadme, setIsLoadingReadme] = useState(false);
	const [isDeploying, setIsDeploying] = useState(false);

	// Fetch template details with resource field
	const { data: templateDetails, isLoading: isLoadingDetails } =
		useTemplateObject(template.name);

	// Log the resource field when template details are loaded
	useEffect(() => {
		if (templateDetails?.resource) {
			console.log("Template resource field:", templateDetails.resource);
		}
	}, [templateDetails?.resource]);

	// Check if template has inputs
	const hasInputs = useMemo(() => {
		return template.input && Object.keys(template.input).length > 0;
	}, [template.input]);

	// Load README content
	useEffect(() => {
		if (template.readme?.startsWith("http")) {
			setIsLoadingReadme(true);
			fetch(template.readme)
				.then((response) => {
					if (!response.ok) {
						throw new Error(`Failed to fetch README: ${response.status}`);
					}
					return response.text();
				})
				.then((content) => {
					setReadmeContent(content);
				})
				.catch((error) => {
					toast.error("Failed to load documentation");
					console.error("Error loading README:", error);
				})
				.finally(() => {
					setIsLoadingReadme(false);
				});
		}
	}, [template.readme]);

	// Handle deploy button click
	const handleDeployClick = async () => {
		setIsDeploying(true);
		try {
			await onDeploy(template);
		} catch (error) {
			toast.error("Failed to deploy template. Please try again.");
			console.error("Deploy error:", error);
		} finally {
			setIsDeploying(false);
		}
	};

	return (
		<div className="flex h-full max-h-full flex-col overflow-y-auto relative">
			{/* Loading overlay */}
			{isDeploying && (
				<div className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm">
					<div className="flex flex-col items-center gap-4">
						<Spinner className="size-8" />
						<p className="text-sm text-muted-foreground">
							Deploying template...
						</p>
					</div>
				</div>
			)}

			{/* Header with back button */}
			<div className="flex shrink-0 items-center gap-4 p-6 pb-4">
				<Button onClick={onBack} size="sm" variant="ghost">
					<ArrowLeft className="mr-2 size-4" />
					Back to Templates
				</Button>
			</div>

			{/* Main content */}
			<div className="flex-1 overflow-y-auto px-6 pb-6">
				<div className="mx-auto max-w-4xl space-y-6">
					{/* Template header with icon and title */}
					<div className="flex items-start gap-4">
						<div className="flex size-16 items-center justify-center rounded-lg bg-muted p-3">
							{template.icon ? (
								<img
									alt={`${template.name} icon`}
									className="size-10"
									height={40}
									src={template.icon}
									width={40}
								/>
							) : (
								<div className="size-10 rounded bg-gray-300" />
							)}
						</div>
						<div className="flex-1 space-y-2">
							<div className="flex items-start justify-between">
								<div className="space-y-2">
									<h1 className="text-2xl font-semibold">{template.name}</h1>
									{template.category && template.category.length > 0 && (
										<div className="flex flex-wrap gap-2">
											{template.category.map((category) => (
												<Badge
													key={category}
													variant="outline"
													className="bg-background-tertiary"
												>
													{category}
												</Badge>
											))}
										</div>
									)}
								</div>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												onClick={handleDeployClick}
												variant="outline"
												disabled={isDeploying}
											>
												{isDeploying
													? "Deploying..."
													: hasInputs
														? "Configure & Deploy"
														: "Deploy"}
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p className="text-sm">
												{hasInputs
													? "This template requires configuration before deployment"
													: "Deploy this template to your project"}
											</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
						</div>
					</div>

					{/* Template information */}
					<div className="space-y-6">
						{/* Description */}
						{template.description && (
							<div>
								<p className="text-muted-foreground leading-relaxed">
									{template.description}
								</p>
							</div>
						)}

						{/* Template details */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="bg-muted/50 rounded-lg p-4">
								<div className="text-sm text-muted-foreground">Deployments</div>
								<div className="text-lg font-semibold">
									{template.deployCount}
								</div>
							</div>
							<div className="bg-muted/50 rounded-lg p-4">
								<div className="text-sm text-muted-foreground">
									Git Repository
								</div>
								<div className="text-sm font-medium truncate">
									<a
										href={template.gitRepo}
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary hover:underline"
									>
										{template.gitRepo}
									</a>
								</div>
							</div>
						</div>

						{/* Input requirements */}
						{hasInputs && (
							<div>
								<h3 className="font-semibold text-lg mb-3">
									Configuration Required
								</h3>
								<div className="bg-muted/50 rounded-lg p-4">
									<p className="text-sm text-muted-foreground mb-2">
										This template requires the following configuration:
									</p>
									<div className="space-y-2">
										{Object.entries(template.input).map(([key, input]) => (
											<div key={key} className="flex items-center gap-2">
												<span className="font-medium text-sm">{key}</span>
												<span className="text-xs text-muted-foreground">
													({input.type})
												</span>
												{input.required && (
													<Badge variant="destructive" className="text-xs">
														Required
													</Badge>
												)}
											</div>
										))}
									</div>
								</div>
							</div>
						)}

						{/* Documentation */}
						{template.readme && (
							<div>
								<h3 className="font-semibold text-lg mb-3">Documentation</h3>
								<div className="markdown-body">
									{isLoadingReadme ? (
										<div className="flex items-center gap-2">
											<Spinner className="size-4" />
											<p>Loading documentation...</p>
										</div>
									) : (
										<Markdown
											remarkPlugins={[remarkGfm]}
											rehypePlugins={[rehypeRaw]}
											components={{
												ol: ({ children, ...props }) => (
													<ol className="list-decimal" {...props}>
														{children}
													</ol>
												),
												ul: ({ children, ...props }) => (
													<ul className="list-disc" {...props}>
														{children}
													</ul>
												),
											}}
										>
											{readmeContent}
										</Markdown>
									)}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
