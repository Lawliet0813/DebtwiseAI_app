import { NextRequest, NextResponse } from "next/server";
import { buildPlan } from "@/lib/plan";
import type { PlanInput } from "@/types/debt";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PlanInput;

    if (!Array.isArray(body.debts) || typeof body.monthlyBudget !== "number") {
      return NextResponse.json({ ok: false, error: "invalid payload" }, { status: 400 });
    }

    const result = buildPlan(body);
    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "unknown" }, { status: 400 });
  }
}
