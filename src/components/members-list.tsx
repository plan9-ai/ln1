"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { removeTeamMember } from "@/app/(restricted)/[slug]/members/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TeamMemberWithEmail } from "@/modules/teams/service";

interface MembersListProps {
  slug: string;
  members: TeamMemberWithEmail[];
  currentUserId: string;
  currentUserRole: "owner" | "admin" | "member" | "viewer";
}

export function MembersList({
  slug,
  members,
  currentUserId,
  currentUserRole,
}: MembersListProps) {
  const canRemoveOthers =
    currentUserRole === "owner" || currentUserRole === "admin";

  const canRemoveMember = (member: TeamMemberWithEmail) => {
    if (member.role === "owner") {
      return false;
    }
    if (member.userId === currentUserId) {
      return true;
    }
    return canRemoveOthers;
  };

  const handleRemove = async (userId: string) => {
    try {
      await removeTeamMember(slug, userId);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to remove member"
      );
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Members</CardTitle>
        <CardDescription>Team members and their roles.</CardDescription>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <p className="text-muted-foreground text-sm">No members yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {members.map((member) => (
              <li
                key={member.userId}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <span className="font-medium">{member.email}</span>
                  <span className="ml-2 text-muted-foreground text-sm">
                    {member.role}
                  </span>
                </div>
                {canRemoveMember(member) && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleRemove(member.userId)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                    <span className="sr-only">Remove</span>
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
