import { SubmitButton } from "@/components/utils/submit-button";
import { startFourP } from "@/lib/server/completion/fourp";
import { createServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import { Bot, Plus } from "lucide-react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { FourPTable } from "./render-fourp";
import { startSWOT } from "@/lib/server/completion/swot";
import { SwotTable } from "./render-swot";
import { GenBizTable } from "./render-genbiz";
import { startGenBiz } from "@/lib/server/completion/genbiz";
import { Database } from "@/types/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

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
      supabase.from("input").select("*").eq("id", id).single(),
      supabase
        .from("fourp")
        .select("*")
        .eq("input_id", id)
        .eq("event_type", "stream-end")
        .single(),
      supabase
        .from("swot")
        .select("*")
        .eq("input_id", id)
        .eq("event_type", "stream-end")
        .single(),
      supabase
        .from("genbiz")
        .select("*")
        .eq("input_id", id)
        .eq("event_type", "stream-end")
        .single(),
    ] as const);

  if (!input) {
    return (
      <main className="grid h-screen place-content-center text-center">
        <div className="text-lg">Whoopsie</div>
        <div className="text-sm">
          If it should show something, please refresh the page.
        </div>
      </main>
    );
  }

  return (
    <main className="grid h-screen w-full grid-cols-3">
      <div className="flex flex-col justify-center gap-4 bg-base-200 p-8">
        <div>
          <label className="label">
            <span className="label-text">Target Audience</span>
          </label>
          <p className="rounded-md border border-primary px-3 py-1 text-lg">
            {input.target_audience}
          </p>
        </div>
        <div>
          <label className="label">
            <span className="label-text">Product Idea</span>
          </label>
          <p className="rounded-md border border-secondary px-3 py-1 text-lg">
            {input.product_idea}
          </p>
        </div>
        <div>
          <label className="label">
            <span className="label-text">Expertise</span>
          </label>
          <p className="rounded-md border border-accent px-3 py-1 text-lg">
            {input.expertise}
          </p>
        </div>
        <div className="text-center">
          <Link href={`/`} className="btn btn-primary">
            <Plus className="mr-2 h-6 w-6" />
            New Idea
          </Link>
        </div>
      </div>
      <div className="col-span-2 overflow-y-auto">
        <ChatBox>
          <p>{"First let's start with researching the existing businesses"}</p>
          <form
            action={async () => {
              "use server";
              await startFourP({ id });
            }}
          >
            <SubmitButton>
              {fourp?.completion ? "Restart" : "Start"}
            </SubmitButton>
          </form>
        </ChatBox>
        <ChatBox>
          <FourPTable id={id} initialData={fourp?.completion ?? ""} />
        </ChatBox>
        {fourp?.event_type === "stream-end" && (
          <>
            <ChatBox>
              <p>
                {
                  "Now we can analyze their strengths and weaknesses! (Let's see if we can do better)"
                }
              </p>
              <form
                action={async () => {
                  "use server";
                  await startSWOT({
                    id,
                    completion: fourp?.completion!,
                  });
                }}
              >
                <SubmitButton>
                  {swot?.completion ? "Restart" : "Start"}
                </SubmitButton>
              </form>
            </ChatBox>
            <ChatBox>
              <SwotTable id={id} initialData={swot?.completion ?? ""} />
            </ChatBox>
          </>
        )}
        {swot?.event_type === "stream-end" && (
          <>
            <ChatBox>
              <p>
                {
                  "Now we can analyze their strengths and weaknesses! (Let's see if we can do better)"
                }
              </p>
              <form
                action={async () => {
                  "use server";
                  await startGenBiz({
                    id,
                    completion: swot?.completion!,
                  });
                }}
              >
                <SubmitButton>
                  {genbiz?.completion ? "Restart" : "Start"}
                </SubmitButton>
              </form>
            </ChatBox>
            <ChatBox>
              <GenBizTable id={id} initialData={genbiz?.completion ?? ""} />
            </ChatBox>
          </>
        )}
      </div>
    </main>
  );
}

function ChatBox({
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
