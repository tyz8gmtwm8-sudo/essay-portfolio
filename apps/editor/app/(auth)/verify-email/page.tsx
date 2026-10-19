"use client";

// メール確認待ちの画面（/verify-email）
// 確認メールのリンクを押した後に「確認しました」を押すと、次の画面（初回設定）へ進む

import { sendEmailVerification } from "firebase/auth";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { VerifyEmailGate } from "@/components/Gate";
import { Button, Card, Notice } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { errorKey, type ErrorKey } from "@/lib/errors";

export default function VerifyEmailPage() {
  return (
    <VerifyEmailGate>
      <VerifyEmail />
    </VerifyEmailGate>
  );
}

function VerifyEmail() {
  const t = useTranslations("auth");
  const tErrors = useTranslations("errors");
  const { user, refreshUser, logout } = useAuth();
  const [message, setMessage] = useState<"resent" | "notYet" | null>(null);
  const [error, setError] = useState<ErrorKey | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleCheck() {
    setBusy(true);
    setError(null);
    try {
      const verified = await refreshUser();
      // 確認済みなら VerifyEmailGate が自動で次の画面へ移動する
      if (!verified) setMessage("notYet");
    } catch (e) {
      setError(errorKey(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      await sendEmailVerification(user);
      setMessage("resent");
    } catch (e) {
      setError(errorKey(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <h1 className="mb-2 text-xl font-bold">{t("verifyTitle")}</h1>
      <p className="mb-5 text-sm leading-relaxed text-sub">
        {t("verifyDescription", { email: user?.email ?? "" })}
      </p>
      <div className="space-y-3">
        {message === "resent" && <Notice tone="ok">{t("verifyResent")}</Notice>}
        {message === "notYet" && <Notice tone="warn">{t("verifyNotYet")}</Notice>}
        {error && <Notice tone="danger">{tErrors(error)}</Notice>}
        <Button className="w-full" onClick={handleCheck} disabled={busy}>
          {t("verifyDone")}
        </Button>
        <Button variant="secondary" className="w-full" onClick={handleResend} disabled={busy}>
          {t("verifyResend")}
        </Button>
        <Button variant="ghost" className="w-full" onClick={logout}>
          {t("logout")}
        </Button>
      </div>
    </Card>
  );
}
