import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header'; // Headerコンポーネントをインポート

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Yamato-Basic',
  description: 'Yamato Basicアプリケーション',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      {/* bodyに背景色を設定すると、コンテンツエリアが分かりやすくなります */}
      <body className={`${inter.className} bg-gray-50`}>
        {/* Headerコンポーネントは fixed によって画面上部に固定されます */}
        <Header />
        
        {/* main要素に pt-16 を追加し、固定ヘッダー(h-16)分のスペースを確保します */}
        <main className="pt-16">
          {/* 各ページコンテンツのコンテナ */}
          <div className="container mx-auto p-4 md:p-6">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}