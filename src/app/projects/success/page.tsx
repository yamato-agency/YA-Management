// src/app/projects/success/page.tsx

'use client';

import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-2xl font-bold text-green-600 mb-4">
        プロジェクトが正常に作成されました！
      </h1>
      <p className="mb-8">ご登録ありがとうございます。</p>
      <Link
        href="/projects"
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        プロジェクト一覧へ戻る
      </Link>
    </div>
  );
}