import { atomWithReducer, atomWithStorage } from "jotai/utils";

export type FourPData = {
  name: string;
  product: string;
  price: string;
  place: string;
  promotion: string;
};

export type SWOTData = {
  name: string;
  strengths: string;
  weaknesses: string;
  opportunities: string;
  threats: string;
};

export type NewBizData = {
  product: string;
  type: string;
  advantages: string;
  improvements: string;
};

export type InputData = {
  targetAudience: string;
  productIdea: string;
  expertise: string;
};

export const stepAtom = atomWithStorage<number>("revamp:step", 1);
export const inputAtom = atomWithStorage<InputData>("revamp:input", {
  targetAudience: "",
  productIdea: "",
  expertise: "",
});
export const step1DataAtom = atomWithStorage<FourPData[] | null>(
  "revamp:step1",
  null,
);

export const step2DataAtom = atomWithStorage<SWOTData[] | null>(
  "revamp:step2",
  null,
);

export const step3DataAtom = atomWithStorage<NewBizData[] | null>(
  "revamp:step3",
  null,
);
