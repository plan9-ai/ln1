"use server";

import { revalidatePath } from "next/cache";
import { getAuthSession } from "@/lib/auth";
import { ApiTokensService } from "@/modules/api-tokens/service";

export async function createApiToken(
  slug: string,
  name: string
): Promise<{ token: string }> {
  const session = await getAuthSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const created = await ApiTokensService.createToken(session.user.id, name);
  revalidatePath(`/${slug}/api-tokens`);
  return { token: created.token };
}

export async function deleteApiToken(
  slug: string,
  tokenId: number
): Promise<void> {
  const session = await getAuthSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  await ApiTokensService.deleteToken(session.user.id, tokenId);
  revalidatePath(`/${slug}/api-tokens`);
}
