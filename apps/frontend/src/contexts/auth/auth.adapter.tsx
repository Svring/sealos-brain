"use client";

import { useMachine } from "@xstate/react";
import type { ReactNode } from "react";
import { useModeState } from "@/contexts/mode/mode.context";
import { useDevAuth } from "@/hooks/auth/use-dev-auth";
import { useProdAuth } from "@/hooks/auth/use-prod-auth";
import { useTrialAuth } from "@/hooks/auth/use-trial-auth";
import { SelectUserView } from "@/mvvm/auth/views/select-user.view";
import { useSelectUserViewModel } from "@/mvvm/auth/vms/select-user.vm";
import { authMachineContext } from "./auth.context";
import { authMachine } from "./auth.state";

export function AuthDevAdapter({ children }: { children: ReactNode }) {
	const [state, send] = useMachine(authMachine);
	const { users } = useDevAuth(send);

	const { handleUserSelect } = useSelectUserViewModel({ send });

	// If no user found, show user selection
	if (users) {
		return <SelectUserView users={users} onUserSelect={handleUserSelect} />;
	}

	if (state.matches("initializing") || !state.matches("ready")) {
		return null;
	}

	return (
		<authMachineContext.Provider
			value={{ auth: state.context.auth, state, send }}
		>
			{children}
		</authMachineContext.Provider>
	);
}

export function AuthProdAdapter({ children }: { children: ReactNode }) {
	const [state, send] = useMachine(authMachine);

	useProdAuth(send);

	// Block children until auth is ready
	if (state.matches("initializing") || !state.matches("ready")) {
		return null;
	}

	return (
		<authMachineContext.Provider
			value={{ auth: state.context.auth, state, send }}
		>
			{children}
		</authMachineContext.Provider>
	);
}

export function AuthTrialAdapter({ children }: { children: ReactNode }) {
	const [state, send] = useMachine(authMachine);

	useTrialAuth(send);

	// Block children until auth is ready
	if (state.matches("initializing") || !state.matches("ready")) {
		return null;
	}

	return (
		<authMachineContext.Provider
			value={{ auth: state.context.auth, state, send }}
		>
			{children}
		</authMachineContext.Provider>
	);
}

export function AuthAdapter({ children }: { children: ReactNode }) {
	// Read mode from context to decide which adapter to use
	const { isDev, isTrial } = useModeState();

	// Route to appropriate adapter based on mode
	if (isTrial) {
		return <AuthTrialAdapter>{children}</AuthTrialAdapter>;
	}

	if (isDev) {
		return <AuthDevAdapter>{children}</AuthDevAdapter>;
	}

	// Default to prod adapter for prod or demo mode
	return <AuthProdAdapter>{children}</AuthProdAdapter>;
}
