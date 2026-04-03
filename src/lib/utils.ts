import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Detect Prisma Decimal by shape (instanceof fails across module boundaries)
function isDecimal(obj: unknown): boolean {
  if (obj === null || obj === undefined || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return "s" in o && "e" in o && "d" in o && typeof o.toFixed === "function";
}

/**
 * Recursively serialize Prisma objects for client components.
 * Converts Decimal to number and Date to ISO string.
 */
export function serialize<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (isDecimal(obj)) return Number(obj) as T;
  if (obj instanceof Date) return obj.toISOString() as T;
  if (Array.isArray(obj)) return obj.map(serialize) as T;
  if (typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = serialize(value);
    }
    return result as T;
  }
  return obj;
}
