import { createTeam } from "@/app/(restricted)/[slug]/teams/new/actions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";

export default function NewTeamPage() {
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
                <BreadcrumbLink href="/dashboard/teams/new">
                  Teams
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Create a team</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center p-4 pt-0">
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="font-semibold text-2xl">Create a new team</h1>
            <p className="mt-2 text-muted-foreground text-sm">
              Create a new team to manage separate cycles, workflows and
              notifications.
            </p>
          </div>

          <form action={createTeam} className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Team details</CardTitle>
                <CardDescription>
                  Set a title and description for your team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="title">Title</FieldLabel>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g. Engineering"
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="description">Description</FieldLabel>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Brief description of the team..."
                      rows={3}
                    />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button size="lg" type="submit">
                Create Team
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
