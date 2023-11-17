import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CohereChat } from "./cohere-chat";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <CohereChat />
    </main>
  );
}
