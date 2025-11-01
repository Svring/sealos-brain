"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Auth } from "@/contexts/auth/auth.state";
import { deriveAuth } from "@/lib/auth/auth.utils";
import { loginUser } from "@/payload/operations/users-operation";
import type { User } from "@/payload-types";

interface SelectUserViewModelProps {
	send: (event: { type: "SET_AUTH"; auth: Auth } | { type: "FAIL" }) => void;
}

export function useSelectUserViewModel({ send }: SelectUserViewModelProps) {
	const router = useRouter();

	const handleUserSelect = async (selectedUser: User) => {
		try {
			const result = await loginUser(selectedUser.username, "123");
			if (result.success && result.user) {
				const authResult = await deriveAuth(
					result.user.kubeconfigEncoded,
					result.user.appToken || "",
				);
				authResult.match(
					(auth) => {
						send({ type: "SET_AUTH", auth });
						router.refresh();
					},
					(error) => {
						toast.error(`Failed to compute regionUrl: ${error.message}`);
						send({ type: "FAIL" });
					},
				);
			} else {
				console.error("Login failed:", result.error);
				send({ type: "FAIL" });
			}
		} catch (error) {
			console.error("Login error:", error);
			send({ type: "FAIL" });
		}
	};

	return {
		handleUserSelect,
	};
}
