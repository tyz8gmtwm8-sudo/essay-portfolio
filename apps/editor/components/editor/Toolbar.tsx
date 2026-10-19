"use client";

// エディタのツールバー：太字・斜体・文字サイズ・見出し・引用・区切り線

import { useEditorState, type Editor } from "@tiptap/react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { FONT_SIZES, type FontSize } from "@portfolio/shared";

export function Toolbar({ editor }: { editor: Editor }) {
  const t = useTranslations("essay.toolbar");

  // カーソル位置の書式を読み取り、ボタンの「オン/オフ」表示に使う
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      quote: e.isActive("blockquote"),
      size: (e.getAttributes("fontSize").size as FontSize | undefined) ?? "normal",
    }),
  });

  const chain = () => editor.chain().focus();

  return (
    <div
      role="toolbar"
      aria-label={t("label")}
      className="sticky top-[57px] z-10 -mx-1 flex flex-wrap items-center gap-1 border-b border-line bg-card/95 px-1 py-2 backdrop-blur"
    >
      <ToolButton label={t("bold")} active={state.bold} onClick={() => chain().toggleBold().run()}>
        <span className="font-bold">B</span>
      </ToolButton>
      <ToolButton label={t("italic")} active={state.italic} onClick={() => chain().toggleItalic().run()}>
        <span className="font-serif italic">I</span>
      </ToolButton>

      <Separator />

      <label className="sr-only" htmlFor="font-size">
        {t("size")}
      </label>
      <select
        id="font-size"
        value={state.size}
        onChange={(event) => {
          const size = event.target.value;
          if (size === "normal") chain().unsetFontSize().run();
          else chain().setFontSize(size as FontSize).run();
        }}
        className="h-9 rounded-md border border-line bg-card px-2 text-sm"
      >
        <option value="small">{t("sizeSmall")}</option>
        <option value="normal">{t("sizeNormal")}</option>
        {FONT_SIZES.filter((size) => size !== "small").map((size) => (
          <option key={size} value={size}>
            {size === "large" ? t("sizeLarge") : t("sizeXLarge")}
          </option>
        ))}
      </select>

      <Separator />

      <ToolButton label={t("heading2")} active={state.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}>
        H2
      </ToolButton>
      <ToolButton label={t("heading3")} active={state.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()}>
        H3
      </ToolButton>
      <ToolButton label={t("quote")} active={state.quote} onClick={() => chain().toggleBlockquote().run()}>
        <span aria-hidden className="text-lg leading-none">”</span>
      </ToolButton>
      <ToolButton label={t("divider")} onClick={() => chain().setHorizontalRule().run()}>
        <span aria-hidden>―</span>
      </ToolButton>
    </div>
  );
}

function ToolButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active ?? undefined}
      onClick={onClick}
      className="inline-flex size-9 items-center justify-center rounded-md text-sm text-ink hover:bg-ink/5 aria-pressed:bg-brand-soft aria-pressed:text-brand"
    >
      {children}
    </button>
  );
}

function Separator() {
  return <span aria-hidden className="mx-1 h-5 w-px bg-line" />;
}
