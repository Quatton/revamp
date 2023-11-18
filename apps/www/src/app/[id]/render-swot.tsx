import { FormFetch } from "@/components/utils/form-fetch";
import { eventTypeToText, step_2_splitSWOT } from "@/lib/text";
import { Database } from "@/types/supabase";
import { StreamedChatResponse } from "cohere-ai/api";
import { useEffect, useRef } from "react";
import { ChatBox } from "./chat-box";

type SwotTableData = Database["public"]["Tables"]["swot"]["Row"];

export function SwotTable({
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
  const s2Data = step_2_splitSWOT(current);
  const scrollDest = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (eventType === "stream-end")
      scrollDest.current?.scrollIntoView({ behavior: "smooth" });
  }, [eventType]);

  return (
    <>
      <ChatBox>
        <p>
          {
            "Now we can analyze their strengths and weaknesses! (Let's see if we can do better)"
          }
        </p>
        <FormFetch
          route="/api/swot"
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
          {s2Data.length > 0 && (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Strengths</th>
                  <th>Weaknesses</th>
                  <th>Opportunities</th>
                  <th>Threats</th>
                </tr>
              </thead>
              <tbody>
                {s2Data.map((row, i) => (
                  <tr key={i}>
                    <td>{row.name}</td>
                    <td>{row.strengths}</td>
                    <td>{row.weaknesses}</td>
                    <td>{row.opportunities}</td>
                    <td>{row.threats}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </ChatBox>
    </>
  );
}
