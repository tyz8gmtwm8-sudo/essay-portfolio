"use client";

// 文字列をクリップボードにコピーするボタン
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "./ui";

export function CopyButton({ text }: { text: string }) {
  const t = useTranslations("common");
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // クリップボードが使えない環境では何もしない
    }
  }

  return (
    <Button type="button" variant="secondary" onClick={handleCopy} aria-live="polite">
      {copied ? t("copied") : t("copy")}
    </Button>
  );
}
