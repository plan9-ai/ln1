import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";

export default async function RestrictedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();
  if (!session) {
    redirect("/login");
  }
  return <>{children}</>;
}
