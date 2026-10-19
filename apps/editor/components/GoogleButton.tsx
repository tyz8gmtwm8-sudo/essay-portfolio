"use client";

// 「Googleで続ける」ボタン。ポップアップでGoogleアカウントを選んでログイン（初回なら登録）します。
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { firebaseAuth } from "@/lib/firebase";
import { errorKey, type ErrorKey } from "@/lib/errors";
import { Button } from "./ui";

export function GoogleButton({ onError }: { onError: (key: ErrorKey) => void }) {
  const t = useTranslations("auth");
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    try {
      await signInWithPopup(firebaseAuth(), new GoogleAuthProvider());
      // ログイン後の移動は GuestGate が自動で行う
    } catch (error) {
      const key = errorKey(error);
      if (key !== "auth/popup-closed-by-user") onError(key);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button type="button" variant="secondary" className="w-full" onClick={handleClick} disabled={busy}>
      <svg aria-hidden viewBox="0 0 24 24" className="size-4">
        <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7Z" />
        <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z" />
        <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1Z" />
        <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z" />
      </svg>
      {t("continueWithGoogle")}
    </Button>
  );
}
