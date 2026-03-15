import { CreateTeamForm } from "@/components/create-team-form";

export function CreateTeamGuard() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-semibold text-2xl">Create your first team</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            You need to be a member of a team to use the system. Create your
            first team to get started.
          </p>
        </div>
        <CreateTeamForm />
      </div>
    </div>
  );
}
