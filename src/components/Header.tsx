'use client';

import Link from 'next/link';
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import AnimatedLogo from './AnimatedLogo';
import { useState } from 'react';
import { 
  ClipboardDocumentListIcon,
  BuildingOffice2Icon,
  CubeTransparentIcon,
  UsersIcon,
  PlusCircleIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/"); // ログアウト後にトップページ（ログイン画面）へ遷移
    router.refresh();
  };

  const navLinks = (
    <>
      <Link href="/projects" className="flex items-center text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
        <ClipboardDocumentListIcon className="h-5 w-5 mr-1.5" />
        プロジェクト管理
      </Link>
      <Link href="/customers" className="flex items-center text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
        <BuildingOffice2Icon className="h-5 w-5 mr-1.5" />
        取引先マスタ
      </Link>
      <Link href="/products" className="flex items-center text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
        <CubeTransparentIcon className="h-5 w-5 mr-1.5" />
        商品マスタ
      </Link>
      <Link href="/partners" className="flex items-center text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
        <UsersIcon className="h-5 w-5 mr-1.5" />
        パートナーマスタ
      </Link>
    </>
  );

  return (
    <header className="fixed top-0 w-full z-50 bg-white border-b border-gray-200 h-16 px-4 sm:px-6 flex justify-between items-center shadow-sm">
      <Link href="/projects">
        <AnimatedLogo />
      </Link>
      
      {user && (
        <>
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex items-center space-x-1">{navLinks}</nav>
            <div className="flex items-center space-x-4">
              <div className="h-6 w-px bg-gray-200"></div>
              <div className="flex items-center">
                <UserCircleIcon className="h-6 w-6 mr-2 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">{user.displayName || user.email}</span>
              </div>
              <button onClick={handleLogout} className="flex items-center text-gray-500 hover:text-red-600 p-2 rounded-md" title="ログアウト">
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
              {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && user && (
        <div className="md:hidden fixed top-16 left-0 w-full h-screen bg-white shadow-lg border-t border-gray-200 overflow-y-auto z-50">
          <div className="px-4 py-4 space-y-4">
            <nav className="flex flex-col space-y-3">
              <Link href="/projects" className="flex items-center text-gray-800 hover:text-blue-600 px-4 py-3 rounded-md text-base font-medium bg-gray-50 hover:bg-gray-100">
                <ClipboardDocumentListIcon className="h-6 w-6 mr-3" />
                プロジェクト管理
              </Link>
              <Link href="/customers" className="flex items-center text-gray-800 hover:text-blue-600 px-4 py-3 rounded-md text-base font-medium bg-gray-50 hover:bg-gray-100">
                <BuildingOffice2Icon className="h-6 w-6 mr-3" />
                取引先マスタ
              </Link>
              <Link href="/products" className="flex items-center text-gray-800 hover:text-blue-600 px-4 py-3 rounded-md text-base font-medium bg-gray-50 hover:bg-gray-100">
                <CubeTransparentIcon className="h-6 w-6 mr-3" />
                商品マスタ
              </Link>
              <Link href="/partners" className="flex items-center text-gray-800 hover:text-blue-600 px-4 py-3 rounded-md text-base font-medium bg-gray-50 hover:bg-gray-100">
                <UsersIcon className="h-6 w-6 mr-3" />
                パートナーマスタ
              </Link>
            </nav>
            <div className="border-t border-gray-200 pt-4 space-y-4">
              <div className="flex items-center px-4 py-3 bg-gray-50 rounded-md">
                <UserCircleIcon className="h-6 w-6 mr-2 text-gray-500" />
                <span className="text-base font-medium text-gray-700">{user.displayName || user.email}</span>
              </div>
              <button onClick={handleLogout} className="flex items-center text-gray-500 hover:text-red-600 p-2 rounded-md w-full justify-center" title="ログアウト">
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span className="ml-2">ログアウト</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}