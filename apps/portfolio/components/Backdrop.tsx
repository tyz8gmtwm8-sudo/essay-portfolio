import type { BackgroundPattern } from "@portfolio/shared";

// 背景の装飾（プリセットごとの図形）。fixed で画面の後ろに置く。
export function Backdrop({ pattern }: { pattern: BackgroundPattern }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
      {pattern === "blobs" && (
        <>
          <div className="absolute -left-24 -top-24 size-80 rounded-full bg-theme-accent opacity-20 blur-2xl" />
          <div className="absolute -right-20 top-1/3 size-64 rounded-full bg-[#ffc94a] opacity-25 blur-2xl" />
          <div className="absolute bottom-10 left-1/4 size-40 rounded-full bg-[#7bd3f7] opacity-20 blur-2xl" />
        </>
      )}
      {pattern === "brush" && (
        <svg className="absolute inset-x-0 top-[12vh] h-[40vh] w-full opacity-30" viewBox="0 0 1200 400" preserveAspectRatio="none">
          <path d="M-20 300 C 200 120, 380 360, 600 200 S 980 80, 1220 240" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
          <path d="M-20 340 C 240 200, 420 380, 640 260 S 1000 160, 1220 300" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        </svg>
      )}
      {pattern === "lines" && (
        <div className="absolute inset-0 mx-auto max-w-5xl border-x border-theme-border" />
      )}
      {pattern === "glow" && (
        <>
          <div className="absolute left-1/2 top-[-20vh] size-[70vh] -translate-x-1/2 rounded-full bg-theme-accent opacity-20 blur-3xl" />
          <div className="absolute bottom-[-20vh] right-[-10vh] size-[50vh] rounded-full bg-[#7a5cff] opacity-15 blur-3xl" />
        </>
      )}
    </div>
  );
}
