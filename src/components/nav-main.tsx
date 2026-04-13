"use client";

import {
  Archive,
  Bell,
  ChevronRight,
  Link2,
  type LucideIcon,
  MoreHorizontal,
  Plus,
  Settings,
} from "lucide-react";
import Link from "next/link";

import type { ReactNode } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export interface ProjectListItem {
  id: number;
  title: string;
}

function renderProjectsSubItems(
  item: {
    title: string;
    items?: { title: string; url: string; badge?: ReactNode }[];
  },
  projects: ProjectListItem[] | undefined,
  currentSlug: string | undefined
) {
  if (item.title !== "Projects") {
    return item.items?.map((subItem) => (
      <SidebarMenuSubItem key={subItem.title}>
        <SidebarMenuSubButton asChild>
          <Link href={subItem.url}>
            <span>{subItem.title}</span>
            {subItem.badge}
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    ));
  }
  if (!projects || projects.length === 0) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link href={currentSlug ? `/${currentSlug}/projects/new` : "#"}>
            <span>Create project</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }
  return projects.map((p) => (
    <SidebarMenuItem key={p.id}>
      <SidebarMenuButton asChild>
        <Link href={`/${currentSlug}/projects/${p.id}/issues`}>
          <span>{p.title}</span>
        </Link>
      </SidebarMenuButton>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction>
            <MoreHorizontal />
            <span className="sr-only">Project settings</span>
          </SidebarMenuAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-48 rounded-lg"
          side="right"
        >
          <DropdownMenuItem asChild>
            <Link href={`/${currentSlug}/projects/${p.id}/edit`}>
              <Settings />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  ));
}

export function NavMain({
  items,
  currentSlug,
  projects,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
      badge?: ReactNode;
    }[];
  }[];
  currentSlug?: string;
  projects?: ProjectListItem[];
}) {
  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            asChild
            className="group/collapsible"
            defaultOpen={true}
            key={item.title}
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              {item.title === "Projects" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuAction className="z-10" showOnHover={false}>
                      <MoreHorizontal className="size-4 shrink-0" />
                      <span className="sr-only">More</span>
                    </SidebarMenuAction>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-48 rounded-lg"
                    side="right"
                  >
                    {currentSlug && (
                      <DropdownMenuItem asChild>
                        <Link href={`/${currentSlug}/projects/new`}>
                          <Plus />
                          <span>New project</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <Settings />
                      <span>Team settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link2 />
                      <span>Copy link</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Archive />
                      <span>Open archive</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Bell />
                      <span>Subscribe</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <span>Configure Slack notifications...</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-muted-foreground opacity-70">
                      <span>Leave team...</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <CollapsibleContent>
                {item.title === "Projects" ? (
                  <SidebarMenu>
                    {renderProjectsSubItems(item, projects, currentSlug)}
                  </SidebarMenu>
                ) : (
                  <SidebarMenuSub>
                    {renderProjectsSubItems(item, projects, currentSlug)}
                  </SidebarMenuSub>
                )}
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
