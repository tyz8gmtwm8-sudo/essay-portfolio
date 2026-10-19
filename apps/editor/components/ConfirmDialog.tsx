"use client";

// 確認ダイアログ。HTML 標準の <dialog> を使うので、Esc キーで閉じる・フォーカス移動などが自動で効きます。

import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "./ui";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  children?: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  busy?: boolean;
  /** false にすると「実行」ボタンを押せなくする（入力確認が必要な場合など） */
  canConfirm?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  cancelLabel,
  danger,
  busy,
  canConfirm = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      aria-labelledby="confirm-title"
      className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-2xl border border-line bg-card p-6 text-ink shadow-xl backdrop:bg-ink/40"
    >
      <h2 id="confirm-title" className="text-lg font-bold">
        {title}
      </h2>
      {children && <div className="mt-2 text-sm leading-relaxed text-sub">{children}</div>}
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </Button>
        <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} disabled={busy || !canConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
