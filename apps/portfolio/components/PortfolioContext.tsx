"use client";

// ユーザーごとのページで共有する情報（ユーザー名と、404画面などで使う文言）。
// not-found.tsx はページの情報（params）を受け取れないので、ここから読み取ります。

import { createContext, useContext, type ReactNode } from "react";

export interface PortfolioInfo {
  username: string;
  strings: { notFoundTitle: string; notFoundBody: string; goHome: string };
}

const PortfolioContext = createContext<PortfolioInfo | null>(null);

export function PortfolioProvider({ value, children }: { value: PortfolioInfo; children: ReactNode }) {
  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio() {
  return useContext(PortfolioContext);
}
