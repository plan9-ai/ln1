"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/lib/auth-actions";
import { cn } from "@/lib/utils";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await requestPasswordReset(email);

    if (result?.error) {
      toast.error(result.error.message ?? "Failed to send reset email");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="p-6 md:p-8">
          {sent ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="font-bold text-2xl">Check your email</h1>
              <p className="text-balance text-muted-foreground text-sm">
                We sent a password reset link to <strong>{email}</strong>. Check
                your inbox and follow the link.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="font-bold text-2xl">Reset your password</h1>
                  <p className="text-balance text-muted-foreground text-sm">
                    Enter your email and we&apos;ll send you a reset link
                  </p>
                </div>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="m@example.com"
                    required
                    type="email"
                    value={email}
                  />
                </Field>
                <Field>
                  <Button disabled={loading} type="submit">
                    {loading ? "Sending..." : "Send reset link"}
                  </Button>
                </Field>
                <FieldDescription className="text-center">
                  Remember your password? <a href="/login">Sign in</a>
                </FieldDescription>
              </FieldGroup>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
