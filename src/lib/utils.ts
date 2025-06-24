import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { customAlphabet } from "nanoid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Create a custom nanoid with lowercase alphabet and numbers for 7 characters
const nanoid7 = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 7);

/**
 * Generate a new graph name in the format: graph-{nanoid(7)}
 * @returns A unique graph name string
 */
export function generateGraphName(): string {
  return `graph-${nanoid7()}`;
}
