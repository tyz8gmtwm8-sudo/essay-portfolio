// エッセイ本文（Tiptap JSON）を React の要素に変換して表示する部品。
// HTML 文字列を使わないので、本文に <script> などが含まれていても実行されません。
// 知らない種類のノードは表示しない（または中身の文字だけ表示する）ことで安全側に倒しています。

import type { ReactNode } from "react";
import { FONT_SIZES, type RichTextDoc, type RichTextNode } from "@portfolio/shared";

interface EssayBodyProps {
  body: RichTextDoc | null | undefined;
  className?: string;
}

export function EssayBody({ body, className }: EssayBodyProps) {
  return (
    <div className={["essay-body", className].filter(Boolean).join(" ")}>
      {renderChildren(body?.content)}
    </div>
  );
}

function renderChildren(nodes: RichTextNode[] | undefined): ReactNode {
  if (!Array.isArray(nodes)) return null;
  return nodes.map((node, index) => renderNode(node, index));
}

function renderNode(node: RichTextNode, key: number): ReactNode {
  switch (node.type) {
    case "paragraph":
      return <p key={key}>{renderChildren(node.content)}</p>;
    case "heading": {
      const level = node.attrs?.level === 3 ? 3 : 2;
      const Tag = level === 3 ? "h3" : "h2";
      return <Tag key={key}>{renderChildren(node.content)}</Tag>;
    }
    case "blockquote":
      return <blockquote key={key}>{renderChildren(node.content)}</blockquote>;
    case "horizontalRule":
      return <hr key={key} />;
    case "hardBreak":
      return <br key={key} />;
    case "text":
      return renderText(node, key);
    default:
      // 想定外のノードは中身だけ描画する（中身がなければ何も出さない）
      return node.content ? <div key={key}>{renderChildren(node.content)}</div> : null;
  }
}

/** 文字に付いた書式（太字・斜体・文字サイズ）を外側から順に包んでいく */
function renderText(node: RichTextNode, key: number): ReactNode {
  let element: ReactNode = typeof node.text === "string" ? node.text : "";
  for (const mark of node.marks ?? []) {
    if (mark.type === "bold") {
      element = <strong>{element}</strong>;
    } else if (mark.type === "italic") {
      element = <em>{element}</em>;
    } else if (mark.type === "fontSize") {
      const size = mark.attrs?.size;
      if (typeof size === "string" && (FONT_SIZES as readonly string[]).includes(size)) {
        element = <span className={`essay-size-${size}`}>{element}</span>;
      }
    }
  }
  return <span key={key}>{element}</span>;
}

/** 本文から先頭の文章を取り出す（OGP の説明文などに使う） */
export function extractPlainText(body: RichTextDoc | null | undefined, maxLength = 120): string {
  const parts: string[] = [];
  const walk = (nodes: RichTextNode[] | undefined) => {
    for (const node of nodes ?? []) {
      if (typeof node.text === "string") parts.push(node.text);
      walk(node.content);
      if (node.type === "paragraph" || node.type === "heading") parts.push(" ");
    }
  };
  walk(body?.content);
  const text = parts.join("").replace(/\s+/g, " ").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}
