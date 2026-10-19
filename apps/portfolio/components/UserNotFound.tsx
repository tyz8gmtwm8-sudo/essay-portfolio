"use client";

import { NotFoundView } from "./NotFoundView";
import { usePortfolio } from "./PortfolioContext";

/** ユーザーのページ内の 404（存在しない・非公開のエッセイ） */
export function UserNotFound() {
  const info = usePortfolio();
  if (!info) return null;
  return (
    <NotFoundView
      title={info.strings.notFoundTitle}
      body={info.strings.notFoundBody}
      homeHref={`/${info.username}`}
      homeLabel={info.strings.goHome}
    />
  );
}
