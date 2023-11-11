import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Button>Button</Button>
      <Button variant="destructive">Button</Button>
      <Button variant="ghost">Button</Button>

      <Button variant="outline">Button</Button>
      <Input placeholder="Input" />
    </main>
  );
}
