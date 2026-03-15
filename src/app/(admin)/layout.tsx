import { headers } from "next/headers";
import { AdminAuthGate } from "@/components/admin-auth-gate";
import { auth } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <AdminAuthGate reason="unauthenticated" />;
  }

  if (session.user.role !== "admin") {
    return <AdminAuthGate reason="forbidden" />;
  }

  return <>{children}</>;
}
