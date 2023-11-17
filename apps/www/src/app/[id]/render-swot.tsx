"use client";

import { SWOTData } from "@/lib/state";
import { createBrowseClient } from "@/lib/supabase/browser";
import { eventTypeToText, step_2_splitSWOT } from "@/lib/text";
import { getSupabaseSubscriber } from "@/lib/utils";
import { Database } from "@/types/supabase";
import { StreamedChatResponse } from "cohere-ai/api";
import { useEffect, useState } from "react";

type SwotTableData = Database["public"]["Tables"]["swot"]["Row"];

export function SwotTable({
  id,
  initialData,
}: {
  id: string;
  initialData: string;
}) {
  const supabase = createBrowseClient();
  const [s2Data, setS2Data] = useState<SWOTData[]>(() =>
    step_2_splitSWOT(initialData),
  );
  const [eventType, setEventType] = useState<
    StreamedChatResponse["eventType"] | null
  >(null);

  useEffect(() => {
    const channel = getSupabaseSubscriber(supabase, "swot", id, (data) => {
      if (!data) {
        setEventType(null);
        setS2Data([]);
        return;
      }
      setEventType(data.event_type);
      if (!data.completion) return;
      const table = step_2_splitSWOT(data.completion);
      setS2Data(table);
      return;
    });

    () => {
      channel.unsubscribe();
    };
  }, [id, s2Data, setS2Data, supabase]);

  return (
    <div className="space-y-2">
      {eventType && eventTypeToText(eventType)}
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
    </div>
  );
}
