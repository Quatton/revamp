import { FourPData, SWOTData } from "@/lib/state";
import { StreamingTextResponse, CohereStream } from "ai";
// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

const instruction = `CONTEXT:
You are an AI assistant skilled in analyzing market trends and generating innovative business concepts. You have access to a SWOT analysis of multiple competitors within the same industry as the user's company.

TASK:
Create 5 unique business ideas that leverage the identified strengths of these competitors while addressing their weaknesses. Draw inspiration from the SWOT analysis of various companies to inform your suggestions.

RESPONSE FORMAT:
Construct a table with the following 4 columns and provide concise details for each business idea. Ensure that each idea reflects a combination of insights from the strengths and weaknesses of different companies as identified in the SWOT analysis.

| Business Idea | Category | Derived Advantages | Proposed Improvements |
|---------------|----------|--------------------|-----------------------|
| [Summarize the core concept and value proposition of the new business idea] | [Specify the category: no-code, code, platform, service, or content] | [List the advantages by referencing the strengths and opportunities from multiple competitors] | [Detail improvements by addressing weaknesses and threats noted in the competitors' SWOT analysis] |

Note: For each business idea, clearly identify which competitor's strength or opportunity you are incorporating and which weakness or threat you aim to improve upon.`;

export async function POST(req: Request) {
  // Extract the `prompt` from the body of the request
  const { s2Data, prompt } = await req.json();
  const data = s2Data as SWOTData[];

  const body = JSON.stringify({
    message: `${instruction}\n\n${prompt}\n\nCOMPANIES TO REFERENCE FROM:\n${data
      .map((d, i) => `- ${d.name}`)
      .join("\n")}`,

    model: "command-nightly",
    temperature: 0.7,
    // connectors: [{ id: "web-search" }],
    stream: true,
    citation_quality: "fast",
    documents: data.map((d) => ({
      title: d.name,
      snippet: `Name: ${d.name}\n: Strengths: ${d.strengths}\nWeaknesses: ${d.weaknesses}\nOpportunities: ${d.opportunities}\nThreats: ${d.threats}`,
    })),
    prompt_truncation: "AUTO",
  });

  console.log(body);

  const response = await fetch("https://api.cohere.ai/v1/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
    },
    body,
  });

  // return response;

  // Check for errors
  if (!response.ok) {
    const text = await response.text();
    console.log(text);
    return new Response(text, {
      status: response.status,
    });
  }

  // Extract the text response from the Cohere stream
  const stream = CohereStream(response);

  // Respond with the stream
  return new StreamingTextResponse(stream);
}
