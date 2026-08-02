import { NextRequest, NextResponse } from "next/server";
import { generateReviewData } from "@/lib/aggregation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get("date");
  const date = dateStr ? new Date(dateStr) : new Date();

  const data = await generateReviewData(date);
  return NextResponse.json({ data });
}
