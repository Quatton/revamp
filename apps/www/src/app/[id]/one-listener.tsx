"use client";

import { createBrowseClient } from "@/lib/supabase/browser";
import { getSupabaseSubscriber } from "@/lib/utils";
import { Database } from "@/types/supabase";
import { StreamedChatResponse } from "cohere-ai/api";
import { useEffect, useState } from "react";
import { FourPTable } from "./render-fourp";
import { SwotTable } from "./render-swot";
import { GenBizTable } from "./render-genbiz";

type EventType = StreamedChatResponse["eventType"];

export function OneListener({
  id,
  input,
  initialFourP = "",
  initialSwot = "",
  initialGenBiz = "",
}: {
  id: string;
  input: Database["public"]["Tables"]["input"]["Row"];
  initialFourP: string;
  initialSwot: string;
  initialGenBiz: string;
}) {
  const supabase = createBrowseClient();

  const [s1Data, setS1Data] = useState<string>(initialFourP);
  const [s1EventType, setS1EventType] = useState<EventType | null>(null);

  const [s2Data, setS2Data] = useState<string>(initialSwot);
  const [s2EventType, setS2EventType] = useState<EventType | null>(null);

  const [s3Data, setS3Data] = useState<string>(initialGenBiz);
  const [s3EventType, setS3EventType] = useState<EventType | null>(null);

  useEffect(() => {
    const channel = getSupabaseSubscriber(supabase, "fourp", id, (data) => {
      if (!data) {
        setS1EventType(null);
        setS1Data("");
        return;
      }
      setS1EventType(data.event_type);
      if (!data.completion) return;

      setS1Data(data.completion);
      return;
    });

    () => {
      channel.unsubscribe();
    };
  }, [id, s1Data, setS1Data, supabase]);

  useEffect(() => {
    const channel = getSupabaseSubscriber(supabase, "swot", id, (data) => {
      if (!data) {
        setS2EventType(null);
        setS2Data("");
        return;
      }
      setS2EventType(data.event_type);
      if (!data.completion) return;
      setS2Data(data.completion);
      return;
    });

    () => {
      channel.unsubscribe();
    };
  }, [id, s2Data, setS2Data, supabase]);

  useEffect(() => {
    const channel = getSupabaseSubscriber(supabase, "genbiz", id, (data) => {
      if (!data) {
        setS3Data("");
        return;
      }
      setS3EventType(data.event_type);
      if (!data.completion) return;
      setS3Data(data.completion);
      return;
    });

    () => {
      channel.unsubscribe();
    };
  }, [id, s3Data, setS3Data, supabase]);

  return (
    <div className="col-span-2 overflow-y-auto">
      <FourPTable
        id={id}
        input={input}
        current={s1Data}
        eventType={s1EventType}
      />
      {s1EventType === "stream-end" && (
        <SwotTable
          id={id}
          input={input}
          current={s2Data}
          previous={s1Data}
          eventType={s2EventType}
        />
      )}
      {s2EventType === "stream-end" && (
        <GenBizTable
          id={id}
          input={input}
          current={s3Data}
          previous={s2Data}
          eventType={s3EventType}
        />
      )}
    </div>
  );
}
