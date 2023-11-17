import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CohereChat } from "./cohere-chat";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/utils/submit-button";

export default function Home() {
  return (
    <main className="container flex h-screen flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-primary">Revamp</h1>
      <h2 className="text-xl text-accent">Ideas are cheap. Steal them.</h2>

      <form
        action={async (formData: FormData) => {
          "use server";
          const cookieStore = cookies();

          const supabase = createServerClient(cookieStore);

          const target_audience = formData.get("targetAudience")! as string;
          const product_idea = formData.get("productIdea")! as string;
          const expertise = formData.get("expertise")! as string;

          const { data, error } = await supabase
            .from("input")
            .insert({
              target_audience,
              product_idea,
              expertise,
            })
            .select("id")
            .single();

          if (error) {
            console.error(error);
            return { data: null, error };
          }

          redirect(`/${data.id}`);
        }}
        className="form-control mt-8 w-full max-w-xl gap-2"
      >
        <div className="flex w-full flex-col">
          <label className="label">Target Audience</label>
          <input
            className="input input-bordered input-lg"
            name="targetAudience"
            placeholder="Student K-12 who are struggling with math"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="label">Product Idea</label>
          <input
            className="input input-bordered input-lg"
            name="productIdea"
            placeholder="A math learning app that uses AI to help students learn math"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="label">Expertise & Interest</label>
          <input
            className="input input-bordered input-lg"
            name="expertise"
            placeholder="Web development, AI, Math"
          />
        </div>

        <div className="flex justify-end">
          <SubmitButton>Generate</SubmitButton>
        </div>
      </form>
    </main>
  );
}
