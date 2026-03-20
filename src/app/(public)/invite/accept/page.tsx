import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthSession } from "@/lib/auth";
import { TeamInvitesService } from "@/modules/team-invites/service";

export default async function InviteAcceptPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid invitation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This invitation link is invalid or has expired.
            </p>
            <Button asChild className="mt-4">
              <Link href="/login">Go to login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const session = await getAuthSession();
  if (!session) {
    redirect(
      `/login?callbackUrl=${encodeURIComponent(`/invite/accept?token=${token}`)}`
    );
  }

  try {
    const { slug } = await TeamInvitesService.acceptInvite(
      session.user.id,
      session.user.email ?? "",
      token
    );
    redirect(`/${slug}`);
  } catch {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid or expired invitation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This invitation is invalid, has expired, or was sent to a
              different email address.
            </p>
            <Button asChild className="mt-4">
              <Link href="/app">Go to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
}
