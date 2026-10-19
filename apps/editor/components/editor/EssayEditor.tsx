"use client";

// エッセイの編集画面の本体。新規作成（/essays/new）と編集（/essays/[id]）の両方で使う。
// - 入力が止まって数秒後に自動保存
// - 保存していない変更があるときにページを離れようとすると警告
// - 削除は確認ダイアログを挟む

import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { LIMITS, type EssayStatus, type RichTextDoc } from "@portfolio/shared";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button, Notice } from "@/components/ui";
import { useSignedIn } from "@/lib/auth";
import { createEssay, deleteEssay, updateEssay } from "@/lib/essays";
import { errorKey, type ErrorKey } from "@/lib/errors";
import { FontSizeMark } from "./font-size";
import { Toolbar } from "./Toolbar";

/** 入力が止まってから自動保存するまでの時間（ミリ秒） */
const AUTOSAVE_DELAY = 2500;

const portfolioUrl = process.env.NEXT_PUBLIC_PORTFOLIO_URL ?? "http://localhost:3000";

export interface EssayEditorInitial {
  id: string;
  title: string;
  slug: string;
  body: RichTextDoc;
  status: EssayStatus;
  publishedAt: Date | null;
}

type SaveState = "idle" | "dirty" | "saving" | "saved" | "needsTitle" | "tooLarge" | "error";

const EMPTY_DOC: RichTextDoc = { type: "doc", content: [{ type: "paragraph" }] };

