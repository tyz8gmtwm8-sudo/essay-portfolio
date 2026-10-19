"use client";

// ログイン状態とプロフィールを、どの画面からでも使えるようにする仕組み（React Context）。
// 使い方：const { user, profile } = useAuth();

import { doc, onSnapshot } from "firebase/firestore";
import { onIdTokenChanged, reload, signOut, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { UserDoc } from "@portfolio/shared";
import { firebaseAuth, firestore } from "./firebase";
import { saveLocaleCookie } from "./locale";

interface AuthState {
  /** まだ確認中なら true */
  loading: boolean;
  user: User | null;
  emailVerified: boolean;
  /** プロフィール。未作成（初回設定前）なら null */
  profile: UserDoc | null;
  profileLoading: boolean;
  /** メール確認の状態などを Firebase から読み直す */
  refreshUser: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const currentLocale = useLocale();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [profile, setProfile] = useState<UserDoc | null>(null);
  // どのユーザーのプロフィールを読み込み終えたか（今のユーザーと違えば「読み込み中」）
  const [profileLoadedFor, setProfileLoadedFor] = useState<string | null>(null);

  // ログイン状態の変化を見張る
  useEffect(() => {
    return onIdTokenChanged(firebaseAuth(), (nextUser) => {
      setUser(nextUser);
      setEmailVerified(nextUser?.emailVerified ?? false);
      setLoading(false);
    });
  }, []);

  // ログイン中は自分のプロフィールを見張る（保存すると即座に画面に反映される）
  const uid = user?.uid;
  useEffect(() => {
    if (!uid || !emailVerified) return;
    return onSnapshot(
      doc(firestore(), "users", uid),
      (snapshot) => {
        setProfile(snapshot.exists() ? (snapshot.data({ serverTimestamps: "estimate" }) as UserDoc) : null);
        setProfileLoadedFor(uid);
      },
      () => {
        setProfile(null);
        setProfileLoadedFor(uid);
      },
    );
  }, [uid, emailVerified]);

  // ログイン中・メール確認済みなのに、まだそのユーザーのプロフィールを読み終えていなければ「読み込み中」
  const profileLoading = Boolean(uid && emailVerified && profileLoadedFor !== uid);
  // 前にログインしていた別ユーザーのプロフィールが残っていても使わない
  const currentProfile = uid && profileLoadedFor === uid ? profile : null;

  // プロフィールに保存された表示言語と、今の画面の言語が違えば合わせる
  const profileLocale = currentProfile?.locale;
  useEffect(() => {
    if (profileLocale && profileLocale !== currentLocale) {
      saveLocaleCookie(profileLocale);
      router.refresh();
    }
  }, [profileLocale, currentLocale, router]);

  const refreshUser = useCallback(async () => {
    const current = firebaseAuth().currentUser;
    if (!current) return false;
    await reload(current);
    if (current.emailVerified) {
      // 「メール確認済み」の情報を IDトークンにも反映させる（セキュリティルールはこちらを見る）
      await current.getIdToken(true);
    }
    setEmailVerified(current.emailVerified);
    return current.emailVerified;
  }, []);

  const logout = useCallback(async () => {
    await signOut(firebaseAuth());
    router.replace("/login");
  }, [router]);

  const value = useMemo(
    () => ({ loading, user, emailVerified, profile: currentProfile, profileLoading, refreshUser, logout }),
    [loading, user, emailVerified, currentProfile, profileLoading, refreshUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth は AuthProvider の中で使ってください");
  return value;
}

/** ログイン済み・プロフィール作成済みの画面でだけ使う（AppGate の内側） */
export function useSignedIn() {
  const { user, profile } = useAuth();
  if (!user || !profile) throw new Error("useSignedIn は AppGate の内側で使ってください");
  return { user, profile };
}
