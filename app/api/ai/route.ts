import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

type AIRequest = { task: "advice_plan"; input: any };

const HF_API = "https://api-inference.huggingface.co/models";

async function hfPOST(model: string, body: any) {
  const r = await fetch(`${HF_API}/${model}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function POST(req: NextRequest) {
  try {
    const { task, input }: AIRequest = await req.json();
    if (task !== "advice_plan") {
      return NextResponse.json({ ok: false, error: "unsupported task" }, { status: 400 });
    }
    if (!process.env.HF_API_KEY || !process.env.HF_MODEL_ID) {
      return NextResponse.json({ ok: false, error: "missing HF env" }, { status: 500 });
    }

    const system = `你是理財教練。你會把「已計算好的還款計畫（JSON）」轉成白話建議：
- 不要改動任何金額或月數。
- 三段輸出：策略摘要、每月要做什麼、風險與備案（收入下降/突發支出）。
- 口吻務實、鼓勵但不灑糖。使用繁體中文。限制 250~400 字。`;

    const planJson = typeof input === "string" ? input : JSON.stringify(input);
    const prompt = `${system}\n---\n這是計算結果（JSON）：${planJson}\n只回一段文字建議。`;

    const raw = await hfPOST(process.env.HF_MODEL_ID!, {
      inputs: prompt,
      parameters: { max_new_tokens: 320, temperature: 0.2, return_full_text: false },
    });

    const text = Array.isArray(raw) ? raw?.[0]?.generated_text ?? "" : String(raw);

    return NextResponse.json({ ok: true, task, result: { advice: text } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "unknown" }, { status: 500 });
  }
}
