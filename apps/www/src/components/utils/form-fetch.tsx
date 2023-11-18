"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { Database } from "@/types/supabase";
import { renderPrompt } from "@/lib/text";

export function FormFetch({
  route,
  input,
  id,
  completion,
  children,
}: {
  route: string;
  id: string;
  input: NonNullable<Database["public"]["Tables"]["input"]["Row"]>;
  completion?: string | null;
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const prompt = renderPrompt(input);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        await fetch(route, {
          body: JSON.stringify({
            prompt,
            id,
            completion,
          }),
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        setLoading(false);
      }}
    >
      <Button type="submit" disabled={loading}>
        {loading ? (
          <Loader2 className="mr-2 inline-block h-4 w-4 animate-spin" />
        ) : null}
        {children}
      </Button>
    </form>
  );
}
