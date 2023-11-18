import { createServerClient } from "@/lib/supabase/server";
import { renderPrompt } from "@/lib/text";
import { convertKeysFromSnakeToCamelCase } from "@/lib/utils";
import { Database } from "@/types/supabase";
import { StreamedChatResponse } from "cohere-ai/api";

export async function streamToSupabase(
  supabase: ReturnType<typeof createServerClient>,
  response: Response,
  id: string,
  table: keyof Omit<Database["public"]["Tables"], "input">,
) {
  await supabase.from(table).delete().eq("input_id", id);
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
  let previous = "";
  const reader = stream.getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    const text = previous + decoder.decode(value, { stream: true });
    // console.log("___________________");
    // console.count("exp3");
    // console.log(text);

    const json = (() => {
      try {
        const json = convertKeysFromSnakeToCamelCase(
          JSON.parse(text),
        ) as StreamedChatResponse;
        previous = "";
        return json;
      } catch (error) {
        const regex = /Unexpected token \{ in JSON at position (\d+)/;
        // we will just remove what's errored
        const e = error as Error;
        const match = e.message.match(regex);
        if (match) {
          const removed = text.slice(0, Number(match[1]));
          const parsed = convertKeysFromSnakeToCamelCase(
            JSON.parse(removed),
          ) as StreamedChatResponse;
          previous = "";
          return parsed;
        }

        previous = text;
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
        await supabase.from(table).insert({
          input_id: id,
          completion: "",
          event_type: "stream-start",
        });
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
          .then(({ data }) => {
            // if (completion !== data) console.log("what?");
          });

        break;
      case "citation-generation":
        shouldReturn = true;
        // if ("text" in json) {
        //   completion = json.text as string;
        // }
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
      // created_at: new Date().toISOString(),
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

  return renderPrompt(data);
}

export const preamble_override = `RESPONSE REQUIREMENTS:
- Always summarize into a table.
- Do not include N/A or Unknown values. Try your best to infer the missing information.
- Be concise. Do not include unnecessary details.
- Do not include any information that is not relevant to the task.
- Only use real companies and products. Do not make up any information.

SITES TO USE:
- producthunt.com
- x.com
- news.ycombinator.com
- reddit.com
- quora.com`;
