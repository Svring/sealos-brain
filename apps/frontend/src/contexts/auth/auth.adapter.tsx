"use client";

import { useMount } from "@reactuses/core";
import { useMachine } from "@xstate/react";
import { createSealosApp, sealosApp } from "@zjy365/sealos-desktop-sdk/app";
import { type ReactNode, use, useEffect } from "react";
import { handleAuthComputation } from "@/lib/auth/auth.utils";
import { SelectUserView } from "@/mvvm/auth/views/select-user.view";
import { useSelectUserViewModel } from "@/mvvm/auth/vms/select-user.vm";
import type { User } from "@/payload-types";
import { authMachineContext } from "./auth.context";
import { authMachine } from "./auth.state";

export function AuthPayloadAdapter({
	children,
	userPromise,
	usersPromise,
}: {
	children: ReactNode;
	userPromise: Promise<User | null>;
	usersPromise: Promise<User[]>;
}) {
	const [state, send] = useMachine(authMachine);
	const users = use(usersPromise);
	const user = use(userPromise);

	// Handle auth state updates in useEffect to avoid setState during render
	useEffect(() => {
		if (user) {
			handleAuthComputation(user.kubeconfigEncoded, user.appToken || "", send);
		} else {
			send({ type: "FAIL" });
		}
	}, [user, send]);

	const { handleUserSelect } = useSelectUserViewModel({ send });

	// If no user found, show user selection
	if (!user) {
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

export function AuthDesktopAdapter({ children }: { children: ReactNode }) {
	const [state, send] = useMachine(authMachine);

	// Get session data on mount
	useMount(async () => {
		createSealosApp();
		const sessionData = await sealosApp.getSession();

		if (sessionData?.kubeconfig) {
			await handleAuthComputation(
				sessionData.kubeconfig,
				sessionData.token || "",
				send,
			);
		} else {
			send({ type: "FAIL" });
		}
	});

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
