import type React from "react";
import { getAllUsers, getUser } from "@/payload/operations/users-operation";
import { AuthDesktopAdapter, AuthPayloadAdapter } from "./auth.adapter";

interface AuthProviderProps {
	children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	// Read environment variables (server-side)
	const mode =
		(process.env.MODE as "development" | "production") || "production";

	// Only render AuthPayloadAdapter in development mode
	if (mode === "development") {
		// Create the promises that will be resolved by the adapter
		// Wrap promises to handle rejection gracefully
		const userPromise = getUser(), usersPromise = getAllUsers();
		return (
			<AuthPayloadAdapter userPromise={userPromise} usersPromise={usersPromise}>
				{children}
			</AuthPayloadAdapter>
		);
	}

	// In production mode, render AuthDesktopAdapter
	return <AuthDesktopAdapter>{children}</AuthDesktopAdapter>;
}
