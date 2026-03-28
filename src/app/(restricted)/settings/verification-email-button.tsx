"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { sendVerificationEmail } from "./actions";

export function VerificationEmailButton({ email }: { email: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function handleClick() {
    setStatus("loading");
    const result = await sendVerificationEmail();
    if (result.error) {
      setErrorMessage(result.error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <div>
      <p className="mb-3 text-sm">
        Verification email will be sent to{" "}
        <span className="font-medium">{email}</span>
      </p>
      <Button
        disabled={status === "loading" || status === "sent"}
        onClick={handleClick}
      >
        {status === "loading" && "Sending..."}
        {status === "sent" && "Email sent!"}
        {status !== "loading" && status !== "sent" && "Send verification email"}
      </Button>
      {status === "error" && (
        <p className="mt-2 text-destructive text-sm">{errorMessage}</p>
      )}
      {status === "sent" && (
        <p className="mt-2 text-muted-foreground text-sm">
          Check your inbox for the verification email.
        </p>
      )}
    </div>
  );
}
