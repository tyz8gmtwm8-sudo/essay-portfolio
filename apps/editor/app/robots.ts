import type { MetadataRoute } from "next";

// 検索エンジンのロボットに「どのページも見ないでください」と伝える
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
