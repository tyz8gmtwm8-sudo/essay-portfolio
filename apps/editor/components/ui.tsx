// 編集サイトで繰り返し使う小さな部品（ボタン・入力欄・お知らせなど）

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const buttonStyles: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white hover:bg-brand/90",
  secondary: "bg-card text-ink border border-line hover:bg-paper",
  ghost: "text-sub hover:text-ink hover:bg-ink/5",
  danger: "bg-danger text-white hover:bg-danger/90",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        buttonStyles[variant],
        className,
      )}
      {...props}
    />
  );
}

/** ボタンと同じ見た目のリンク用クラス */
export function buttonClass(variant: ButtonVariant = "primary", className?: string) {
  return cx(
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
    buttonStyles[variant],
    className,
  );
}

interface FieldProps {
  label: string;
  /** 入力欄の下に出す補足説明 */
  hint?: ReactNode;
  error?: ReactNode;
  /** 「12 / 30」のような文字数カウンター */
  counter?: { current: number; max: number };
}

export function TextField({
  label,
  hint,
  error,
  counter,
  id,
  className,
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement> & { id: string }) {
  return (
    <div className={className}>
      <FieldLabel id={id} label={label} counter={counter} />
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={hint || error ? `${id}-desc` : undefined}
        className="w-full rounded-lg border border-line bg-card px-3 py-2 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 aria-[invalid=true]:border-danger"
        {...props}
      />
      <FieldDescription id={id} hint={hint} error={error} />
    </div>
  );
}

export function TextArea({
  label,
  hint,
  error,
  counter,
  id,
  className,
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string }) {
  return (
    <div className={className}>
      <FieldLabel id={id} label={label} counter={counter} />
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={hint || error ? `${id}-desc` : undefined}
        className="w-full resize-y rounded-lg border border-line bg-card px-3 py-2 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        {...props}
      />
      <FieldDescription id={id} hint={hint} error={error} />
    </div>
  );
}

function FieldLabel({ id, label, counter }: { id: string; label: string; counter?: FieldProps["counter"] }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {counter && (
        <span className={cx("text-xs tabular-nums", counter.current > counter.max ? "text-danger" : "text-sub")}>
          {counter.current} / {counter.max}
        </span>
      )}
    </div>
  );
}

function FieldDescription({ id, hint, error }: { id: string; hint?: ReactNode; error?: ReactNode }) {
  if (!hint && !error) return null;
  return (
    <p id={`${id}-desc`} className={cx("mt-1.5 text-xs", error ? "text-danger" : "text-sub")}>
      {error ?? hint}
    </p>
  );
}

type NoticeTone = "info" | "ok" | "warn" | "danger";

const noticeStyles: Record<NoticeTone, string> = {
  info: "bg-brand-soft text-brand",
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
};

/** 成功・警告・エラーなどのお知らせ枠。role="status" で読み上げソフトにも伝わる */
export function Notice({ tone = "info", children }: { tone?: NoticeTone; children: ReactNode }) {
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cx("rounded-lg px-4 py-3 text-sm", noticeStyles[tone])}>
      {children}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cx("rounded-2xl border border-line bg-card p-5 sm:p-7", className)}>{children}</section>;
}

export function PageTitle({ children, description }: { children: ReactNode; description?: ReactNode }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight">{children}</h1>
      {description && <p className="mt-1 text-sm text-sub">{description}</p>}
    </div>
  );
}

export function Spinner({ label }: { label: string }) {
  return (
    <div role="status" className="flex min-h-[40vh] items-center justify-center gap-3 text-sub">
      <span className="size-5 animate-spin rounded-full border-2 border-line border-t-brand" aria-hidden />
      <span className="text-sm">{label}</span>
    </div>
  );
}
