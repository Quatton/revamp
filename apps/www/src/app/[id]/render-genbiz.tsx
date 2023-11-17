"use client";

import { NewBizData } from "@/lib/state";
import { createBrowseClient } from "@/lib/supabase/browser";
import { eventTypeToText, step_3_splitIdeas } from "@/lib/text";
import { getSupabaseSubscriber } from "@/lib/utils";
import { Database } from "@/types/supabase";
import { StreamedChatResponse } from "cohere-ai/api";
import { useEffect, useState } from "react";

type GenBizTableData = Database["public"]["Tables"]["genbiz"]["Row"];

export function GenBizTable({
  id,
  initialData,
}: {
  id: string;
  initialData: string;
}) {
  const supabase = createBrowseClient();
  const [s3Data, setS3Data] = useState<NewBizData[]>(() =>
    step_3_splitIdeas(initialData),
  );
  const [eventType, setEventType] = useState<
    StreamedChatResponse["eventType"] | null
  >(null);

  useEffect(() => {
    const channel = getSupabaseSubscriber(supabase, "genbiz", id, (data) => {
      if (!data) {
        setEventType(null);
        setS3Data([]);
        return;
      }
      setEventType(data.event_type);
      if (!data.completion) return;
      const table = step_3_splitIdeas(data.completion);
      setS3Data(table);
      return;
    });

    () => {
      channel.unsubscribe();
    };
  }, [id, s3Data, setS3Data, supabase]);

  return (
    <div className="space-y-2">
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
  );
}
