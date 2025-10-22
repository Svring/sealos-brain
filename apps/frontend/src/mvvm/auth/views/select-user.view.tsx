"use client";

import { ChevronRight, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Item, ItemContent, ItemGroup, ItemTitle } from "@/components/ui/item";
import type { User } from "@/payload-types";

interface SelectUserViewProps {
	users: User[];
	onUserSelect: (user: User) => void;
}

export function SelectUserView({ users, onUserSelect }: SelectUserViewProps) {
	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<div className="w-full max-w-sm space-y-3">
				<h2 className="text-center text-lg font-semibold">Select User</h2>
				<ItemGroup>
					{users.map((u) => (
						<Item
							size="sm"
							key={u.id}
							className="cursor-pointer hover:bg-muted border border-border"
							onClick={() => onUserSelect(u)}
						>
							<ItemContent className="flex flex-row items-center gap-3">
								<Avatar className="h-8 w-8">
									<AvatarImage
										src={u.avatar?.url || ""}
										alt={u.username || u.email || `User ${u.id}`}
									/>
									<AvatarFallback className="text-xs">
										<UserIcon className="h-4 w-4" />
									</AvatarFallback>
								</Avatar>
								<ItemTitle className="flex-1 text-sm">
									{u.username || u.email || `User ${u.id}`}
								</ItemTitle>
								<ChevronRight className="h-4 w-4 text-muted-foreground" />
							</ItemContent>
						</Item>
					))}
				</ItemGroup>
			</div>
		</div>
	);
}
