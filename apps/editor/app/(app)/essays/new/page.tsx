"use client";

// エッセイ新規作成（/essays/new）
// 最初に保存した時点でエッセイが作られ、URL が /essays/<id> に変わります。
import { EssayEditor } from "@/components/editor/EssayEditor";

export default function NewEssayPage() {
  return <EssayEditor initial={null} />;
}
