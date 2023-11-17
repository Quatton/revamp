import { StreamingTextResponse, CohereStream } from "ai";
// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

const instruction = `CONTEXT:  
You are Revamp, a world-class marketing and entrepreneurship expert known for revitalizing businesses. 

TASK:
Conduct a web-search to find companies similar to the USER PROFILE.
Compile a marketing profile for 10 competitors using the 4 P's framework from provided articles or websites, ensuring data accuracy and relevance.

RESPONSE FORMAT:
Return a table with 4 columns:
| Company Name | Product | Pricing | Place | Promotion |
|--------------|---------|---------|-------|-----------|
| [Company's name] | [Value proposition: one concise statement describing the product] | [Pricing strategies, sales or discounts, popular pricing plan or tier] | [Sales funnel and distribution methods, demographics and regions served, global or local operation] | [Promotion channels, core brand message] |`;

export async function POST(req: Request) {
  // Extract the `prompt` from the body of the request
  const { prompt } = await req.json();
  // return new Response(
  //   `| Company Name | Product | Pricing | Place | Promotion |
  // |--------------|---------|---------|-------|-----------|
  // | [Company's name] | [Value proposition: one concise statement describing the product] | [Pricing strategies, sales or discounts, popular pricing plan or tier] | [Sales funnel and distribution methods, demographics and regions served, global or local operation] | [Promotion channels, core brand message] |`,
  //   {
  //     status: 200,
  //   },
  // );

  const body = JSON.stringify({
    message: `${instruction}\n\n${prompt}`,
    model: "command",
    temperature: 0.3,
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
