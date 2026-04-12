"use client";

import { Send } from "lucide-react";
import { toast } from "sonner";
import { resendTeamInvite } from "@/app/(restricted)/[slug]/members/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format-date";
import type { TeamInviteWithMeta } from "@/modules/team-invites/service";

interface InvitesTableProps {
  slug: string;
  invites: TeamInviteWithMeta[];
  canManage: boolean;
}

export function InvitesTable({ slug, invites, canManage }: InvitesTableProps) {
  const handleResend = async (inviteId: number) => {
    try {
      await resendTeamInvite(slug, inviteId);
      toast.success("Invitation resent");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to resend invitation"
      );
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Pending invites</CardTitle>
        <CardDescription>
          Invitations that have not been accepted yet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {invites.length === 0 ? (
          <p className="text-muted-foreground text-sm">No pending invites.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Invited at</TableHead>
                {canManage && (
                  <TableHead className="w-[100px]">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {invites.map((invite) => (
                <TableRow key={invite.id}>
                  <TableCell>{invite.email}</TableCell>
                  <TableCell>{invite.role}</TableCell>
                  <TableCell>{invite.status}</TableCell>
                  <TableCell>{formatDate(invite.createdAt)}</TableCell>
                  {canManage && (
                    <TableCell>
                      <Button
                        onClick={() => handleResend(invite.id)}
                        size="icon-sm"
                        variant="ghost"
                      >
                        <Send className="size-4" />
                        <span className="sr-only">Resend</span>
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
