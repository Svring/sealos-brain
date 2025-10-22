import { type ClassValue, clsx } from "clsx";
import { customAlphabet } from "nanoid";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 6);

// Helper function to create number union schema
export function createNumberUnionSchema<T extends readonly number[]>(values: T) {
	return z.number().refine((val) => values.includes(val as T[number]), {
		message: `Value must be one of: ${values.join(", ")}`,
	});
}
