import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("₹", "₹ ");
}

export function getBillingCycle(dateString: string): string {
  const date = new Date(dateString);
  const month = date.getMonth() + (date.getDate() > 15 ? 1 : 0);
  const year = date.getFullYear() + (month > 11 ? 1 : 0);
  return `${new Date(year, month % 12).toLocaleString("default", {
    month: "short",
  })} ${year}`;
}

export function getCurrentMonthYear(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function formatDate(dateString: string, format: string = "medium"): string {
  const date = new Date(dateString);
  
  switch (format) {
    case "short":
      return date.toLocaleDateString("en-IN");
    case "medium":
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    case "long":
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    case "monthYear":
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
      });
    default:
      return date.toLocaleDateString("en-IN");
  }
}