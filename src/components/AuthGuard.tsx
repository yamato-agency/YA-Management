// src/components/AuthGuard.tsx
"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

// AuthGuardコンポーネントを追加してnamed export
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // 未ログインでもアクセス可能な公開ページ
  const isPublicPage = pathname === "/" || pathname === "/login";

  useEffect(() => {
    // 読み込み完了後、未ログインかつ公開ページでない場合はトップページにリダイレクト
    if (!loading && !user && !isPublicPage) {
      router.replace("/");
    }
  }, [user, loading, pathname, router, isPublicPage]);

  // リダイレクト中は何も表示しない
  if (!loading && !user && !isPublicPage) {
    return null;
  }

  return <>{children}</>;
}