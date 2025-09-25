import type { PlanInput, PlanResult, MonthlyPayment, Debt } from "@/types/debt";

const EPS = 1e-6;

function cloneDebts(ds: Debt[]) {
  return ds.map(d => ({ ...d }));
}

function pickTargetIndex(debts: Debt[], strategy: "snowball" | "avalanche") {
  const alive = debts.map((d, i) => ({ ...d, i })).filter(x => x.balance > EPS);
  if (alive.length === 0) return -1;
  if (strategy === "snowball") alive.sort((a, b) => a.balance - b.balance);
  else alive.sort((a, b) => b.interestAPR - a.interestAPR);
  return alive[0].i;
}

function oneRun(input: PlanInput, strategy: "snowball" | "avalanche"): PlanResult {
  const { monthlyBudget, maxMonths = 120 } = input;
  const debts = cloneDebts(input.debts);

  const minSum = debts.reduce((s, d) => s + Math.min(d.minimum, d.balance), 0);
  const warnings: string[] = [];
  if (monthlyBudget + EPS < minSum) {
    warnings.push(`每月預算（${monthlyBudget}）低於各債最低總和（${minSum}）。請提高預算或調整最低額。`);
  }

  const schedule: MonthlyPayment[] = [];
  let totalInterest = 0;

  for (let m = 1; m <= maxMonths; m++) {
    let budget = monthlyBudget;
    const allocs: MonthlyPayment["allocations"] = [];

    // 1) 計息 + 先扣最低
    for (const d of debts) {
      if (d.balance <= EPS) {
        allocs.push({ debtId: d.id, pay: 0, interest: 0, principal: 0, remaining: 0 });
        continue;
      }
      const monthlyRate = d.interestAPR / 12;
      const interest = +(d.balance * monthlyRate).toFixed(10);
      const minPay = Math.min(d.minimum, d.balance + interest);

      let pay = Math.min(minPay, budget);
      budget -= pay;

      const interestPortion = Math.min(interest, pay);
      const principalPortion = Math.max(0, pay - interestPortion);
      d.balance = Math.max(0, d.balance + interest - pay);

      allocs.push({
        debtId: d.id,
        pay,
        interest: interestPortion,
        principal: principalPortion,
        remaining: d.balance
      });
      totalInterest += interestPortion;
    }

    // 2) 剩餘預算打在目標債
    while (budget > EPS) {
      const ti = pickTargetIndex(debts, strategy);
      if (ti < 0) break;
      const d = debts[ti];
      if (d.balance <= EPS) break;

      const extraPay = Math.min(d.balance, budget);
      budget -= extraPay;
      d.balance = Math.max(0, d.balance - extraPay);

      const row = allocs.find(x => x.debtId === d.id)!;
      row.pay += extraPay;
      row.principal += extraPay;
      row.remaining = d.balance;
    }

    const totalPaidThisMonth = allocs.reduce((s, a) => s + a.pay, 0);
    const totalInterestThisMonth = allocs.reduce((s, a) => s + a.interest, 0);

    schedule.push({ month: m, allocations: allocs, totalInterestThisMonth, totalPaidThisMonth });

    if (!debts.some(d => d.balance > EPS)) break; // 全清
  }

  const months = schedule.length;
  if (debts.some(d => d.balance > EPS)) {
    warnings.push(`超過上限 ${maxMonths} 期仍未清償，請提高預算或調整策略。`);
  }

  return { schedule, totalInterest, months, strategyUsed: strategy, warnings };
}

export function buildPlan(input: PlanInput): PlanResult {
  if (input.strategy === "auto") {
    const a = oneRun(input, "avalanche");
    const s = oneRun(input, "snowball");
    const better =
      Math.abs(a.totalInterest - s.totalInterest) > 1e-2
        ? (a.totalInterest < s.totalInterest ? a : s)
        : (a.months <= s.months ? a : s);
    return { ...better, warnings: [...new Set([...a.warnings, ...s.warnings])] };
  }
  return oneRun(input, input.strategy);
}
