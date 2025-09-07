'use client';

import Link from 'next/link';
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import AnimatedLogo from './AnimatedLogo';
import { 
  ClipboardDocumentListIcon,
  BuildingOffice2Icon,
  CubeTransparentIcon,
  UsersIcon,
  PlusCircleIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon // ★ ユーザーアイコンをインポート
} from '@heroicons/react/24/outline';

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/"); // ログアウト後にトップページ（ログイン画面）へ遷移
    router.refresh();
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white border-b border-gray-200 h-16 px-6 flex justify-between items-center shadow-sm">
      <Link href="/projects">
        <AnimatedLogo />
      </Link>
      
      {/* --- ナビゲーションとアクションボタン --- */}
      <div className="flex items-center space-x-6">
        {user && (
          <>
            <nav className="flex items-center space-x-2">
              <Link
                href="/projects"
                className="flex items-center text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                <ClipboardDocumentListIcon className="h-5 w-5 mr-1.5" />
                プロジェクト管理
              </Link>
              <Link
                href="/customers"
                className="flex items-center text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                <BuildingOffice2Icon className="h-5 w-5 mr-1.5" />
                取引先マスタ
              </Link>
              <Link
                href="/products"
                className="flex items-center text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                <CubeTransparentIcon className="h-5 w-5 mr-1.5" />
                商品マスタ
              </Link>
              <Link href="/partners" className="flex items-center text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                <UsersIcon className="h-5 w-5 mr-1.5" />
                パートナーマスタ
              </Link>
            </nav>
            
            {/* ★★★ 変更点: ユーザー名表示とログアウトボタンのエリア ★★★ */}
            <div className="flex items-center space-x-4">
              <Link
                href="/projects/new"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 shadow-sm"
              >
                <PlusCircleIcon className="h-5 w-5 mr-2" />
                新規プロジェクト作成
              </Link>
              
              {/* 区切り線 */}
              <div className="h-6 w-px bg-gray-200"></div>

              {/* ユーザー名表示 */}
              <div className="flex items-center">
                <UserCircleIcon className="h-6 w-6 mr-2 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {/* user.displayName があれば表示、なければ email を表示 */}
                  {user.displayName || user.email}
                </span>
              </div>

              {/* ログアウトボタン */}
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-500 hover:text-red-600 p-2 rounded-md"
                title="ログアウト"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}