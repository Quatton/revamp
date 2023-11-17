import { createServerClient } from "@/lib/supabase/server";
import { convertKeysFromSnakeToCamelCase } from "@/lib/utils";
import { Database } from "@/types/supabase";
import { StreamedChatResponse } from "cohere-ai/api";

export async function streamToSupabase(
  supabase: ReturnType<typeof createServerClient>,
  response: Response,
  id: string,
  table: keyof Omit<Database["public"]["Tables"], "input">,
) {
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
          .from(table)
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
        if (typeof text != "string") break;
        completion += text;
        void supabase
          .rpc("stream-completion", {
            completion,
            created_at: new Date().toISOString(),
            event_type: "text-generation",
            input_id: id,
            table_name: table,
          })
          .then(({ error }) => {
            if (error) console.log(error);
          });
        break;
      case "stream-end":
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
    .from(table)
    .update({
      completion,
      event_type: "stream-end",
      created_at: new Date().toISOString(),
    })
    .eq("input_id", id);
}

export async function getPrompt(
  supabase: ReturnType<typeof createServerClient>,
  id: string,
) {
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

  console.log(prompt);

  return prompt;
}