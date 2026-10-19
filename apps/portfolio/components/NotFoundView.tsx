import Link from "next/link";

// 404 の表示（テーマの色・フォントで表示される）
export function NotFoundView({
  title,
  body,
  homeHref,
  homeLabel,
}: {
  title: string;
  body: string;
  homeHref: string;
  homeLabel: string;
}) {
  return (
    <main className="rise relative flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p aria-hidden className="font-heading text-[clamp(5rem,20vw,10rem)] leading-none text-theme-accent opacity-80">
        404
      </p>
      <h1 className="mt-4 font-heading text-2xl">{title}</h1>
      <p className="mt-3 max-w-md text-theme-muted">{body}</p>
      <Link
        href={homeHref}
        className="mt-8 inline-block rounded-theme bg-theme-accent px-6 py-3 text-sm font-medium text-theme-on-accent no-underline"
      >
        {homeLabel}
      </Link>
    </main>
  );
}
