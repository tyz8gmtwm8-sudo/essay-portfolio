"use client";

// 新規登録画面（/signup）：メール＋パスワード、または Google で登録

import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { GuestGate } from "@/components/Gate";
import { GoogleButton } from "@/components/GoogleButton";
import { Button, Card, Notice, TextField } from "@/components/ui";
import { firebaseAuth } from "@/lib/firebase";
import { errorKey, type ErrorKey } from "@/lib/errors";

const MIN_PASSWORD = 8;

export default function SignupPage() {
  return (
    <GuestGate>
      <SignupForm />
    </GuestGate>
  );
}

function SignupForm() {
  const t = useTranslations("auth");
  const tErrors = useTranslations("errors");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ErrorKey | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (password.length < MIN_PASSWORD) {
      setError("auth/weak-password");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { user } = await createUserWithEmailAndPassword(firebaseAuth(), email.trim(), password);
      // 確認メールを送る。リンクを押すまで編集はできない
      await sendEmailVerification(user);
      // 移動先（メール確認画面）は GuestGate が自動で判断する
    } catch (e) {
      setError(errorKey(e));
      setBusy(false);
    }
  }

  return (
    <Card>
      <h1 className="mb-1 text-xl font-bold">{t("signupTitle")}</h1>
      <p className="mb-5 text-sm text-sub">{t("signupDescription")}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD}
          hint={t("passwordHint", { min: MIN_PASSWORD })}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <Notice tone="danger">{tErrors(error)}</Notice>}
        <Button type="submit" className="w-full" disabled={busy}>
          {t("signup")}
        </Button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-sub" aria-hidden>
        <span className="h-px flex-1 bg-line" />
        {t("or")}
        <span className="h-px flex-1 bg-line" />
      </div>
      <GoogleButton onError={setError} />
      <p className="mt-6 text-center text-sm text-sub">
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          {t("login")}
        </Link>
      </p>
    </Card>
  );
}
