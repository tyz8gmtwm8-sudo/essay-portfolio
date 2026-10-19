// ファーストビュー：名前・顔写真・ひとことコメント、スクロールを促す表示

import { cloudinaryAvatar, type ThemePresetId } from "@portfolio/shared";

export interface HeroProps {
  preset: ThemePresetId;
  name: string;
  comment: string;
  avatarUrl: string;
  scrollLabel: string;
}

export function Hero({ name, comment, avatarUrl, scrollLabel }: HeroProps) {
  return (
    <header className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-24 text-center">
      {avatarUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- Cloudinary 側で正方形トリミング・最適化済み
        <img
          src={cloudinaryAvatar(avatarUrl, 400)}
          alt=""
          width={200}
          height={200}
          fetchPriority="high"
          className="mb-8 size-36 rounded-full border-4 border-theme-accent object-cover shadow-xl sm:size-48"
        />
      )}
      <h1 className="font-heading text-[clamp(2.5rem,8vw,5.5rem)] font-bold leading-tight tracking-tight">{name}</h1>
      {comment && <p className="mt-5 max-w-xl text-lg text-theme-muted sm:text-xl">{comment}</p>}
      <a
        href="#essays"
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-xs tracking-[0.3em] text-theme-muted no-underline"
      >
        {scrollLabel.toUpperCase()}
        <span aria-hidden className="h-10 w-px bg-theme-muted" />
      </a>
    </header>
  );
}
