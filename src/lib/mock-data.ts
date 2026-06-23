
export const user = {
  name: "Jaylon Baptista",
  handle: "@jaylonbaptista",
  avatar: "/avatar.png",
};

export const balance = {
  total: 83172.64,
  changePct: 6.7,
  accounts: 3,
};

export const monthlyIncome = { amount: 16281.48, changePct: 9.8 };
export const monthlyExpenses = { amount: 6638.72, changePct: -8.6 };

export const dailySpend = { amount: 682.2, changePct: -4.2 };
export const monthlySavings = {
  amount: monthlyIncome.amount - monthlyExpenses.amount,
  changePct: 12.4,
};

export const expenseShares = [
  { label: "Entertainments", value: 26, color: "#22c55e" },
  { label: "Platform", value: 24, color: "#ef4444" },
  { label: "Shopping", value: 22, color: "#f59e0b" },
  { label: "Food & health", value: 28, color: "#3b9be3" },
];

export const allExpenses = {
  daily: 682.2,
  weekly: 2183.26,
  monthly: 6638.72,
  highlight: { label: "Food & health", amount: 985.9 },
};

export const savingsGoal = {
  title: "Emergency fund",
  saved: 12400,
  target: 20000,
};

export type NewTransactionInput = {
  description: string;
  amount: number;
  type: TxType;
  category: string;
  date: string;
  repeat: "none" | "monthly";
};
export type TxStatus = "Completed" | "Pending" | "Failed";
export type TxType = "income" | "expense";
export type Transaction = {
  id: string;
  name: string;
  detail: string;
  initial: string;
  tint: string;
  fg: string;
  date: string;
  dateISO: string;
  category: string;
  amount: number;
  type: TxType;
  status: TxStatus;
  repeat: "none" | "monthly";
  endISO: string | null;
};

export type SavingsContributionUi = {
  id: string;
  amount: number;
  dateISO: string;
  repeat: "none" | "monthly";
  endISO: string | null;
};

export const categories = [
  "Income",
  "Groceries",
  "Entertainment",
  "Shopping",
  "Software",
  "Food & health",
  "Transport",
  "Bills",
] as const;

export const usd = (n: number, withSign = false) => {
  const s = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sign = n < 0 ? "-" : withSign ? "+" : "";
  return `${sign}$${s}`;
};

export const pct = (n: number) => `${n > 0 ? "+" : n < 0 ? "-" : ""}${Math.abs(n)}%`;
