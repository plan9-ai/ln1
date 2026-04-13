"use client";

import { Bot, FileJson2, LayoutDashboard, Settings2, SquareTerminal } from "lucide-react";
import type * as React from "react";
import { NavLinks } from "@/components/nav-links";
import type { ProjectListItem } from "@/components/nav-main";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { TeamWithRole } from "@/modules/teams/model";

function getNavMain(
  currentSlug: string,
  projects: { id: number; title: string }[],
  myIssuesCount: number
) {
  const hasProjects = projects && projects.length > 0;
  return [
    {
      title: "My",
      url: "#",
      icon: Bot,
      items: [
        { title: "Notifications", url: `/${currentSlug}/notifications` },
        {
          title: "Issues",
          url: hasProjects
            ? `/${currentSlug}/all-my-issues`
            : `/${currentSlug}/projects/new`,
          count: myIssuesCount,
        },
      ],
    },
    {
      title: "Projects",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [],
    },
    {
      title: "Team Settings",
      url: "#",
      icon: Settings2,
      items: [
        { title: "General", url: "#" },
        { title: "Projects", url: `/${currentSlug}/projects` },
        { title: "Members", url: `/${currentSlug}/members` },
        { title: "API Tokens", url: `/${currentSlug}/api-tokens` },
        { title: "My Profile", url: "#" },
      ],
    },
  ];
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  teams: TeamWithRole[];
  currentSlug: string;
  projects: ProjectListItem[];
  myIssuesCount: number;
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}

export function AppSidebar({
  teams,
  currentSlug,
  projects,
  myIssuesCount,
  user,
  ...props
}: AppSidebarProps) {
  const linksItems = [
    { title: "Dashboard", url: `/${currentSlug}`, icon: LayoutDashboard },
    { title: "OpenAPI", url: "/api/my/openapi", icon: FileJson2 },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher currentSlug={currentSlug} teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          currentSlug={currentSlug}
          items={getNavMain(currentSlug, projects, myIssuesCount)}
          projects={projects}
        />
        <NavLinks items={linksItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
