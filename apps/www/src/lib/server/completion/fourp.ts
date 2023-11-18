import { createServerClient } from "@/lib/supabase/server";
import { convertKeysFromSnakeToCamelCase } from "@/lib/utils";
import { CohereStream } from "ai";
import { StreamedChatResponse } from "cohere-ai/api";
import { cookies } from "next/headers";
import { getPrompt, streamToSupabase } from "./stream";
import { revalidatePath } from "next/cache";

const instruction = `CONTEXT:  
You are Revamp, a world-class marketing and entrepreneurship expert known for revitalizing businesses. 

TASK:
Conduct a web-search to find companies similar to the USER PROFILE.
Compile a marketing profile for 10 competitors by researching their product, pricing, place, and promotion strategies.
Make sure to include only real companies that are currently in operation.

OPTIONAL:
You can add site:x.com, site:reddit.com, site:producthunt.com, or site:news.ycombinator.com to your search query to limit your search to a specific website.

RESPONSE FORMAT:
Return a table with 4 columns:
| Company Name | Product | Pricing | Place | Promotion |
|--------------|---------|---------|-------|-----------|
| [Company's name] | Product: [Value proposition: one concise statement describing the product] | Price: [Pricing strategies, sales or discounts, popular pricing plan or tier] | Place: [Sales funnel and distribution methods, demographics and regions served, global or local operation] | Promotion: [Promotion channels, core brand message] |`;

export async function startFourP({
  id,
  prompt,
}: {
  id: string;
  prompt: string;
}) {
  const supabase = createServerClient(cookies());
  const body = JSON.stringify({
    message: `${instruction}\n\n${prompt}`,
    model: "command",
    temperature: 0.7,
    connectors: [{ id: "web-search" }],
    citation_quality: "accurate",
    stream: true,
  });

  const response = await fetch("https://api.cohere.ai/v1/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
    },
    body,
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  await streamToSupabase(supabase, response, id, "fourp");
  revalidatePath(`/${id}`);
  return;
}
