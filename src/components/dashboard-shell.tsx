"use client";

import { AppSidebar } from "@/components/app-sidebar";
import type { ProjectListItem } from "@/components/nav-main";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { TeamWithRole } from "@/modules/teams/model";

interface DashboardShellProps {
  teams: TeamWithRole[];
  currentSlug: string;
  projects: ProjectListItem[];
  myIssuesCount: number;
  user: { name: string; email: string; avatar: string };
  children: React.ReactNode;
}

export function DashboardShell({
  teams,
  currentSlug,
  projects,
  myIssuesCount,
  user,
  children,
}: DashboardShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar
        currentSlug={currentSlug}
        myIssuesCount={myIssuesCount}
        projects={projects}
        teams={teams}
        user={user}
      />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
