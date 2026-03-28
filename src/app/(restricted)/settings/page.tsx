import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getAuthSession } from "@/lib/auth";
import { VerificationEmailButton } from "./verification-email-button";

export default async function SettingsPage() {
  const session = await getAuthSession();
  const email = session?.user.email ?? "";
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
                <BreadcrumbPage>Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center p-4 pt-0">
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="font-semibold text-2xl">Settings</h1>
            <p className="mt-2 text-muted-foreground text-sm">
              Manage your account settings.
            </p>
          </div>
          <div className="rounded-lg border p-6">
            <h2 className="mb-2 font-medium text-lg">Email Verification</h2>
            <p className="mb-4 text-muted-foreground text-sm">
              Send a verification email to confirm your email address.
            </p>
            <VerificationEmailButton email={email} />
          </div>
        </div>
      </div>
    </>
  );
}
