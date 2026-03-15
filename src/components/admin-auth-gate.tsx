"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export function AdminAuthGate({
  reason,
}: {
  reason: "unauthenticated" | "forbidden";
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await authClient.signIn.email({
      email,
      password,
    });

    if (error) {
      toast.error(error.message ?? "Failed to sign in");
      setLoading(false);
      return;
    }

    window.location.reload();
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6">
          {reason === "forbidden" ? (
            <div className="mb-6 text-center">
              <h1 className="font-bold text-xl">Access Denied</h1>
              <p className="mt-1 text-muted-foreground text-sm">
                You don&apos;t have admin privileges.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="mb-2 text-center">
                  <h1 className="font-bold text-xl">Admin Area</h1>
                  <p className="mt-1 text-muted-foreground text-sm">
                    Sign in to continue
                  </p>
                </div>
                <Field>
                  <FieldLabel htmlFor="admin-email">Email</FieldLabel>
                  <Input
                    id="admin-email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    required
                    type="email"
                    value={email}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="admin-password">Password</FieldLabel>
                  <Input
                    id="admin-password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    type="password"
                    value={password}
                  />
                </Field>
                <Field>
                  <Button className="w-full" disabled={loading} type="submit">
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
