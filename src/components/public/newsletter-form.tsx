"use client";

import { useActionState } from "react";
import { subscribeNewsletter } from "@/server/actions/newsletter";

interface NewsletterFormProps {
  placeholder?: string;
  buttonText?: string;
}

const initialState = null;

export function NewsletterForm({ placeholder, buttonText }: NewsletterFormProps) {
  const [state, formAction, isPending] = useActionState(subscribeNewsletter, initialState);

  if (state?.success) {
    return (
      <p className="text-sm font-medium text-emerald-600 py-3">
        Teşekkürler! Bültenimize başarıyla abone oldunuz.
      </p>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <form action={formAction} className="flex gap-3">
        <input
          type="email"
          name="email"
          required
          placeholder={placeholder ?? "E-posta adresiniz"}
          className="flex-1 px-4 py-2.5 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          style={{ border: "1px solid var(--kt-border)", backgroundColor: "var(--kt-surface)", color: "var(--kt-heading)" }}
        />
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 disabled:opacity-60 text-white rounded-md text-sm font-medium transition"
          style={{ backgroundColor: "var(--kt-primary)" }}
        >
          {isPending ? "..." : (buttonText ?? "Abone Ol")}
        </button>
      </form>
      {state?.error && (
        <p className="mt-2 text-xs text-center" style={{ color: "var(--kt-primary)" }}>{state.error}</p>
      )}
    </div>
  );
}
