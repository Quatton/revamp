import { FormFetch } from "@/components/utils/form-fetch";
import { eventTypeToText, step_3_splitIdeas } from "@/lib/text";
import { Database } from "@/types/supabase";
import { StreamedChatResponse } from "cohere-ai/api";
import { useEffect, useRef } from "react";
import { ChatBox } from "./chat-box";

type GenBizTableData = Database["public"]["Tables"]["genbiz"]["Row"];

export function GenBizTable({
  id,
  input,
  previous,
  current,
  eventType,
}: {
  id: string;
  input: Database["public"]["Tables"]["input"]["Row"];
  previous: string;
  current: string;
  eventType: StreamedChatResponse["eventType"] | null;
}) {
  const s3Data = step_3_splitIdeas(current);
  const scrollDest = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (eventType === "stream-end")
      scrollDest.current?.scrollIntoView({ behavior: "smooth" });
  }, [eventType]);

  return (
    <>
      <ChatBox>
        <p>
          {"Finally, let's generate some business ideas based on the analysis!"}
        </p>
        <FormFetch
          route="/api/genbiz"
          id={id}
          completion={previous}
          input={input}
        >
          {current ? "Restart" : "Start"}
        </FormFetch>
      </ChatBox>
      <ChatBox>
        <div className="space-y-2" ref={scrollDest}>
          {eventType && eventTypeToText(eventType)}
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Type of Product</th>
                <th>Reference</th>
                <th>Improvements</th>
              </tr>
            </thead>
            <tbody>
              {s3Data.map((data) => (
                <tr key={data.product}>
                  <td>{data.product}</td>
                  <td>{data.type}</td>
                  <td>{data.advantages}</td>
                  <td>{data.improvements}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChatBox>
    </>
  );
}
