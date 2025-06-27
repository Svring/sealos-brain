import { customAlphabet } from "nanoid";

// Create a custom nanoid with lowercase alphabet and size 12
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz", 12);

// Regex patterns defined at top level for performance
const BUCKET_NAME_REGEX = /^[a-z0-9-]+$/;

/**
 * Validate object storage bucket names (basic validation)
 */
export function validateBucketNames(names: (string | undefined)[]): {
  isValid: boolean;
  invalidNames: string[];
} {
  const validNames = names.filter((n): n is string => Boolean(n));
  const invalidNames = validNames.filter(
    (name) => !name || name.trim().length === 0 || !BUCKET_NAME_REGEX.test(name)
  );

  return {
    isValid: invalidNames.length === 0,
    invalidNames,
  };
}

/**
 * Generate a random bucket name
 */
export function generateBucketName(): string {
  return `bucket-${nanoid()}`;
}
