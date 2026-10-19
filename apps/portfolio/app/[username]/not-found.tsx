import { UserNotFound } from "@/components/UserNotFound";

// ユーザーのページ内の 404（存在しない・非公開のエッセイ）。テーマに合わせたデザインで表示される
export default function NotFound() {
  return <UserNotFound />;
}
