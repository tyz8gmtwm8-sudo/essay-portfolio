"use client";

// アカウント設定（/settings）：表示言語、パスワード変更、退会（全データ削除）

import { EmailAuthProvider, reauthenticateWithCredential, signOut, updatePassword } from "firebase/auth";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { LOCALES, type Locale } from "@portfolio/shared";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button, Card, Notice, PageTitle, TextField } from "@/components/ui";
import { useSignedIn } from "@/lib/auth";
import { firebaseAuth, firestore } from "@/lib/firebase";
import { errorKey, type ErrorKey } from "@/lib/errors";
import { saveLocaleCookie } from "@/lib/locale";

export default function SettingsPage() {
  const t = useTranslations("settings");
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageTitle>{t("title")}</PageTitle>
      <LanguageSection />
      <PasswordSection />
      <DeleteAccountSection />
    </div>
  );
}

function LanguageSection() {
  const t = useTranslations("settings");
  const router = useRouter();
  const { user, profile } = useSignedIn();

  async function handleChange(locale: Locale) {
    saveLocaleCookie(locale);
    await updateDoc(doc(firestore(), "users", user.uid), { locale, updatedAt: serverTimestamp() });
    router.refresh();
  }

  return (
    <Card>
      <h2 className="mb-1 font-bold">{t("language")}</h2>
      <p className="mb-4 text-sm text-sub">{t("languageDescription")}</p>
      <div role="radiogroup" aria-label={t("language")} className="flex gap-2">
        {LOCALES.map((locale) => (
          <button
            key={locale}
            type="button"
            role="radio"
            aria-checked={profile.locale === locale}
            onClick={() => handleChange(locale)}
            className="rounded-lg border border-line px-4 py-2 text-sm aria-checked:border-brand aria-checked:bg-brand-soft aria-checked:text-brand"
          >
            {locale === "ja" ? "日本語" : "English"}
          </button>
        ))}
      </div>
    </Card>
  );
}

function PasswordSection() {
  const t = useTranslations("settings");
  const tErrors = useTranslations("errors");
  const { user } = useSignedIn();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<ErrorKey | null>(null);

  // Google でログインしている人はパスワードを持たない
  const hasPassword = user.providerData.some((p) => p.providerId === "password");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user.email) return;
    if (next.length < 8) {
      setError("auth/weak-password");
      return;
    }
    setBusy(true);
    setDone(false);
    setError(null);
    try {
      // 安全のため、今のパスワードで本人確認してから変更する
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, current));
      await updatePassword(user, next);
      setDone(true);
      setCurrent("");
      setNext("");
    } catch (e) {
      setError(errorKey(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <h2 className="mb-4 font-bold">{t("password")}</h2>
      {hasPassword ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            id="current-password"
            label={t("currentPassword")}
            type="password"
            autoComplete="current-password"
            required
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
          <TextField
            id="new-password"
            label={t("newPassword")}
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            hint={t("passwordHint")}
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
          {done && <Notice tone="ok">{t("passwordChanged")}</Notice>}
          {error && <Notice tone="danger">{tErrors(error)}</Notice>}
          <Button type="submit" disabled={busy}>
            {t("changePassword")}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-sub">{t("googleAccount")}</p>
      )}
    </Card>
  );
}

function DeleteAccountSection() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { user, profile } = useSignedIn();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleDelete() {
    setBusy(true);
    setFailed(false);
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/account", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      await signOut(firebaseAuth()).catch(() => undefined);
      router.replace("/login");
    } catch {
      setFailed(true);
      setBusy(false);
    }
  }

  return (
    <Card className="border-danger/30">
      <h2 className="mb-1 font-bold text-danger">{t("deleteAccount")}</h2>
      <p className="mb-4 text-sm text-sub">{t("deleteDescription")}</p>
      {failed && (
        <div className="mb-4">
          <Notice tone="danger">{t("deleteFailed")}</Notice>
        </div>
      )}
      <Button variant="danger" onClick={() => setOpen(true)}>
        {t("deleteAccount")}
      </Button>
      <ConfirmDialog
        open={open}
        title={t("deleteConfirmTitle")}
        confirmLabel={t("deleteForever")}
        cancelLabel={tCommon("cancel")}
        danger
        busy={busy}
        canConfirm={confirmText === profile.username}
        onConfirm={handleDelete}
        onCancel={() => {
          setOpen(false);
          setConfirmText("");
        }}
      >
        <p className="mb-3">{t("deleteConfirmDescription", { username: profile.username })}</p>
        <TextField
          id="delete-confirm"
          label={t("deleteConfirmLabel")}
          autoComplete="off"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
        />
      </ConfirmDialog>
    </Card>
  );
}
