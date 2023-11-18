"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import React from "react";
import { useFormStatus } from "react-dom";

export function SubmitButton({
  children = "Submit",
}: {
  children?: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} size={"lg"}>
      {pending ? (
        <Loader2 className="mr-2 inline-block h-4 w-4 animate-spin" />
      ) : null}
      {children}
    </Button>
  );
}
