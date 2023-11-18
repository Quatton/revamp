import { startSWOT } from "@/lib/server/completion/swot";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  const { prompt, id, completion } = await req.json();
  await startSWOT({ prompt, id, completion });
  revalidateTag(`${id}-swot`);
  return NextResponse.json({ success: true });
}
