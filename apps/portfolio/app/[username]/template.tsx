import type { ReactNode } from "react";

// template.tsx はページを移動するたびに作り直されるので、
// ここに付けた CSS アニメーション（.page-enter）が「ページ切り替えアニメーション」になる。
export default function UserTemplate({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
