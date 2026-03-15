import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ensureString(envVar: keyof typeof process.env): string {
  const value = String(process.env[envVar]);
  if (!value) {
    throw new Error(`Environment variable ${envVar} is not set`);
  }
  return value as string;
}
