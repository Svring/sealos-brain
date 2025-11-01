import type React from "react";
import { AuthAdapter } from "./auth.adapter";

interface AuthProviderProps {
	children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	return <AuthAdapter>{children}</AuthAdapter>;
}
