"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NewIssueButtonProps {
  projects: { id: number; title: string }[];
}

export function NewIssueButton({ projects }: NewIssueButtonProps) {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  if (projects.length === 0) {
    return (
      <Button asChild size="sm">
        <Link href={`/${slug}/projects/new`}>
          <Plus />
          Create Project
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm">
          <Plus />
          New Issue
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Select project</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {projects.map((project) => (
          <DropdownMenuItem asChild key={project.id}>
            <Link href={`/${slug}/projects/${project.id}/issues/new`}>
              {project.title}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
