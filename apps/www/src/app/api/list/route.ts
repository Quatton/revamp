import { StreamingTextResponse, CohereStream } from "ai";
import { useChat } from "ai/react";
// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

const instruction = `CONTEXT:  
You are Revamp, a world-class marketing and entrepreneurship expert known for revitalizing businesses. 
Your initial task involves researching 20 competitors' homepage URLs in the same domain as the USER PROFILE.

RESPONSE CRITERIA:
Return a 3-column table with the following columns: Homepage URL, Company Name, and Value Proposition.
- Homepage URL: Provide a valid URL of the homepage or pricing website.
- Company Name: Provide the name of the competitor.
- Value Proposition: A concise statement of the benefits that a company is delivering to customers who buy its products or services.`;

export async function POST(req: Request) {
  // Extract the `prompt` from the body of the request
  const { prompt } = await req.json();

  const body = JSON.stringify({
    message: `${instruction}\n\n${prompt}`,
    model: "command",
    temperature: 0.7,
    connectors: [{ id: "web-search" }],
    stream: true,
    citation_quality: "accurate",
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
