import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "REVALIDATE_SECRET not configured" },
      { status: 500 },
    );
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const paths = [
    "/",
    "/use-cases",
    "/playbook",
    "/prompts",
    "/faq",
    "/events",
    "/dashboard",
  ];

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true });
}
