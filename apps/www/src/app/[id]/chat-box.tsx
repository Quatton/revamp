import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import { Bot } from "lucide-react";

export function ChatBox({
  className,
  children,
}: {
  className?: ClassValue;
  children: React.ReactNode;
}) {
  return (
    <div
      className="grid w-full grid-cols-[auto,1fr] gap-4 overflow-x-hidden p-4 odd:bg-base-200 even:bg-base-300"
      style={{
        placeItems: "center start",
      }}
    >
      <span className="place-self-start p-2">
        <Bot className="h-6 w-6" />
      </span>
      <div
        className={cn(className, "flex w-full flex-col gap-2 overflow-x-auto")}
      >
        {children}
      </div>
    </div>
  );
}
