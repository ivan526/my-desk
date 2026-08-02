import { NextRequest, NextResponse } from "next/server";
import { generateReviewData } from "@/lib/aggregation";
import { requireUserId } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const userId = requireUserId(request);
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get("date");
  const date = dateStr ? new Date(dateStr) : new Date();

  const data = await generateReviewData(userId, date);
  return NextResponse.json({ data });
}
