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
      className="grid grid-cols-10 gap-2 p-4 odd:bg-base-200 even:bg-base-300"
      style={{
        placeItems: "center start",
      }}
    >
      <span className="p-2">
        <Bot className="h-6 w-6" />
      </span>
      <div className={cn(className, "col-span-9 flex flex-col gap-2")}>
        {children}
      </div>
    </div>
  );
}
