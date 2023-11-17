"use client";

import { FourPData } from "@/lib/state";
import { createBrowseClient } from "@/lib/supabase/browser";
import { eventTypeToText, step_1_splitFourPs } from "@/lib/text";
import { Database } from "@/types/supabase";
import { StreamedChatResponse } from "cohere-ai/api";
import { useEffect, useState } from "react";

type FourPTableData = Database["public"]["Tables"]["fourp"]["Row"];

export function FourPTable({
  id,
  initialData,
}: {
  id: string;
  initialData: string;
}) {
  const supabase = createBrowseClient();
  const [s1Data, setS1Data] = useState<FourPData[]>(() =>
    step_1_splitFourPs(initialData),
  );
  const [eventType, setEventType] = useState<
    StreamedChatResponse["eventType"] | null
  >(null);

  useEffect(() => {
    const channel = supabase
      .channel("fourp")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "fourp",
          filter: `input_id=eq.${id}`,
        },
        (payload) => {
          const table = step_1_splitFourPs(payload.new.completion);
          setS1Data(table);
          setEventType(payload.new.event_type);
          return;
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [id, s1Data, setS1Data, supabase]);

  return (
    <div className="space-y-2">
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
  );
}
