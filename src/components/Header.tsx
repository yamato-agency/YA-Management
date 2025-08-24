'use client';

import Link from 'next/link';
import { HomeIcon } from '@heroicons/react/24/solid';
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import AnimatedLogo from './AnimatedLogo';

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/"); // ログアウト後にトップページ（ログイン画面）へ遷移
    router.refresh();
  };

  return (
    <header className="bg-blue-100 py-4 px-6 flex justify-between items-center">
      <Link href="/projects">
        <AnimatedLogo />
      </Link>
      
      {/* --- ナビゲーションとアクションボタン --- */}
      <div className="flex items-center space-x-8">
        {/* ナビゲーションリンク */}
        <nav className="flex items-center space-x-4">
          <Link
            href="/projects"
            className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
          >
            プロジェクト管理
          </Link>
          <Link
            href="/customers"
            className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
          >
            取引先マスタ
          </Link>
          <Link
            href="/products"
            className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
          >
            商品マスタ
          </Link>
          <Link href="/partners" className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
            パートナーマスタ
          </Link>

          {/* 他のマスタが増えたらここに追加 */}
        </nav>
        
        {/* アクションボタン */}
        <Link
          href="/projects/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          新規プロジェクト作成
        </Link>

        {/* ログアウトボタン */}
        {user && (
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600"
          >
            ログアウト
          </button>
        )}
      </div>
    </header>
  );
}