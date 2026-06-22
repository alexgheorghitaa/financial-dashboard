import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getTransactionsForUser } from "@/server/transactions";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const data = await getTransactionsForUser(session.user.id);
  const transactions = data?.transactions ?? [];
  const now = new Date().toISOString();
  const accountCreatedAt = data?.account.createdAt ?? now;
  return <DashboardClient user={session.user} transactions={transactions} now={now} accountCreatedAt={accountCreatedAt} />;
}
