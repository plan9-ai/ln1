import { ApiTokensList } from "@/components/api-tokens-list";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getAuthSession } from "@/lib/auth";
import { ApiTokensService } from "@/modules/api-tokens/service";

export default async function ApiTokensPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getAuthSession();
  if (!session) {
    return null;
  }

  const { slug } = await params;
  const tokens = await ApiTokensService.getTokensByUserId(session.user.id);

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
                <BreadcrumbPage>API Tokens</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center p-4 pt-0">
        <div className="w-full max-w-2xl">
          <div className="mb-6">
            <h1 className="font-semibold text-2xl">API Tokens</h1>
            <p className="mt-1 text-muted-foreground text-sm">
              Create tokens to access the API at{" "}
              <code className="text-xs">/api/my/&lt;token&gt;/issues</code>
            </p>
          </div>
          <ApiTokensList initialTokens={tokens} slug={slug} />
        </div>
      </div>
    </>
  );
}
