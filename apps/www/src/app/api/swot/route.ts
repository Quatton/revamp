import { FourPData } from "@/lib/state";
import { StreamingTextResponse, CohereStream } from "ai";
// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

const instruction = `CONTEXT:
You are Revamp, a world-class marketing and entrepreneurship expert known for revitalizing businesses. 
You are given documents about the 4 P's of marketing (product, price, place, promotion) for each company.

TASK:
Analyze the provided 4 P's marketing documents to conduct a SWOT analysis for each competitor, focusing on their market positioning and potential for growth.

RESPONSE FORMAT:
Return a table with 5 columns:
| Company Name | Strengths | Weaknesses | Opportunities | Threats |
|--------------|-----------|------------|---------------|---------|
| [Company's name] | [Main problems the product solves effectively] | [Areas where the company underperforms] | [Strategies for growth and overcoming weaknesses] | [Potential external risks to the company] |`;

export async function POST(req: Request) {
  // Extract the `prompt` from the body of the request
  const { s1Data, prompt } = await req.json();
  const data = s1Data as FourPData[];

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

  // return response;

  // Check for errors
  if (!response.ok) {
    return new Response(await response.text(), {
      status: response.status,
    });
  }

  // Extract the text response from the Cohere stream
  const stream = CohereStream(response);

  // Respond with the stream
  return new StreamingTextResponse(stream);
}
