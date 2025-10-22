"use client";

import { LayoutGrid, LogOut, MessageCirclePlus, Sparkles } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthEvents } from "@/contexts/auth/auth.context";
import { useEnvState } from "@/contexts/env/env.context";
import { useQuota } from "@/hooks/k8s/use-quota";
import { logoutUser } from "@/payload/operations/users-operation";

// Menu items.
const mainItems = [
	{
		title: "New",
		url: "/new",
		icon: MessageCirclePlus,
	},
	{
		title: "Project",
		url: "/project",
		icon: LayoutGrid,
	},
];

export function AppSidebar() {
	const { fail } = useAuthEvents();
	const router = useRouter();
	const pathname = usePathname();
	const { data: quotaObject, isLoading } = useQuota();
	const { mode } = useEnvState();

	return (
		<Sidebar variant="inset" collapsible="icon">
			<SidebarHeader>
				<div className="flex items-center gap-2">
					<div className="flex aspect-square size-8 items-center justify-center rounded-lg">
						<img
							src="/sealos-brain-icon-grayscale.svg"
							className="grayscale"
							alt="Sealos Brain"
							width={28}
							height={28}
						/>
					</div>
					<span className="truncate font-medium text-sidebar-foreground group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 transition-all duration-200">
						Sealos Brain
					</span>
				</div>
			</SidebarHeader>
			<SidebarSeparator />
			<SidebarContent>
				{/* Main Actions */}
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{mainItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild isActive={pathname === item.url}>
										<a href={item.url}>
											<item.icon />
											<span>{item.title}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<Popover>
							<PopoverTrigger asChild>
								<SidebarMenuButton>
									<Sparkles className="h-4 w-4" />
									<span>Quota</span>
								</SidebarMenuButton>
							</PopoverTrigger>
							<PopoverContent
								align="end"
								side="right"
								sideOffset={16}
								className="w-80 bg-background-tertiary"
							>
								<div className="space-y-4">
									{isLoading ? (
										<div className="space-y-2">
											<Skeleton className="h-4 w-full" />
											<Skeleton className="h-2 w-full" />
											<Skeleton className="h-4 w-3/4" />
										</div>
									) : quotaObject ? (
										<div className="space-y-4">
											{/* Resource Quotas - 2x2 Grid */}
											<div className="grid grid-cols-2 gap-3">
												<div className="flex justify-between text-xs">
													<span className="text-muted-foreground">CPU</span>
													<span className="text-primary">
														{quotaObject.cpu?.used.toFixed(1)}/
														{quotaObject.cpu?.limit}
													</span>
												</div>
												<div className="flex justify-between text-xs">
													<span className="text-muted-foreground">Memory</span>
													<span className="text-primary">
														{quotaObject.memory?.used.toFixed(1)}/
														{quotaObject.memory?.limit}
													</span>
												</div>
												<div className="flex justify-between text-xs">
													<span className="text-muted-foreground">Storage</span>
													<span className="text-primary">
														{quotaObject.storage?.used}/
														{quotaObject.storage?.limit}
													</span>
												</div>
												<div className="flex justify-between text-xs">
													<span className="text-muted-foreground">Ports</span>
													<span className="text-primary">
														{quotaObject.ports?.used}/{quotaObject.ports?.limit}
													</span>
												</div>
											</div>
										</div>
									) : (
										<div className="space-y-2">
											<p className="text-sm text-muted-foreground">
												Resource information is temporarily unavailable.
											</p>
										</div>
									)}
								</div>
							</PopoverContent>
						</Popover>
					</SidebarMenuItem>
					{mode === "development" && (
						<SidebarMenuItem>
							<SidebarMenuButton
								onClick={async () => {
									const result = await logoutUser();
									if (result.success) {
										fail();
										router.replace("/");
										router.refresh();
									}
								}}
							>
								<LogOut />
								<span>Logout</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					)}
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
