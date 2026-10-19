"use client";

// 初回設定画面（/onboarding）：ポートフォリオのURLになるユーザー名を決める。
// 完了すると、プロフィールとテーマの初期データも自動で作られる。

import { doc, getDoc, runTransaction, serverTimestamp } from "firebase/firestore";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, type FormEvent } from "react";
import { DEFAULT_THEME, LIMITS, checkUsername, isLocale } from "@portfolio/shared";
import { OnboardingGate } from "@/components/Gate";
import { Button, Card, Notice, TextField } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { firestore } from "@/lib/firebase";
import { errorKey, type ErrorKey } from "@/lib/errors";

const portfolioUrl = process.env.NEXT_PUBLIC_PORTFOLIO_URL ?? "http://localhost:3000";

export default function OnboardingPage() {
  return (
    <OnboardingGate>
      <OnboardingForm />
    </OnboardingGate>
  );
}

type Availability = "idle" | "checking" | "available" | "taken";

function OnboardingForm() {
  const t = useTranslations("onboarding");
  const tErrors = useTranslations("errors");
  const locale = useLocale();
  const { user, logout } = useAuth();
  const [username, setUsername] = useState("");
  const [availability, setAvailability] = useState<Availability>("idle");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ErrorKey | "taken" | null>(null);

  const formatError = username ? checkUsername(username) : null;

  // 入力が止まって 0.5 秒後に「その名前が空いているか」を確認する
  useEffect(() => {
    if (!username || formatError) {
      setAvailability("idle");
      return;
    }
    setAvailability("checking");
    const timer = setTimeout(async () => {
      try {
        const snapshot = await getDoc(doc(firestore(), "usernames", username));
        setAvailability(snapshot.exists() ? "taken" : "available");
      } catch {
        setAvailability("idle");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [username, formatError]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user || formatError || !username) return;
    setBusy(true);
    setError(null);
    const db = firestore();
    try {
      await runTransaction(db, async (transaction) => {
        const usernameRef = doc(db, "usernames", username);
        if ((await transaction.get(usernameRef)).exists()) {
          throw new Error("taken");
        }
        transaction.set(usernameRef, { uid: user.uid });
        transaction.set(doc(db, "users", user.uid), {
          username,
          name: user.displayName?.slice(0, LIMITS.name) ?? "",
          comment: "",
          avatarUrl: "",
          theme: DEFAULT_THEME,
          locale: isLocale(locale) ? locale : "ja",
          essayCount: 0,
          lastDeletedEssayId: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
      // 完了すると OnboardingGate が自動でダッシュボードへ移動する
    } catch (e) {
      setError(e instanceof Error && e.message === "taken" ? "taken" : errorKey(e));
      setBusy(false);
    }
  }

  const hint =
    formatError === "format"
      ? t("errorFormat")
      : formatError === "reserved"
        ? t("errorReserved")
        : availability === "taken"
          ? t("errorTaken")
          : null;

  return (
    <Card>
      <h1 className="mb-1 text-xl font-bold">{t("title")}</h1>
      <p className="mb-5 text-sm leading-relaxed text-sub">{t("description")}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          id="username"
          label={t("username")}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          required
          maxLength={LIMITS.usernameMax}
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
          error={hint}
          hint={t("rules")}
          counter={{ current: username.length, max: LIMITS.usernameMax }}
        />
        <div className="rounded-lg bg-paper px-3 py-2 text-xs text-sub">
          <span className="block">{t("urlPreview")}</span>
          <span className="break-all font-mono text-ink">
            {portfolioUrl}/{username || "your-name"}
          </span>
        </div>
        {availability === "available" && <Notice tone="ok">{t("available")}</Notice>}
        {error && <Notice tone="danger">{error === "taken" ? t("errorTaken") : tErrors(error)}</Notice>}
        <Button
          type="submit"
          className="w-full"
          disabled={busy || !username || !!formatError || availability === "taken" || availability === "checking"}
        >
          {t("submit")}
        </Button>
        <p className="text-xs text-sub">{t("cannotChange")}</p>
      </form>
      <Button variant="ghost" className="mt-4 w-full" onClick={logout}>
        {t("logout")}
      </Button>
    </Card>
  );
}
