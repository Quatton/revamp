import { startFourP } from "@/lib/server/completion/fourp";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

export async function POST(req: Request) {
  const { prompt, id } = await req.json();
  await startFourP({ prompt, id });
  revalidateTag(`${id}-fourp`);
  return NextResponse.json({ success: true });
}
