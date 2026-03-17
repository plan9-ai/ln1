import { AdminAuthGate } from "@/components/admin-auth-gate";
import { getAuthSession } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  if (!session) {
    return <AdminAuthGate reason="unauthenticated" />;
  }

  if (session.user.role !== "admin") {
    return <AdminAuthGate reason="forbidden" />;
  }

  return <>{children}</>;
}
