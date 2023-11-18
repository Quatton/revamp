import { Database } from "@/types/supabase";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { createBrowseClient } from "./supabase/browser";
import { StreamedChatResponse } from "cohere-ai/api";

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

export function getSupabaseSubscriber(
  supabase: ReturnType<typeof createBrowseClient>,
  table: keyof Omit<Database["public"]["Tables"], "input">,
  id: string,
  callback: (
    data: Database["public"]["Tables"][typeof table]["Row"] | null,
  ) => void,
) {
  return supabase
    .channel(table)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table,
        filter: `input_id=eq.${id}`,
      },
      (payload) => {
        callback(payload.new as any);
      },
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table,
        filter: `input_id=eq.${id}`,
      },
      (payload) => {
        callback(payload.new as any);
      },
    )
    .on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table,
        filter: `input_id=eq.${id}`,
      },
      () => {
        callback(null as any);
      },
    )
    .subscribe();
}
