import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { POST as planPOST } from "@/app/api/plan/route";
import { POST as aiPOST } from "@/app/api/ai/route";

type JsonBody = Record<string, any>;

function createRequest(body: JsonBody) {
  return {
    json: async () => body,
  } as any;
}

describe("/api/plan", () => {
  it("returns a structured plan response", async () => {
    const payload = {
      strategy: "snowball" as const,
      monthlyBudget: 1200,
      maxMonths: 24,
      debts: [
        {
          id: "card-1",
          name: "信用卡 A",
          balance: 5000,
          interestAPR: 0.18,
          minimum: 200,
        },
        {
          id: "loan-1",
          name: "車貸",
          balance: 8000,
          interestAPR: 0.08,
          minimum: 150,
        },
      ],
    };

    const res = await planPOST(createRequest(payload));
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.result).toBeDefined();
    expect(Array.isArray(data.result.schedule)).toBe(true);
    expect(data.result.schedule.length).toBeGreaterThan(0);
    expect(typeof data.result.totalInterest).toBe("number");
    expect(typeof data.result.months).toBe("number");
  });

  it("rejects invalid payloads", async () => {
    const res = await planPOST(createRequest({}));
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.error).toBeTruthy();
  });
});

describe("/api/ai", () => {
  const originalFetch = globalThis.fetch;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.HF_API_KEY = "test-key";
    process.env.HF_MODEL_ID = "awesome-model";
  });

  afterEach(() => {
    if (originalFetch) {
      globalThis.fetch = originalFetch;
    } else {
      delete (globalThis as any).fetch;
    }
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  it("returns advice text when the model responds", async () => {
    const adviceText = "這是一段友善的建議";
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ generated_text: adviceText }],
    });

    globalThis.fetch = mockFetch as unknown as typeof fetch;

    const reqBody = { task: "advice_plan", input: { foo: "bar" } };
    const res = await aiPOST(createRequest(reqBody));

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api-inference.huggingface.co/models/awesome-model",
      expect.objectContaining({ method: "POST" })
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.task).toBe("advice_plan");
    expect(data.result).toEqual({ advice: adviceText });
  });
});
