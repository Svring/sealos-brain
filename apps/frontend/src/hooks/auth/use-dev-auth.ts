"use client";

import { useMount } from "@reactuses/core";
import { err, ok, ResultAsync } from "neverthrow";
import { useState } from "react";
import { toast } from "sonner";
import type { EventFrom } from "xstate";
import type { authMachine } from "@/contexts/auth/auth.state";
import { deriveAuth } from "@/lib/auth/auth.utils";
import { getAllUsers, getUser } from "@/payload/operations/users-operation";
import type { User } from "@/payload-types";

export function useDevAuth(
	send: (event: EventFrom<typeof authMachine>) => void,
) {
	const [users, setUsers] = useState<User[] | null>(null);

	// Fetch user on mount and route to appropriate auth logic
	useMount(async () => {
		ResultAsync.fromPromise(
			getUser(),
			(error) => new Error(`Failed to get user: ${error}`),
		)
			.andThen((user) => {
				if (user) {
					return ok(user);
				}
				return err(new Error("No user found"));
			})
			.then((userResult) => {
				userResult.match(
					(user) => {
						// User exists, derive auth
						deriveAuth(user.kubeconfigEncoded, user.appToken || "").then(
							(authResult) => {
								authResult.match(
									(auth) => {
										send({ type: "SET_AUTH", auth });
									},
									(error) => {
										toast.error(
											`Failed to compute regionUrl: ${error.message}`,
										);
										send({ type: "FAIL" });
									},
								);
							},
						);
					},
					async () => {
						// No user found, fetch all users for selection
						const allUsersResult = await ResultAsync.fromPromise(
							getAllUsers(),
							(error) => new Error(`Failed to get users: ${error}`),
						);
						allUsersResult.match(
							(allUsers) => {
								setUsers(allUsers);
							},
							(error) => {
								toast.error(`Failed to fetch users: ${error.message}`);
								send({ type: "FAIL" });
							},
						);
					},
				);
			});
	});

	return { users };
}
