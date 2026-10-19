"use client";

// テーマ設定（/theme）：プリセット選択、メインカラーの微調整、プレビュー

import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  MIN_ACCENT_CONTRAST,
  THEME_PRESETS,
  THEME_PRESET_IDS,
  contrastRatio,
  normalizeTheme,
  resolveAccent,
  type UserTheme,
} from "@portfolio/shared";
import { ThemeFonts } from "@portfolio/ui";
import { ThemePreview } from "@/components/ThemePreview";
import { Button, Card, Notice, PageTitle } from "@/components/ui";
import { useSignedIn } from "@/lib/auth";
import { firestore } from "@/lib/firebase";
import { errorKey, type ErrorKey } from "@/lib/errors";

export default function ThemePage() {
  const t = useTranslations("theme");
  const tErrors = useTranslations("errors");
  const { user, profile } = useSignedIn();
  const [theme, setTheme] = useState<UserTheme>(normalizeTheme(profile.theme));
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<ErrorKey | null>(null);

  const preset = THEME_PRESETS[theme.preset];
  const accent = resolveAccent(theme);
  const contrast = contrastRatio(accent, preset.colors.background);
  const changed = JSON.stringify(theme) !== JSON.stringify(normalizeTheme(profile.theme));

  function update(next: UserTheme) {
    setTheme(next);
    setSaved(false);
  }

  async function handleSave() {
    setBusy(true);
    setError(null);
    try {
      await updateDoc(doc(firestore(), "users", user.uid), { theme, updatedAt: serverTimestamp() });
      setSaved(true);
    } catch (e) {
      setError(errorKey(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* プレビュー用に、全プリセットのフォントを読み込む */}
      <ThemeFonts presets={THEME_PRESET_IDS} />
      <PageTitle description={t("description")}>{t("title")}</PageTitle>
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 font-bold">{t("presets")}</h2>
            <div role="radiogroup" aria-label={t("presets")} className="grid grid-cols-2 gap-3">
              {THEME_PRESET_IDS.map((id) => {
                const p = THEME_PRESETS[id];
                const selected = theme.preset === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    // プリセットを変えたら、微調整した色はリセットする
                    onClick={() => update({ preset: id, accentColor: null })}
                    className="overflow-hidden rounded-xl border-2 border-line text-left transition-colors aria-checked:border-brand"
                  >
                    <div className="flex h-16 items-end gap-1.5 p-3" style={{ background: p.colors.background }}>
                      {[p.colors.accent, p.colors.text, p.colors.subText].map((color) => (
                        <span key={color} className="size-5 rounded-full" style={{ background: color }} />
                      ))}
                    </div>
                    <div className="border-t border-line bg-card px-3 py-2">
                      <p className="text-sm font-bold">{t(`preset.${id}.name`)}</p>
                      <p className="text-xs text-sub">{t(`preset.${id}.mood`)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card>
            <h2 className="mb-1 font-bold">{t("accent")}</h2>
            <p className="mb-4 text-sm text-sub">{t("accentDescription")}</p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-3">
                <input
                  type="color"
                  value={accent}
                  onChange={(e) => update({ ...theme, accentColor: e.target.value.toLowerCase() })}
                  className="h-10 w-16 cursor-pointer rounded-md border border-line bg-card p-1"
                />
                <span className="font-mono text-sm">{accent}</span>
                <span className="sr-only">{t("accent")}</span>
              </label>
              <Button
                type="button"
                variant="secondary"
                disabled={theme.accentColor === null}
                onClick={() => update({ ...theme, accentColor: null })}
              >
                {t("resetToPreset")}
              </Button>
            </div>
            <div className="mt-4">
              {contrast < MIN_ACCENT_CONTRAST ? (
                <Notice tone="warn">{t("lowContrast", { ratio: contrast.toFixed(1) })}</Notice>
              ) : (
                <p className="text-xs text-sub">{t("contrastOk", { ratio: contrast.toFixed(1) })}</p>
              )}
            </div>
          </Card>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleSave} disabled={busy || !changed}>
              {t("save")}
            </Button>
            {saved && <span className="text-sm text-ok">{t("saved")}</span>}
            {error && <Notice tone="danger">{tErrors(error)}</Notice>}
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="mb-3 text-sm font-medium text-sub">{t("preview")}</h2>
          <ThemePreview
            theme={theme}
            name={profile.name || profile.username}
            comment={profile.comment || t("sampleComment")}
            avatarUrl={profile.avatarUrl}
            sampleTitles={[t("sampleTitle1"), t("sampleTitle2")]}
            buttonLabel={t("sampleButton")}
          />
        </div>
      </div>
    </>
  );
}
