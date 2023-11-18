import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { streamToSupabase } from "./stream";
import { step_1_splitFourPs } from "@/lib/text";
import { revalidatePath } from "next/cache";

const instruction = `CONTEXT:
You are Revamp, a world-class marketing and entrepreneurship expert known for revitalizing businesses. 
You are given documents about the 4 P's of marketing (product, price, place, promotion) for each company.

TASK:
Analyze the provided 4 P's marketing documents to conduct a SWOT analysis for each competitor, focusing on their market positioning and potential for growth.
Look for opportunities to leverage the strengths of each competitor while addressing their weaknesses.

RESPONSE FORMAT:
Return a table with 5 columns. Provide concise details in every cell.
| Company Name | Strengths | Weaknesses | Opportunities | Threats |
|--------------|-----------|------------|---------------|---------|
| [Company's name] | [Main problems the product solves effectively] | [Areas where the company underperforms] | [Strategies for growth and overcoming weaknesses] | [Potential external risks to the company] |`;

export async function startSWOT({
  id,
  completion,
  prompt,
}: {
  id: string;
  completion: string;
  prompt: string;
}) {
  const supabase = createServerClient(cookies());

  const data = step_1_splitFourPs(completion);

  const body = JSON.stringify({
    message: `${instruction}\n\n${prompt}\n\nCOMPANIES TO ANALYZE:\n${data
      .map((d, i) => `- ${d.name}`)
      .join("\n")}`,

    model: "command",
    temperature: 0.6,
    // connectors: [{ id: "web-search" }],
    stream: true,
    citation_quality: "fast",
    documents: data.map((d) => ({
      title: d.name,
      snippet: `Name: ${d.name}\nProduct: ${d.product}\nPrice: ${d.price}\nPlace: ${d.place}\nPromotion: ${d.promotion}`,
    })),
    prompt_truncation: "AUTO",
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

  await streamToSupabase(supabase, response, id, "swot");
  revalidatePath(`/${id}`);
  return;
}
