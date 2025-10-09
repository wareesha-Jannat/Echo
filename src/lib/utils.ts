import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDate, formatDistanceToNow } from "date-fns";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeDate(from: Date) {
  const currentDate = new Date();
  if (currentDate.getTime() - from.getTime() < 24 * 60 * 60 * 1000) {
    return formatDistanceToNow(from, { addSuffix: true });
  } else {
    if (currentDate.getFullYear === from.getFullYear) {
      return formatDate(from, "MMM d");
    } else {
      return formatDate(from, "MMM d, yyy");
    }
  }
}

export function generateRandomCode() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function formatNumber(n: number): string {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

export function getPublicIdFromUrl(url: string): string | null {
  const cleanUrl = url.split("?")[0];
  const parts = cleanUrl.split("/upload/");
  if (parts.length < 2) return null;
  const segments = parts[1].split("/");
  // Remove version segment if present (like "v1759331497")
  if (/^v[0-9]+$/.test(segments[0])) {
    segments.shift();
  }
    // Join all remaining parts, then strip extension
  return segments.join("/").replace(/\.[^/.]+$/, "");
}
