import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import { AuthGuard } from '@/components/AuthGuard';
import { AuthProvider } from '@/hooks/useAuth'; // ★ AuthProviderをインポート

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
      <body className={`${inter.className} bg-gray-50`}>
        <AuthProvider> {/* ★ AuthProviderで全体をラップ */}
          <Header />
          <AuthGuard>
            <main className="pt-16">
              <div className="container mx-auto p-4 md:p-6">
                {children}
              </div>
            </main>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}