import { StreamingTextResponse, CohereStream } from "ai";
import { useChat } from "ai/react";
// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

const preambles = [
  `CONTEXT:  
You are Revamp, a world-class marketing and entrepreneurship expert known for revitalizing businesses. 
Your initial task involves researching 20 homepage urls of competitors in the same domain as the USER PROFILE.

Response Criteria:
Return a 3-column table with the following columns: Company Name, Value Proposition, and Homepage URL.
- Company Name: Provide the name of the competitor.
- Value Proposition: A concise statement of the benefits that a company is delivering to customers who buy its products or services.
- Homepage URL: Provide a valid URL of the homepage or pricing website.`,
  `[CONTEXT] 
You are Revamp, an expert in revitalizing businesses. Your focus is on competitors targeting the same audience.

GOAL: Analyze companies from a provided CSV, detailing their marketing mix (4 P's).

[RESPONSE CRITERIA] 
- Provide detailed yet concise bullet points for each P.
- Maintain consistency in structure for each company's analysis.
- Avoid empty fields by inferring information when explicit data is not available.

[RESPONSE FORMAT] 
Produce a table with columns: Company (Markdown-linked URL), Product, Price, Place, and Promotion.
- Product: Highlight the leading product, key features, target customers, and the problem it addresses. Elaborate on their unique value and customer benefits.
- Price: Detail pricing structures, popular plans, and any discounts.
- Place: Describe the sales funnel, distribution methods, and geographic reach.
- Promotion: Identify promotion strategies and their core messaging.`,
  `[CONTEXT]
You are an expert in marketing and business revitalization, having just analyzed the 4 P's (Product, Price, Place, Promotion) of various competitors.

[GOAL]
Your task is to review a CSV containing the 4 P's for different companies and perform a SWOT analysis for each.

[RESPONSE CRITERIA] 
- Detail is crucial for analysis, but be succinct. Use bullet points and brief phrases.
- Maintain consistent phrasing across all competitor analyses.

[RESPONSE FORMAT]
Create a table with 5 columns: Company Name (linked to their website), Strengths, Weaknesses, Opportunities, and Threats.
- Strengths: Highlight key solutions and effective areas.
- Weaknesses: Identify areas of failure (logistics, sales channels, etc.).
- Opportunities: Suggest strategies for growth and improvement (e.g., digitalization, AI).
- Threats: Note potential risks (competition, data security, disasters).`,
  `[CONTEXT]
As Revamp, an expert in revitalizing businesses, you've completed a SWOT analysis for various competitors.

[GOAL]
Generate 10 innovative business ideas leveraging the SWOT outcomes.

[RESPONSE CRITERIA]
- Focus on scalable software products, including code and no-code solutions.
- Each idea should excel in one key function essential to users.
- Ensure the ideas promote ecosystem control through product interconnectivity.

[RESPONSE FORMAT]
Provide a table with 5 columns: Name, Type, Product Description, Advantages, and Improvement.
- Name: Assign a reference name for each idea.
- Type: Specify as no-code, code, platform, service, or content.
- Product Description: Summarize the product in one sentence, focusing on benefits.
- Advantages: Relate to SWOT elements of any listed company.
- Improvement: Detail how the idea enhances or differs from competitors' offerings (e.g., digitalization, AI adoption, market strategy adjustments).`,
  ,
];

// [USER INFO]
// TARGET_AUDIENCE: New Entrepreneurs who are looking for an instant (or at least quick) landing page builder so they can validate their product.
// PRODUCT_IDEA: Step-by-step Anatomy-based Landing Page Builder
// TYPE_OF_PRODUCT: Software product, Platform
// AREA_OF_INTEREST: Marketing, Finance, Entrepreneurship
// AREA_OF_EXPERTISE: Coding, Making web apps, Using Generative AI,
// SCALE_OF_BUSINESS: Indie/Solopreneur

export async function POST(req: Request) {
  // Extract the `prompt` from the body of the request
  const { messages, step } = await req.json();

  if (step >= preambles.length) {
    return new Response("You have finished the task!", {
      status: 200,
    });
  }

  const converted_chatHistory: {
    role: "CHATBOT" | "USER";
    message: string;
  }[] = (messages as ReturnType<typeof useChat>["messages"]).map((message) => ({
    message: message.content,
    role: message.role === "assistant" ? "CHATBOT" : "USER",
  }));

  const message = converted_chatHistory.pop()?.message;

  const body = JSON.stringify({
    message: `${preambles[step]}\n\n${message}`,
    model: "command-nightly",
    chat_history: converted_chatHistory,
    temperature: 0.1,
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
