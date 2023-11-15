"use client";

import { Button } from "@/components/ui/button";
import { useCompletion } from "ai/react";
import { StopCircle } from "lucide-react";
import { useRef } from "react";

export function CohereChat() {
  const step = useRef(0);

  const {
    completion,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    error,
  } = useCompletion({
    api: "/api/list",
    onFinish: () => {
      step.current++;
    },
  });

  return (
    <div className="flex w-96 flex-col gap-2">
      <h1 className="text-2xl">Cohere Chat</h1>
      <p className="text-error">{JSON.stringify(error)}</p>
      <p>Step: {step.current + 1}</p>
      <form
        onSubmit={!isLoading ? handleSubmit : stop}
        className="form-control gap-2"
      >
        <textarea
          className="textarea textarea-bordered resize-none"
          cols={30}
          rows={10}
          value={input}
          onChange={handleInputChange}
        />
        <Button type="submit">
          {isLoading && <StopCircle className="mr-2 h-4 w-4" />}
          Send
        </Button>
      </form>
      <div>
        {/* take the last odd number  */}
        <p>{completion}</p>
      </div>
    </div>
  );
}
