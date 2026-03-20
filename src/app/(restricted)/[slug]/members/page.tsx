import { redirect } from "next/navigation";
import { AddMemberForm } from "@/components/add-member-form";
import { InvitesTable } from "@/components/invites-table";
import { MembersList } from "@/components/members-list";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getAuthSession } from "@/lib/auth";
import { TeamInvitesService } from "@/modules/team-invites/service";
import { TeamsService } from "@/modules/teams/service";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getAuthSession();
  if (!session) {
    redirect("/login");
  }

  const { slug } = await params;
  const [members, currentRole, invites] = await Promise.all([
    TeamsService.getMembersByTeamSlug(session.user.id, slug),
    TeamsService.getMemberRole(session.user.id, slug),
    TeamInvitesService.getPendingInvitesByTeamSlug(session.user.id, slug),
  ]);

  if (!currentRole) {
    redirect(`/${slug}`);
  }

  const canAddMembers = currentRole === "owner" || currentRole === "admin";

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            className="mr-2 data-[orientation=vertical]:h-4"
            orientation="vertical"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/${slug}`}>Team</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Members</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center p-4 pt-0">
        <div className="w-full max-w-2xl">
          {canAddMembers && <AddMemberForm slug={slug} />}
          <MembersList
            currentUserId={session.user.id}
            currentUserRole={currentRole}
            members={members}
            slug={slug}
          />
          {canAddMembers && (
            <InvitesTable
              canManage={canAddMembers}
              invites={invites}
              slug={slug}
            />
          )}
        </div>
      </div>
    </>
  );
}
