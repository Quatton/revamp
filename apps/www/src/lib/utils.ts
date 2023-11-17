import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertSnakeCaseToCamelCase(str: string) {
  return str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace("-", "").replace("_", ""),
  );
}

export function convertKeysFromSnakeToCamelCase(obj: Record<string, unknown>) {
  const newObj: Record<string, unknown> = {};
  for (const key in obj) {
    const newKey = convertSnakeCaseToCamelCase(key);
    newObj[newKey] = obj[key];
  }
  return newObj as unknown;
}
