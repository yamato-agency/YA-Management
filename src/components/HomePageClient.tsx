'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import LoginForm from '@/components/LoginForm';

// ダミープロジェクト情報（実際はAPI等から取得してください）
const dummyProject = {
  transaction_type: 'レンタル', // or '販売'
  general_contractor: '大林組',
  site_name: '東京現場',
  main_product_name: '液晶モニター',
  stb: 'STB-123',
  dealer_name: 'ヤマト商事',
};

function getProjectTitle(project: typeof dummyProject) {
  const prefix = project.transaction_type === 'レンタル' ? '[レ]' : '[売]';
  return `${prefix}${project.general_contractor}_${project.site_name}_${project.main_product_name}_${project.stb}(${project.dealer_name})`;
}

export default function HomePageClient() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [step, setStep] = useState<'form' | 'confirm' | 'done'>('form');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      if (user) {
        router.push('/projects');
      }
    });
    return () => unsubscribe();
  }, [router]);

  // 確認ボタンの処理例
  const handleConfirm = () => {
    setStep('confirm');
  };

  // 送信ボタンの処理例
  const handleSubmit = () => {
    setStep('done');
    // ここでAPI送信など
  };

  if (!isLoggedIn) {
    return <LoginForm />;
  }

  return (
    <header>
      {/* ログインしている場合のみメニューを表示 */}
      <nav>
        <ul>
          <li>プロジェクト管理</li>
          <li>取引先マスタ</li>
          <li>商品マスタ</li>
          <li>パートナーマスタ</li>
          <li>
            新規プロジェクト作成
            <div className="mt-2 text-sm text-gray-700 font-semibold">
              {getProjectTitle(dummyProject)}
            </div>
            {/* 新規プロジェクト申し込みフォーム例 */}
            {step === 'form' && (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  // 入力値をformDataにセット
                  handleConfirm();
                }}
              >
                {/* ...フォーム項目... */}
                <button type="submit">確認</button>
              </form>
            )}
            {step === 'confirm' && (
              <div>
                {/* ...確認内容表示... */}
                <button onClick={handleSubmit}>送信</button>
              </div>
            )}
            {step === 'done' && (
              <div>送信が完了しました。</div>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}
