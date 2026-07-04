"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";

import { loginAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {
    ok: false,
    message: "",
  });

  return (
    <form action={action} className="grid gap-4">
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-brand-dark">E-mail</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-12 rounded-md border border-brand-dark/12 px-3 text-sm"
        />
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-brand-dark">Senha</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-12 rounded-md border border-brand-dark/12 px-3 text-sm"
        />
      </label>
      {state?.message ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        <LogIn className="size-4" aria-hidden />
        {pending ? "Entrando..." : "Entrar no painel"}
      </Button>
    </form>
  );
}