export function EssayEditor({ initial }: { initial: EssayEditorInitial | null }) {
  const t = useTranslations("essay");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const format = useFormatter();
  const router = useRouter();
  const { user, profile } = useSignedIn();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [status, setStatus] = useState<EssayStatus>(initial?.status ?? "draft");
  const [publishedAt, setPublishedAt] = useState<Date | null>(initial?.publishedAt ?? null);
  const [essayId, setEssayId] = useState<string | null>(initial?.id ?? null);
  const [slug, setSlug] = useState<string | null>(initial?.slug ?? null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<ErrorKey | null>(null);
  const [changeCount, setChangeCount] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 最新の値を「ref」にも入れておく（タイマーや画面を閉じるときの処理から最新の値を読むため）
  const latest = useRef({ title, status, body: initial?.body ?? EMPTY_DOC });
  latest.current.title = title;
  latest.current.status = status;
  const idRef = useRef(essayId);
  const hasPublishedAtRef = useRef(publishedAt !== null);
  const savingRef = useRef(false);
  const pendingRef = useRef(false);
  const dirtyRef = useRef(false);

  const markDirty = useCallback(() => {
    dirtyRef.current = true;
    setSaveState("dirty");
    setChangeCount((count) => count + 1);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        // 使わない機能はオフにする（保存される形式をシンプルに保つため）
        bulletList: false,
        orderedList: false,
        listItem: false,
        listKeymap: false,
        code: false,
        codeBlock: false,
        strike: false,
        underline: false,
        link: false,
      }),
      FontSizeMark,
      Placeholder.configure({ placeholder: t("bodyPlaceholder") }),
    ],
    content: initial?.body ?? "",
    // サーバー側では描画せず、ブラウザで表示されてからエディタを作る（Next.js での推奨設定）
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "essay-body", "aria-label": t("bodyLabel"), role: "textbox", "aria-multiline": "true" },
    },
    onUpdate: ({ editor: e }) => {
      latest.current.body = e.getJSON() as RichTextDoc;
      markDirty();
    },
  });

  /** 保存処理。新規ならエッセイを作成し、URL を /essays/<id> に置き換える */
  const save = useCallback(async () => {
    if (savingRef.current) {
      // 保存中に呼ばれたら、終わってからもう一度保存する
      pendingRef.current = true;
      return;
    }
    const { title: rawTitle, status: currentStatus, body } = latest.current;
    const trimmedTitle = rawTitle.trim();
    if (!trimmedTitle) {
      setSaveState("needsTitle");
      return;
    }
    const tooLarge =
      JSON.stringify(body).length > LIMITS.bodyJsonChars || (body.content?.length ?? 0) > LIMITS.bodyBlocks;
    if (tooLarge) {
      setSaveState("tooLarge");
      return;
    }

    savingRef.current = true;
    dirtyRef.current = false;
    setSaveState("saving");
    setError(null);
    const input = { title: trimmedTitle.slice(0, LIMITS.title), body, status: currentStatus };
    try {
      if (!idRef.current) {
        const created = await createEssay(user.uid, input);
        idRef.current = created.id;
        setEssayId(created.id);
        setSlug(created.slug);
        // 画面を作り直さずに URL だけを置き換える（入力中のカーソル位置を保つため）
        window.history.replaceState(null, "", `/essays/${created.id}`);
      } else {
        await updateEssay(user.uid, idRef.current, input, hasPublishedAtRef.current);
      }
      if (currentStatus === "published" && !hasPublishedAtRef.current) {
        hasPublishedAtRef.current = true;
        setPublishedAt(new Date());
      }
      setSaveState(dirtyRef.current ? "dirty" : "saved");
    } catch (e) {
      dirtyRef.current = true;
      setError(errorKey(e));
      setSaveState("error");
    } finally {
      savingRef.current = false;
      if (pendingRef.current) {
        pendingRef.current = false;
        void save();
      }
    }
  }, [user.uid]);

  // 自動保存：最後の変更から AUTOSAVE_DELAY 後に保存
  useEffect(() => {
    if (changeCount === 0) return;
    const timer = setTimeout(() => void save(), AUTOSAVE_DELAY);
    return () => clearTimeout(timer);
  }, [changeCount, save]);

  // 画面を離れるとき（アプリ内の移動）に未保存の変更があれば保存しておく
  useEffect(() => {
    return () => {
      if (dirtyRef.current && latest.current.title.trim()) void save();
    };
  }, [save]);

  // ブラウザを閉じる・再読み込みするときに未保存の変更があれば警告
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (dirtyRef.current || savingRef.current) {
        event.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  function handleStatusChange(next: EssayStatus) {
    if (!latest.current.title.trim()) {
      setSaveState("needsTitle");
      return;
    }
    setStatus(next);
    latest.current.status = next;
    dirtyRef.current = true;
    void save();
  }

  async function handleDelete() {
    if (!essayId) return;
    setDeleting(true);
    try {
      dirtyRef.current = false;
      await deleteEssay(user.uid, essayId);
      router.replace("/");
    } catch (e) {
      setError(errorKey(e));
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  function handleBack(event: MouseEvent) {
    if ((dirtyRef.current || savingRef.current) && !window.confirm(t("leaveConfirm"))) {
      event.preventDefault();
    }
  }

  const publicUrl =
    status === "published" && slug ? `${portfolioUrl}/${profile.username}/essays/${slug}` : null;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href="/" onClick={handleBack} className="text-sm text-sub hover:text-ink">
          ← {t("backToList")}
        </Link>
        <SaveIndicator state={saveState} />
      </div>

      <div className="rounded-2xl border border-line bg-card px-4 pb-10 sm:px-10">
        <label htmlFor="essay-title" className="sr-only">
          {t("titleLabel")}
        </label>
        <input
          id="essay-title"
          value={title}
          maxLength={LIMITS.title}
          placeholder={t("titlePlaceholder")}
          onChange={(event) => {
            setTitle(event.target.value);
            latest.current.title = event.target.value;
            markDirty();
          }}
          className="w-full border-b border-line bg-transparent py-6 text-2xl font-bold outline-none placeholder:text-sub/50 sm:text-3xl"
        />
        <p className="mt-1 text-right text-xs tabular-nums text-sub">
          {title.length} / {LIMITS.title}
        </p>

        {editor && <Toolbar editor={editor} />}
        <div className="pt-6">
          <EditorContent editor={editor} />
        </div>
      </div>

      <div className="mt-6 space-y-4 rounded-2xl border border-line bg-card p-5">
        {saveState === "needsTitle" && <Notice tone="warn">{t("needsTitle")}</Notice>}
        {saveState === "tooLarge" && <Notice tone="danger">{t("tooLarge")}</Notice>}
        {error && <Notice tone="danger">{tErrors(error)}</Notice>}

        <fieldset>
          <legend className="mb-2 text-sm font-medium">{t("visibility")}</legend>
          <div className="flex flex-wrap gap-2">
            {(["draft", "published"] as const).map((value) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-soft has-[:checked]:text-brand"
              >
                <input
                  type="radio"
                  name="status"
                  value={value}
                  checked={status === value}
                  onChange={() => handleStatusChange(value)}
                  className="accent-brand"
                />
                {value === "draft" ? t("draft") : t("published")}
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-sub">
            {status === "published" ? t("publishedHint") : t("draftHint")}
            {publishedAt && ` ${t("publishedAt", { date: format.dateTime(publishedAt, { dateStyle: "long" }) })}`}
          </p>
          {publicUrl && (
            <a href={publicUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block break-all text-sm text-brand hover:underline">
              {publicUrl} ↗
            </a>
          )}
        </fieldset>

        <div className="flex flex-wrap justify-between gap-3 border-t border-line pt-4">
          <Button onClick={() => void save()} disabled={saveState === "saving"}>
            {t("saveNow")}
          </Button>
          {essayId && (
            <Button variant="ghost" className="text-danger hover:text-danger" onClick={() => setDeleteOpen(true)}>
              {t("delete")}
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title={t("deleteTitle")}
        confirmLabel={t("delete")}
        cancelLabel={tCommon("cancel")}
        danger
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      >
        {t("deleteDescription", { title: title || t("untitled") })}
      </ConfirmDialog>
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  const t = useTranslations("essay.saveState");
  const label: Record<SaveState, string | null> = {
    idle: null,
    dirty: t("dirty"),
    saving: t("saving"),
    saved: t("saved"),
    needsTitle: t("dirty"),
    tooLarge: t("error"),
    error: t("error"),
  };
  const dotColor =
    state === "saved" ? "bg-ok" : state === "error" || state === "tooLarge" ? "bg-danger" : "bg-warn";
  if (!label[state]) return null;
  return (
    <span role="status" className="inline-flex items-center gap-2 text-xs text-sub">
      <span aria-hidden className={`size-2 rounded-full ${dotColor} ${state === "saving" ? "animate-pulse" : ""}`} />
      {label[state]}
    </span>
  );
}
