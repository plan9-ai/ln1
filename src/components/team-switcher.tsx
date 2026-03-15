"use client";

import { ChevronsUpDown, Plus, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import type { TeamWithRole } from "@/modules/teams/model";

interface TeamSwitcherProps {
  teams: TeamWithRole[];
  currentSlug: string;
}

export function TeamSwitcher({ teams, currentSlug }: TeamSwitcherProps) {
  const { isMobile } = useSidebar();
  const activeTeam = teams.find((t) => t.slug === currentSlug) ?? teams[0];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              size="lg"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {activeTeam ? (
                  <span className="font-medium text-sm">
                    {activeTeam.title.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <Users className="size-4" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeTeam?.title ?? "Select team"}
                </span>
                <span className="truncate text-xs">
                  {activeTeam ? activeTeam.role : ""}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Teams
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem asChild key={team.id}>
                <Link
                  className="flex cursor-pointer gap-2 p-2"
                  href={`/${team.slug}`}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <span className="font-medium text-xs">
                      {team.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-2">
                    <span>{team.title}</span>
                    <Badge className="font-normal text-xs" variant="secondary">
                      {team.role}
                    </Badge>
                  </div>
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                className="flex cursor-pointer items-center gap-2 p-2"
                href="/settings/teams/new"
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <span className="font-medium text-muted-foreground">
                  Create team
                </span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
