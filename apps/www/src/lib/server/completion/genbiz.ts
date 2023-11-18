import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { preamble_override, streamToSupabase } from "./stream";
import { step_2_splitSWOT } from "@/lib/text";
import { revalidatePath } from "next/cache";

const instruction = `CONTEXT:
You are an AI assistant skilled in analyzing market trends and generating innovative business concepts. You have access to a SWOT analysis of multiple competitors within the same industry as the user's company.

TASK:
- Create 5 unique business ideas that leverage the identified strengths of these competitors while addressing their weaknesses. 
- Draw inspiration from the SWOT analysis of various companies to inform your suggestions.
- Ensure that each idea reflects a combination of insights from the strengths and weaknesses of different companies as identified in the SWOT analysis.

RESPONSE FORMAT:
Summarize into a table with the following 4 columns and provide concise details for each business idea.
| Business Idea | Category | Derived Advantages | Proposed Improvements |
|---------------|----------|--------------------|-----------------------|
| [Summarize the core concept and value proposition of the new business idea] | [Specify the category: no-code, code, platform, service, or content] | [List the advantages by referencing the strengths and opportunities from multiple competitors] | [Detail improvements by addressing weaknesses and threats noted in the competitors' SWOT analysis] |`;

export async function startGenBiz({
  id,
  completion,
  prompt,
}: {
  id: string;
  completion: string;
  prompt: string;
}) {
  const supabase = createServerClient(cookies());
  const data = step_2_splitSWOT(completion);

  const body = JSON.stringify({
    message: `${instruction}\n\n${prompt}\n\nCOMPANIES TO ANALYZE:\n${data
      .map((d, i) => `- ${d.name}`)
      .join("\n")}`,

    model: "command",
    temperature: 0.7,
    // connectors: [{ id: "web-search" }],
    stream: true,
    preamble_override,
    citation_quality: "accurate",
    documents: data.map((d) => ({
      title: d.name,
      snippet: `Name: ${d.name}\n: Strengths: ${d.strengths}\nWeaknesses: ${d.weaknesses}\nOpportunities: ${d.opportunities}\nThreats: ${d.threats}`,
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

  await streamToSupabase(supabase, response, id, "genbiz");
  revalidatePath(`/${id}`);
  return;
}
