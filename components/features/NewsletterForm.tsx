"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "success" | "error";

export default function NewsletterForm() {
  const [email, setEmail]   = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;

    setStatus("loading");

    try {
      // Replace this with your actual newsletter provider (Mailchimp, ConvertKit…)
      // e.g. await fetch("/api/newsletter", { method: "POST", body: JSON.stringify({ email }) });
      await new Promise((r) => setTimeout(r, 900));
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 text-white py-2">
        <div className="w-12 h-12 rounded-full bg-white/15 border border-white/20 flex items-center justify-center">
          <CheckIcon />
        </div>
        <p className="font-semibold text-lg">Inscription confirmée !</p>
        <p className="text-white/60 text-sm">Bienvenue dans la communauté.</p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-1 text-xs text-white/40 hover:text-white/70 transition-colors underline underline-offset-2"
        >
          Inscrire une autre adresse
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-2">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-3"
        noValidate
      >
        <label htmlFor="newsletter-email" className="sr-only">
          Adresse email
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="votre@email.com"
          required
          autoComplete="email"
          className={cn(
            "flex-1 bg-white/10 border rounded-xl px-4 py-2.5",
            "text-white placeholder:text-white/35 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/40",
            "transition-all duration-150",
            status === "error"
              ? "border-red-400/60"
              : "border-white/20"
          )}
        />
        <Button
          type="submit"
          variant="white"
          size="md"
          loading={status === "loading"}
          disabled={!email.trim()}
        >
          S&rsquo;inscrire
        </Button>
      </form>

      {status === "error" && (
        <p className="text-red-300 text-xs text-center">
          Une erreur est survenue. Réessayez dans un instant.
        </p>
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
