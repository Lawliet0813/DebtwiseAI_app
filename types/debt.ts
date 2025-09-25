export type Debt = {
  id: string;
  name: string;
  balance: number; // 目前餘額
  interestAPR: number; // 年利率（例如 0.159 = 15.9%）
  minimum: number; // 每月最低應繳
};

export type PlanInput = {
  debts: Debt[];
  monthlyBudget: number; // 每月可支配還款額（含最低）
  strategy: "snowball" | "avalanche" | "auto";
  maxMonths?: number; // 預設 120
};

export type MonthlyPayment = {
  month: number;
  allocations: {
    debtId: string;
    pay: number;
    interest: number;
    principal: number;
    remaining: number;
  }[];
  totalInterestThisMonth: number;
  totalPaidThisMonth: number;
};

export type PlanResult = {
  schedule: MonthlyPayment[];
  totalInterest: number;
  months: number;
  strategyUsed: "snowball" | "avalanche";
  warnings: string[];
};
