"use client";

// プロフィール編集（/profile）：顔写真、名前、ひとことコメント

import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useTranslations } from "next-intl";
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { AVATAR_TYPES, LIMITS, cloudinaryAvatar } from "@portfolio/shared";
import { Button, Card, Notice, PageTitle, TextArea, TextField } from "@/components/ui";
import { useSignedIn } from "@/lib/auth";
import { firestore } from "@/lib/firebase";
import { errorKey, type ErrorKey } from "@/lib/errors";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tErrors = useTranslations("errors");
  const { user, profile } = useSignedIn();
  const [name, setName] = useState(profile.name);
  const [comment, setComment] = useState(profile.comment);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<ErrorKey | null>(null);

  const tooLong = name.length > LIMITS.name || comment.length > LIMITS.comment;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (tooLong) return;
    setBusy(true);
    setSaved(false);
    setError(null);
    try {
      await updateDoc(doc(firestore(), "users", user.uid), {
        name: name.trim(),
        comment: comment.trim(),
        updatedAt: serverTimestamp(),
      });
      setSaved(true);
    } catch (e) {
      setError(errorKey(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle description={t("description")}>{t("title")}</PageTitle>
      <Card className="mb-6">
        <AvatarUploader />
      </Card>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <TextField
            id="name"
            label={t("name")}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
            counter={{ current: name.length, max: LIMITS.name }}
            autoComplete="name"
          />
          <TextArea
            id="comment"
            label={t("comment")}
            rows={3}
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              setSaved(false);
            }}
            counter={{ current: comment.length, max: LIMITS.comment }}
            hint={t("commentHint")}
          />
          {saved && <Notice tone="ok">{t("saved")}</Notice>}
          {error && <Notice tone="danger">{tErrors(error)}</Notice>}
          <Button type="submit" disabled={busy || tooLong}>
            {t("save")}
          </Button>
        </form>
      </Card>
    </div>
  );
}

type UploadError = "type" | "size" | "failed" | "notConfigured";

/** 顔写真のアップロード */
function AvatarUploader() {
  const t = useTranslations("profile");
  const { user, profile } = useSignedIn();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<UploadError | null>(null);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError(null);

    // ① ブラウザ側でのチェック（種類とサイズ）
    if (!(AVATAR_TYPES as readonly string[]).includes(file.type)) {
      setError("type");
      return;
    }
    if (file.size > LIMITS.avatarBytes) {
      setError("size");
      return;
    }

    setUploading(true);
    try {
      // ② 編集サイトの API に署名を依頼（IDトークンで本人であることを伝える）
      const token = await user.getIdToken();
      const signResponse = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!signResponse.ok) {
        const body = (await signResponse.json().catch(() => ({}))) as { error?: string };
        setError(body.error === "cloudinary-not-configured" ? "notConfigured" : "failed");
        return;
      }
      const { cloudName, apiKey, params, signature } = (await signResponse.json()) as {
        cloudName: string;
        apiKey: string;
        params: Record<string, string>;
        signature: string;
      };

      // ③ 署名を付けて Cloudinary に直接アップロード
      const form = new FormData();
      form.append("file", file);
      form.append("api_key", apiKey);
      form.append("signature", signature);
      for (const [key, value] of Object.entries(params)) form.append(key, value);
      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: form,
      });
      if (!uploadResponse.ok) {
        setError("failed");
        return;
      }
      const uploaded = (await uploadResponse.json()) as { secure_url: string };

      // ④ 画像の URL を Firestore に保存（ポートフォリオに反映される）
      await updateDoc(doc(firestore(), "users", user.uid), {
        avatarUrl: uploaded.secure_url,
        updatedAt: serverTimestamp(),
      });
    } catch {
      setError("failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    await updateDoc(doc(firestore(), "users", user.uid), { avatarUrl: "", updatedAt: serverTimestamp() });
  }

  return (
    <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
      <div className="size-28 shrink-0 overflow-hidden rounded-full border border-line bg-paper">
        {profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- Cloudinary 側で最適化済みの画像
          <img src={cloudinaryAvatar(profile.avatarUrl, 224)} alt={t("avatarAlt")} className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-3xl text-sub" aria-hidden>
            ☺
          </div>
        )}
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">{t("avatar")}</p>
        <p className="text-xs text-sub">{t("avatarHint")}</p>
        <input
          ref={inputRef}
          type="file"
          accept={AVATAR_TYPES.join(",")}
          className="sr-only"
          onChange={handleFile}
          aria-label={t("chooseImage")}
          tabIndex={-1}
        />
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? t("uploading") : t("chooseImage")}
          </Button>
          {profile.avatarUrl && (
            <Button type="button" variant="ghost" onClick={handleRemove} disabled={uploading}>
              {t("removeImage")}
            </Button>
          )}
        </div>
        {error && <Notice tone="danger">{t(`uploadError.${error}`)}</Notice>}
      </div>
    </div>
  );
}
