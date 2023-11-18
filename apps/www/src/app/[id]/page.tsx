import { createServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import { Bot, Plus } from "lucide-react";
import { cookies } from "next/headers";
import { FourPTable } from "./render-fourp";
import { SwotTable } from "./render-swot";
import { GenBizTable } from "./render-genbiz";
import Link from "next/link";
import { FormFetch } from "@/components/utils/form-fetch";
import { unstable_cache } from "next/cache";
import { ChatBox } from "./chat-box";
import { OneListener } from "./one-listener";

export const runtime = "edge";

export default async function ResultView({
  params: { id },
}: {
  params: {
    id: string;
  };
}) {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const [{ data: input }, { data: fourp }, { data: swot }, { data: genbiz }] =
    await Promise.all([
      getInput(supabase, id),
      getFourp(supabase, id),
      getSwot(supabase, id),
      getGenbiz(supabase, id),
    ] as const);
  console.log("refreshed");
  if (!input) {
    return (
      <main className="grid h-screen place-content-center text-center">
        <div className="text-xs md:text-lg">Whoopsie</div>
        <div className="text-sm">
          If it should show something, please refresh the page.
        </div>
      </main>
    );
  }

  return (
    <main className="grid h-screen w-full grid-rows-3 md:grid-cols-3 md:grid-rows-1">
      <div className="flex flex-col justify-center gap-2 bg-base-100 p-8 md:gap-4">
        <div>
          <label className="label">
            <span className="label-text">Target Audience</span>
          </label>
          <p className="rounded-md border border-primary px-3 py-1 text-xs md:text-lg">
            {input.target_audience}
          </p>
        </div>
        <div>
          <label className="label">
            <span className="label-text">Product Idea</span>
          </label>
          <p className="rounded-md border border-secondary px-3 py-1 text-xs md:text-lg">
            {input.product_idea}
          </p>
        </div>
        <div>
          <label className="label">
            <span className="label-text">Expertise</span>
          </label>
          <p className="rounded-md border border-accent px-3 py-1 text-xs md:text-lg">
            {input.expertise}
          </p>
        </div>
        <div className="text-center">
          <Link href={`/`} className="btn btn-primary btn-sm md:btn-md">
            <Plus className="mr-2 h-6 w-6" />
            New Idea
          </Link>
        </div>
      </div>
      <OneListener
        id={id}
        input={input}
        initialFourP={fourp?.completion ?? ""}
        initialSwot={swot?.completion ?? ""}
        initialGenBiz={genbiz?.completion ?? ""}
      />
    </main>
  );
}

async function getInput(
  supabase: ReturnType<typeof createServerClient>,
  id: string,
) {
  return await unstable_cache(
    async () => await supabase.from("input").select("*").eq("id", id).single(),
    [id, `${id}-input`],
    {
      revalidate: 1000,
      tags: [`${id}-input`],
    },
  )();
}

async function getFourp(
  supabase: ReturnType<typeof createServerClient>,
  id: string,
) {
  return await unstable_cache(
    async () =>
      await supabase
        .from("fourp")
        .select("*")
        .eq("input_id", id)
        .eq("event_type", "stream-end")
        .single(),
    [id, `${id}-fourp`],
    {
      revalidate: 1000,
      tags: [`${id}-fourp`],
    },
  )();
}

async function getSwot(
  supabase: ReturnType<typeof createServerClient>,
  id: string,
) {
  return await unstable_cache(
    async () =>
      await supabase
        .from("swot")
        .select("*")
        .eq("input_id", id)
        .eq("event_type", "stream-end")
        .single(),
    [id, `${id}-swot`],
    {
      revalidate: 1000,
      tags: [`${id}-swot`],
    },
  )();
}

async function getGenbiz(
  supabase: ReturnType<typeof createServerClient>,
  id: string,
) {
  return await unstable_cache(
    async () =>
      await supabase
        .from("genbiz")
        .select("*")
        .eq("input_id", id)
        .eq("event_type", "stream-end")
        .single(),
    [id, `${id}-genbiz`],
    {
      revalidate: 1000,
      tags: [`${id}-genbiz`],
    },
  )();
}

// supabase
//         .from("fourp")
//         .select("*")
//         .eq("input_id", id)
//         .eq("event_type", "stream-end")
//         .single(),
//       supabase
//         .from("swot")
//         .select("*")
//         .eq("input_id", id)
//         .eq("event_type", "stream-end")
//         .single(),
//       supabase
//         .from("genbiz")
//         .select("*")
//         .eq("input_id", id)
//         .eq("event_type", "stream-end")
//         .single(),
