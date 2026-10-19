"use client";

// ログイン画面（/login）：メール＋パスワード、Google、パスワード再設定メールの送信

import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { GuestGate } from "@/components/Gate";
import { GoogleButton } from "@/components/GoogleButton";
import { Button, Card, Notice, TextField } from "@/components/ui";
import { firebaseAuth } from "@/lib/firebase";
import { errorKey, type ErrorKey } from "@/lib/errors";

export default function LoginPage() {
  return (
    <GuestGate>
      <LoginForm />
    </GuestGate>
  );
}

function LoginForm() {
  const t = useTranslations("auth");
  const tErrors = useTranslations("errors");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ErrorKey | null>(null);
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [resetSent, setResetSent] = useState(false);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(firebaseAuth(), email.trim(), password);
      // ログイン後の移動は GuestGate が自動で行う
    } catch (e) {
      setError(errorKey(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleReset(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await sendPasswordResetEmail(firebaseAuth(), email.trim());
      setResetSent(true);
    } catch (e) {
      setError(errorKey(e));
    } finally {
      setBusy(false);
    }
  }

  if (mode === "reset") {
    return (
      <Card>
        <h1 className="mb-1 text-xl font-bold">{t("resetTitle")}</h1>
        <p className="mb-5 text-sm text-sub">{t("resetDescription")}</p>
        <form onSubmit={handleReset} className="space-y-4">
          <TextField
            id="email"
            label={t("email")}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {resetSent && <Notice tone="ok">{t("resetSent")}</Notice>}
          {error && <Notice tone="danger">{tErrors(error)}</Notice>}
          <Button type="submit" className="w-full" disabled={busy}>
            {t("sendResetEmail")}
          </Button>
        </form>
        <button type="button" className="mt-4 text-sm text-brand hover:underline" onClick={() => setMode("login")}>
          {t("backToLogin")}
        </button>
      </Card>
    );
  }

  return (
    <Card>
      <h1 className="mb-5 text-xl font-bold">{t("loginTitle")}</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <TextField
          id="email"
          label={t("email")}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          id="password"
          label={t("password")}
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <Notice tone="danger">{tErrors(error)}</Notice>}
        <Button type="submit" className="w-full" disabled={busy}>
          {t("login")}
        </Button>
      </form>
      <button
        type="button"
        className="mt-3 text-sm text-brand hover:underline"
        onClick={() => {
          setMode("reset");
          setError(null);
        }}
      >
        {t("forgotPassword")}
      </button>
      <Divider label={t("or")} />
      <GoogleButton onError={setError} />
      <p className="mt-6 text-center text-sm text-sub">
        {t("noAccount")}{" "}
        <Link href="/signup" className="font-medium text-brand hover:underline">
          {t("signup")}
        </Link>
      </p>
    </Card>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-sub" aria-hidden>
      <span className="h-px flex-1 bg-line" />
      {label}
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
