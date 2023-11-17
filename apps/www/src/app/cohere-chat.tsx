"use client";

import { Button } from "@/components/ui/button";
import {
  inputAtom,
  step1DataAtom,
  step2DataAtom,
  step3DataAtom,
  stepAtom,
} from "@/lib/state";
import {
  renderInput,
  step_1_splitFourPs,
  step_2_splitSWOT,
  step_3_splitIdeas,
} from "@/lib/text";
import { useCompletion } from "ai/react";
import { useAtom } from "jotai";
import { StopCircle } from "lucide-react";
import { redirect, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CohereClient } from "cohere-ai";

export function CohereChat() {
  const [step, setStep] = useAtom(stepAtom);
  const [s1Data, setS1Data] = useAtom(step1DataAtom);
  const [s2Data, setS2Data] = useAtom(step2DataAtom);
  const [s3Data, setS3Data] = useAtom(step3DataAtom);

  const [input, setInput] = useAtom(inputAtom);

  const getBody = useCallback(
    function getBody(step: number) {
      switch (step) {
        case 1:
          return {};
        case 2:
          return {
            s1Data,
          };
        case 3:
          return {
            s1Data,
            s2Data,
          };
      }
    },
    [s1Data, s2Data],
  );

  const { completion, complete, isLoading, stop, error } = useCompletion({
    api: getRoute(step),
    onFinish: () => {
      setStep((s) => s + 1);
    },
    body: getBody(step),
  });

  function getRoute(step: number) {
    switch (step) {
      case 1:
        return "/api/fourp";
      case 2:
        return "/api/swot";
      case 3:
        return "/api/genbiz";
    }
  }

  useEffect(() => {
    if (!completion) return;
    switch (step) {
      case 1:
        const table = step_1_splitFourPs(completion);
        setS1Data(table);
        break;
      case 2:
        const table2 = step_2_splitSWOT(completion);
        setS2Data(table2);
        break;
      case 3:
        const table3 = step_3_splitIdeas(completion);
        setS3Data(table3);
        break;
    }
  }, [step, completion, s1Data, setS1Data, setS2Data, setS3Data]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input) return;
    complete(renderInput(input));
  }

  return (
    <div className="flex h-screen flex-col gap-2 p-24 lg:flex-row">
      <div className="flex-1">
        <h1 className="text-2xl">Cohere Chat</h1>
        <p className="text-error">{JSON.stringify(error)}</p>
        <p>Step: {step}</p>
        <form
          onSubmit={!isLoading ? handleSubmit : stop}
          className="form-control gap-2"
        >
          <div className="flex flex-col gap-1">
            <label className="label">Target Audience</label>
            <input
              className="input"
              name="targetAudience"
              value={input?.targetAudience}
              onChange={(e) =>
                setInput((s) => ({
                  ...s,
                  targetAudience: e.target.value,
                }))
              }
              placeholder="Target Audience"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="label">Product Idea</label>
            <input
              className="input"
              name="productIdea"
              value={input?.productIdea}
              onChange={(e) =>
                setInput((s) => ({
                  ...s,
                  productIdea: e.target.value,
                }))
              }
              placeholder="Product Idea"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="label">Expertise</label>
            <input
              className="input"
              name="expertise"
              value={input?.expertise}
              onChange={(e) =>
                setInput((s) => ({
                  ...s,
                  expertise: e.target.value,
                }))
              }
              placeholder="Expertise"
            />
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                switch (step) {
                  case 2:
                    setS1Data(null);
                    break;
                  case 3:
                    setS2Data(null);
                    break;
                  case 4:
                    setS3Data(null);
                    break;
                  default:
                    break;
                }
                setStep((s) => (s - 1 < 1 ? 1 : s - 1));
              }}
            >
              Back 1 Step
            </Button>
            <Button type="submit">
              {isLoading && <StopCircle className="mr-2 h-4 w-4" />}
              Send
            </Button>
          </div>
        </form>
      </div>
      <div className="flex-1 overflow-y-auto">
        <h2 className="text-xl font-bold">{"4 P's of Marketing"}</h2>
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
            {s1Data?.map((row, i) => (
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
        <h2 className="text-xl font-bold">SWOT Analysis</h2>
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
            {s2Data?.map((row, i) => (
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
        <h2 className="text-xl font-bold">New Business Ideas✨</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Type of Product</th>
              <th>Advantages</th>
              <th>Improvements</th>
            </tr>
          </thead>
          <tbody>
            {s3Data?.map((row, i) => (
              <tr key={i}>
                <td>{row.product}</td>
                <td>{row.type}</td>
                <td>{row.advantages}</td>
                <td>{row.improvements}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {completion}
      </div>
    </div>
  );
}
