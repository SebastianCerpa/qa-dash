/**
 * Utility functions for the application
 */
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with clsx and tailwind-merge
 * @param inputs - Class names to combine
 * @returns Combined class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string to a human-readable format
 * @param date - The date to format (string, Date object, or undefined)
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date | undefined): string => {
  if (!date) return '-';
  
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};