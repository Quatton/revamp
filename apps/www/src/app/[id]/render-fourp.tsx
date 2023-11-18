import { FormFetch } from "@/components/utils/form-fetch";
import { eventTypeToText, step_1_splitFourPs } from "@/lib/text";
import { Database } from "@/types/supabase";
import { StreamedChatResponse } from "cohere-ai/api";
import { useEffect, useRef } from "react";
import { ChatBox } from "./chat-box";

// type FourPTableData = Database["public"]["Tables"]["fourp"]["Row"];

export function FourPTable({
  id,
  input,
  current,
  eventType,
}: {
  id: string;
  input: Database["public"]["Tables"]["input"]["Row"];
  current: string;
  eventType: StreamedChatResponse["eventType"] | null;
}) {
  const s1Data = step_1_splitFourPs(current);
  const scrollDest = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (eventType === "stream-end")
      scrollDest.current?.scrollIntoView({ behavior: "smooth" });
  }, [eventType]);

  return (
    <>
      <ChatBox>
        <p>{"First let's start with researching the existing businesses"}</p>
        <FormFetch route="/api/fourp" id={id} input={input}>
          {current ? "Restart" : "Start"}
        </FormFetch>
      </ChatBox>
      <ChatBox>
        <div className="space-y-2" ref={scrollDest}>
          {eventType && eventTypeToText(eventType)}
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Product</th>
                <th>Price</th>
                <th>Place</th>
                <th>Promotion</th>
              </tr>
            </thead>
            <tbody>
              {s1Data.map((row, i) => (
                <tr key={i}>
                  <td>{row.name}</td>
                  <td>{row.product}</td>
                  <td>{row.price}</td>
                  <td>{row.place}</td>
                  <td>{row.promotion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChatBox>
    </>
  );
}
