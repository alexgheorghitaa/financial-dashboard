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
  const contributions = data?.contributions ?? [];
  const savingsGoal = data?.savingsGoal ?? 0;
  const accounts = data?.accounts ?? [];
  const activeId = data?.activeId ?? "";
  const user = {
    name: data?.userName ?? session.user.name,
    email: data?.userEmail ?? session.user.email,
    image: session.user.image,
  };
  return (
    <DashboardClient
      user={user}
      transactions={transactions}
      now={now}
      accountCreatedAt={accountCreatedAt}
      contributions={contributions}
      savingsGoal={savingsGoal}
      accounts={accounts}
      activeId={activeId}
    />
  );
}
