import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// next-intl（画面の文言を日本語・英語で切り替えるライブラリ）の設定ファイルを指定
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // packages/ 以下の TypeScript をそのまま読み込めるようにする
  transpilePackages: ["@portfolio/shared", "@portfolio/ui"],
  async headers() {
    return [
      {
        // 編集サイトは検索エンジンに載せない（noindex）
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
