import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TAG_COLORS: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-700 border-blue-100',
  red: 'bg-red-50 text-red-700 border-red-100',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  purple: 'bg-purple-50 text-purple-700 border-purple-100',
  pink: 'bg-pink-50 text-pink-700 border-pink-100',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  orange: 'bg-orange-50 text-orange-700 border-orange-100',
  teal: 'bg-teal-50 text-teal-700 border-teal-100',
  gray: 'bg-gray-50 text-gray-700 border-gray-100',
};

const COLOR_KEYS = Object.keys(TAG_COLORS);

export const getTagColor = (tag: string) => {
  const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorKey = COLOR_KEYS[hash % COLOR_KEYS.length];
  return TAG_COLORS[colorKey];
};
