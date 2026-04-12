"use client";

import { useState } from "react";
import {
  createApiToken,
  deleteApiToken,
} from "@/app/(restricted)/[slug]/api-tokens/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ApiToken {
  id: number;
  token: string;
  name: string;
  createdAt: number;
}

interface ApiTokensListProps {
  initialTokens: ApiToken[];
  slug: string;
}

export function ApiTokensList({ initialTokens, slug }: ApiTokensListProps) {
  const [tokens, setTokens] = useState(initialTokens);
  const [name, setName] = useState("");
  const [newToken, setNewToken] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsCreating(true);
    try {
      const result = await createApiToken(slug, name.trim());
      setNewToken(result.token);
      setName("");
      setTokens((prev) => [
        {
          id: Date.now(),
          token: result.token,
          name: name.trim(),
          createdAt: Math.floor(Date.now() / 1000),
        },
        ...prev,
      ]);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (tokenId: number) => {
    await deleteApiToken(slug, tokenId);
    setTokens((prev) => prev.filter((t) => t.id !== tokenId));
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Create token</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Input
              onChange={(e) => setName(e.target.value)}
              placeholder="Token name (e.g. CLI)"
              value={name}
            />
            <Button
              disabled={!name.trim() || isCreating}
              onClick={handleCreate}
              size="sm"
            >
              Create
            </Button>
          </div>
          {newToken && (
            <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm dark:border-green-800 dark:bg-green-950">
              <p className="mb-1 font-medium">
                Token created. Copy it now — it won't be shown again:
              </p>
              <code className="break-all text-xs">{newToken}</code>
            </div>
          )}
        </CardContent>
      </Card>

      {tokens.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your tokens</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {tokens.map((t) => (
              <div
                className="flex items-center justify-between rounded-md border p-3"
                key={t.id}
              >
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {t.token.slice(0, 8)}...{" "}
                    {new Date(t.createdAt * 1000).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  onClick={() => handleDelete(t.id)}
                  size="sm"
                  variant="destructive"
                >
                  Delete
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
