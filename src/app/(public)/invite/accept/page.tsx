import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthSession } from "@/lib/auth";
import { signOut } from "@/lib/auth-actions";
import { logger } from "@/lib/logger";
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
  } catch (err) {
    logger.error({ err }, "invite/accept error");
    const inviteUrl = `/invite/accept?token=${token}`;
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Wrong account</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You are signed in as <strong>{session.user.email}</strong>, but
              this invitation was sent to a different email address. Sign out
              and sign in with the correct account.
            </p>
            <form action={signOut.bind(null, inviteUrl)} className="mt-4">
              <Button type="submit">Sign out</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }
}
