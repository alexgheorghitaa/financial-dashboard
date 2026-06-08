
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

export const averages = {
  income: { amount: 10389.49, changePct: 9.8 },
  expenses: { amount: 6726.92, changePct: 8.7 },
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

export type MonthPoint = { month: string; income: number; expenses: number };

export const statistics: MonthPoint[] = [
  { month: "Jan", income: 9200, expenses: 5100 },
  { month: "Feb", income: 10100, expenses: 6200 },
  { month: "Mar", income: 8600, expenses: 4800 },
  { month: "Apr", income: 11400, expenses: 6800 },
  { month: "May", income: 9800, expenses: 5400 },
  { month: "Jun", income: 12100, expenses: 5000 },
  { month: "Jul", income: 16281.48, expenses: 6638.72 },
  { month: "Aug", income: 12600, expenses: 5800 },
  { month: "Sep", income: 10900, expenses: 6900 },
  { month: "Oct", income: 13800, expenses: 5600 },
  { month: "Nov", income: 11700, expenses: 6100 },
  { month: "Dec", income: 13200, expenses: 6400 },
];

export type WeekPoint = { week: string; expenses: number };

export const weeklyExpenses: WeekPoint[] = [
  { week: "W1", expenses: 1480 },
  { week: "W2", expenses: 1920 },
  { week: "W3", expenses: 1325 },
  { week: "W4", expenses: 2183 },
  { week: "W5", expenses: 1610 },
  { week: "W6", expenses: 2040 },
  { week: "W7", expenses: 1495 },
  { week: "W8", expenses: 1875 },
];

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
  category: string;
  amount: number;
  type: TxType;
  status: TxStatus;
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

export const transactions: Transaction[] = [
  { id: "t1", name: "Salary — Acme Inc.", detail: "Direct deposit", initial: "A", tint: "#eaf1fb", fg: "#2f6bd4", date: "Mar 01, 2026", category: "Income", amount: 16281.48, type: "income", status: "Completed" },
  { id: "t2", name: "Netflix", detail: "Subscription", initial: "N", tint: "#fdecec", fg: "#e11d48", date: "Mar 08, 2026", category: "Entertainment", amount: -15.99, type: "expense", status: "Completed" },
  { id: "t3", name: "Whole Foods Market", detail: "Card ··2472", initial: "W", tint: "#eaf7ef", fg: "#16a34a", date: "Mar 10, 2026", category: "Groceries", amount: -86.4, type: "expense", status: "Completed" },
  { id: "t4", name: "Figma", detail: "Annual plan", initial: "F", tint: "#f1ecfb", fg: "#7c3aed", date: "Mar 12, 2026", category: "Software", amount: -144.0, type: "expense", status: "Pending" },
  { id: "t5", name: "Upwork Payout", detail: "Freelance", initial: "U", tint: "#eaf1fb", fg: "#2f6bd4", date: "Feb 28, 2026", category: "Income", amount: 2450.0, type: "income", status: "Completed" },
  { id: "t6", name: "Apple Store", detail: "Card ··2472", initial: "A", tint: "#fef6e7", fg: "#b7791f", date: "Mar 05, 2026", category: "Shopping", amount: -1299.0, type: "expense", status: "Failed" },
];

export const usd = (n: number, withSign = false) => {
  const s = Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sign = n < 0 ? "-" : withSign ? "+" : "";
  return `${sign}$${s}`;
};

export const pct = (n: number) => `${n > 0 ? "+" : n < 0 ? "-" : ""}${Math.abs(n)}%`;
