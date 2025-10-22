"use server";

import { login, logout } from "@payloadcms/next/auth";
import { headers } from "next/headers";
import { getPayload } from "payload";
import config from "@/payload.config";
import type { User } from "@/payload-types";

// Get the currently authenticated user
export async function getUser(): Promise<User | null> {
	const headersList = await headers();
	const payloadConfig = await config;
	const payload = await getPayload({ config: payloadConfig });
	const { user } = await payload.auth({ headers: headersList });
	return user;
}

// Login user with email and password
export async function loginUser(
	username: string,
	password: string,
): Promise<{
	success: boolean;
	user?: User;
	error?: string;
}> {
	try {
		const payloadConfig = await config;
		const result = await login({
			collection: "users",
			config: payloadConfig,
			username,
			password,
		});

		return {
			success: true,
			user: result.user,
		};
	} catch (error) {
		return {
			success: false,
			error: `Login failed: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

export async function logoutUser(): Promise<{
	success: boolean;
	error?: string;
}> {
	try {
		const payloadConfig = await config;
		await logout({ allSessions: true, config: payloadConfig });
		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: `Logout failed: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

// Get all users
export async function getAllUsers(): Promise<User[]> {
	const payloadConfig = await config;
	const payload = await getPayload({ config: payloadConfig });

	const result = await payload.find({
		collection: "users",
		limit: 10, // Adjust limit as needed
	});

	return result.docs;
}
