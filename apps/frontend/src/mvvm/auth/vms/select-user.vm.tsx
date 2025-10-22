"use client";

import { useRouter } from "next/navigation";
import type { Auth } from "@/contexts/auth/auth.state";
import { handleAuthComputation } from "@/lib/auth/auth.utils";
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
				await handleAuthComputation(
					result.user.kubeconfigEncoded,
					result.user.appToken || "",
					send,
				);
				router.refresh();
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
