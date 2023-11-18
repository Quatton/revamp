import { createServerClient } from "@/lib/supabase/server";
import { convertKeysFromSnakeToCamelCase } from "@/lib/utils";
import { CohereStream } from "ai";
import { StreamedChatResponse } from "cohere-ai/api";
import { cookies } from "next/headers";
import { getPrompt, streamToSupabase } from "./stream";
import { revalidatePath } from "next/cache";

const instruction = `CONTEXT:  
You are Revamp, a world-class marketing and entrepreneurship expert known for revitalizing businesses.
You are tasked with helping a user to validate their new business idea by researching the market and identifying competitors.

TASK:
Find 10 competitors similar to the USER PROFILE.
Research their marketing mix (4Ps: Product, Price, Place, Promotion).
It could be a company or just an indie product on product hunt, reddit, hacker news, etc.
You can use site:x.com, site:producthunt.com, site:reddit.com, site:news.ycombinator.com, etc. to search for competitors.

RESPONSE FORMAT:
Return a table with 5 columns. Provide concise details in every cell.
| Company Name | Product | Pricing | Place | Promotion |
|--------------|---------|---------|-------|-----------|
| [Name] | [Unique selling proposition] | [Pricing strategy or tier] | [Distribution methods, target market] | [Promotional channels, brand message] |
`;

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
