"use client";

import { AppSidebar } from "@/components/app-sidebar";
import type { ProjectListItem } from "@/components/nav-main";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { TeamWithRole } from "@/modules/teams/model";

interface DashboardShellProps {
  teams: TeamWithRole[];
  currentSlug: string;
  projects: ProjectListItem[];
  children: React.ReactNode;
}

export function DashboardShell({
  teams,
  currentSlug,
  projects,
  children,
}: DashboardShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar currentSlug={currentSlug} projects={projects} teams={teams} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
