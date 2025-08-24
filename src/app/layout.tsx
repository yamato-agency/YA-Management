// src/app/layout.tsx （修正後）

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header'; // Headerコンポーネントをインポート

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'YA-管理システム',
  description: 'YA-管理アプリケーション',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Header /> {/* ここにヘッダーを追加 */}
          <main className="flex-grow container mx-auto p-4 md:p-6">
            {children} {/* 各ページの内容がここに表示される */}
          </main>
        </div>
      </body>
    </html>
  );
}