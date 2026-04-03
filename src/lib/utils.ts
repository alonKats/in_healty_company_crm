import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Decimal } from "@prisma/client-runtime-utils"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Recursively serialize Prisma objects for client components.
 * Converts Decimal to number and Date to ISO string.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serialize<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Decimal) return Number(obj) as T;
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
