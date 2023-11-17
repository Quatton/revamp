import { StreamedChatResponse } from "cohere-ai/api";
import { FourPData, InputData, NewBizData, SWOTData } from "./state";

export function grabTable(text: string) {
  return text.match(/\|.+\|?/gs)?.at(0);
}

export function splitTable(text: string) {
  // console.log(text);
  const table = grabTable(text);
  return (
    table
      ?.split("\n")
      // .map((line) => line.replaceAll("<br>", "\n"))
      .slice(2)
      .filter((line) => line.includes("|") && !line.includes("---")) ?? []
  );
}

export function step_3_splitIdeas(text: string) {
  const table = splitTable(text);

  return table.map<NewBizData>((line) => {
    const res = line
      .split("|")
      .map((text) => text.trim())
      .filter((text) => text !== "");
    return {
      product: res[0],
      type: res[1],
      advantages: res[2],
      improvements: res[3],
    };
  });
}

export function step_2_splitSWOT(text: string) {
  const table = splitTable(text);

  return table.map<SWOTData>((line) => {
    const res = line
      .split("|")
      .map((text) => text.trim())
      .filter((text) => text !== "");
    return {
      name: res[0],
      strengths: res[1],
      weaknesses: res[2],
      opportunities: res[3],
      threats: res[4],
    };
  });
}

export function renderInput(input: InputData) {
  return `USER PROFILE:
- TARGET AUDIENCE: ${input.targetAudience}
- PRODUCT IDEA: ${input.productIdea}
- EXPERTISE: ${input.expertise}`;
}

export function step_1_splitFourPs(text: string) {
  const table = splitTable(text);
  return (
    table.map<FourPData>((line) => {
      const res = line
        .split("|")
        .map((text) => text.trim())
        .filter((text) => text !== "");
      return {
        name: res[0],
        product: res[1],
        price: res[2],
        place: res[3],
        promotion: res[4],
      };
    }) ?? []
  );
}

export function eventTypeToText(eventType: StreamedChatResponse["eventType"]) {
  switch (eventType) {
    case "stream-start":
      return "Deep diving into the topic...";
    case "search-queries-generation":
      return "Generating search queries...";
    case "search-results":
      return "Analyzing search results...";
    case "text-generation":
      return "Generating text...";
    case "stream-end":
      return "Completed!";
  }
}
