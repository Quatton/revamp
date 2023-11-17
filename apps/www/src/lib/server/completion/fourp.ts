import { createServerClient } from "@/lib/supabase/server";
import { convertKeysFromSnakeToCamelCase } from "@/lib/utils";
import { CohereStream } from "ai";
import { StreamedChatResponse } from "cohere-ai/api";
import { cookies } from "next/headers";

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

export async function startFourP({ id }: { id: string }) {
  const supabase = createServerClient(cookies());

  const supabaseUpdate = async (
    completion: string,
    ev: StreamedChatResponse["eventType"],
  ) => {
    return await supabase.rpc("stream-completion", {
      completion,
      input_id: id,
      table_name: "fourp",
      event_type: ev,
    });
  };

  const { data, error } = await supabase
    .from("input")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  const { target_audience, expertise, product_idea } = data;

  const prompt = `USER PROFILE:
Target Audience: ${target_audience}
Product Idea: ${product_idea}
Expertise: ${expertise}`;

  const body = JSON.stringify({
    message: `${instruction}\n\n${prompt}`,
    model: "command",
    temperature: 0.5,
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

  const decoder = new TextDecoder();
  const stream = new ReadableStream({
    start(controller) {
      const reader = response.body?.getReader();

      function push() {
        if (!reader) {
          controller.close();
          return;
        }

        reader.read().then(({ done, value }) => {
          if (done) {
            controller.close();
            return;
          }

          controller.enqueue(value);
          push();
        });
      }

      push();
    },
    cancel() {
      reader.releaseLock();
    },
  });

  let completion = "";
  const reader = stream.getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    const text = decoder.decode(value, {
      stream: true,
    });

    const json = (() => {
      try {
        return convertKeysFromSnakeToCamelCase(
          JSON.parse(text),
        ) as StreamedChatResponse;
      } catch (e) {
        return null;
      }
    })();

    if (!json) {
      continue;
    }

    const { eventType } = json;
    let shouldReturn = false;

    switch (eventType) {
      case "stream-start":
        await supabase
          .from("fourp")
          .upsert(
            {
              input_id: id,
              completion: "",
              event_type: "stream-start",
            },
            {
              onConflict: "input_id",
            },
          )
          .eq("input_id", id);
        break;
      case "text-generation":
        const { text } = json;
        if (!text) break;
        completion += text;
        void supabase
          .from("fourp")
          .update({
            completion,
            event_type: "text-generation",
          })
          .eq("input_id", id)
          .then(() => {});
        break;
      case "citation-generation":
        shouldReturn = true;

        break;
      default:
        continue;
    }

    if (shouldReturn) {
      reader.releaseLock();
      break;
    }
  }
  await supabase
    .from("fourp")
    .update({
      completion,
      event_type: "stream-end",
    })
    .eq("input_id", id);
  return;
}
