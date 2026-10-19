// ファーストビュー：名前・顔写真・ひとことコメントが読み込み時にふわっと登場し、
// 下にスクロールを促すインジケーターを表示する。
// 登場の動きは CSS アニメーション（.rise）なので、JavaScript の読み込みを待たずに始まり表示が速い。

import type { CSSProperties } from "react";
import { cloudinaryAvatar, type ThemePresetId } from "@portfolio/shared";
import { Magnetic } from "./motion/Magnetic";

export interface HeroProps {
  preset: ThemePresetId;
  name: string;
  comment: string;
  avatarUrl: string;
  scrollLabel: string;
}

/** 登場の順番（秒）を CSS 変数で渡す */
const delay = (seconds: number) => ({ "--rise-delay": `${seconds}s` }) as CSSProperties;

export function Hero({ preset, name, comment, avatarUrl, scrollLabel }: HeroProps) {
  return (
    <header className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-24 text-center">
      {avatarUrl && (
        <div className="rise-pop mb-8" style={delay(0.05)}>
          <Magnetic strength={0.6}>
            {/* eslint-disable-next-line @next/next/no-img-element -- Cloudinary 側で正方形トリミング・最適化済み */}
            <img
              src={cloudinaryAvatar(avatarUrl, 400)}
              alt=""
              width={200}
              height={200}
              fetchPriority="high"
              className={`size-36 rounded-full border-4 border-theme-accent object-cover sm:size-48 ${
                preset === "night" ? "shadow-[0_0_60px_-10px_var(--accent)]" : "shadow-xl"
              }`}
            />
          </Magnetic>
        </div>
      )}
      <h1
        className="rise font-heading text-[clamp(2.5rem,8vw,5.5rem)] font-bold leading-tight tracking-tight"
        style={delay(0.2)}
      >
        {name}
      </h1>
      {comment && (
        <p className="rise mt-5 max-w-xl text-balance text-lg text-theme-muted sm:text-xl" style={delay(0.4)}>
          {comment}
        </p>
      )}
      <div className="rise absolute bottom-8 left-1/2 -translate-x-1/2" style={delay(0.9)}>
        <Magnetic>
          <a
            href="#essays"
            className="flex flex-col items-center gap-3 text-xs tracking-[0.3em] text-theme-muted no-underline"
          >
            {scrollLabel.toUpperCase()}
            <span aria-hidden className="relative block h-12 w-px overflow-hidden bg-theme-border">
              <span className="scroll-cue absolute inset-x-0 top-0 h-1/2 bg-theme-accent" />
            </span>
          </a>
        </Magnetic>
      </div>
    </header>
  );
}
