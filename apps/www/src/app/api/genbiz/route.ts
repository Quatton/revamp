import { startGenBiz } from "@/lib/server/completion/genbiz";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export async function POST(req: Request) {
  const { prompt, id, completion } = await req.json();
  await startGenBiz({ prompt, id, completion });
  revalidateTag(`${id}-genbiz`);
  return NextResponse.json({ success: true });
}
