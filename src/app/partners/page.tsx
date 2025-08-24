'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { UsersIcon } from '@heroicons/react/24/outline';

// パートナーの型定義
interface Partner {
  id: number;
  name: string;
  type: string | null; // DBの定義に合わせてnullを許容
  contact_info: string | null; // DBの定義に合わせてnullを許容
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
    fetchTotalCount();
  }, []);

  const fetchTotalCount = async () => {
    try {
      const { count, error } = await supabase
        .from('partners')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      setTotalCount(count || 0);
    } catch (error) {
      console.error('パートナー総件数取得エラー:', error);
    }
  };

  const fetchPartners = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .order('name', { ascending: true });
    
    if (data) {
        setPartners(data);
    } else if (error) {
        console.error("パートナー取得エラー:", error);
        alert('パートナー情報の取得に失敗しました。');
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto p-6">
      <div className="flex items-center mb-8">
        <UsersIcon className="h-8 w-8 text-blue-600 mr-2" />
        <h1 className="text-2xl font-bold text-blue-700">パートナーマスタ</h1>
      </div>
      <div className="bg-white border border-blue-100 shadow-lg rounded-xl mb-8 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-blue-600">パートナー一覧</h2>
          <div className="text-sm text-gray-600">
            <span className="font-medium">総件数: {totalCount.toLocaleString()}件</span>
          </div>
        </div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">パートナーマスタ一覧</h1>
          <Link href="/partners/new" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            新規パートナー登録
          </Link>
        </div>
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full whitespace-nowrap">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">No.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase">操作</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase">パートナー名</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase">種別</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase">連絡先情報</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-blue-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8">読み込み中...</td></tr>
              ) : partners.length > 0 ? (
                partners.map((partner, index) => (
                  <tr key={partner.id}>
                    <td className="px-4 py-4 text-sm text-gray-500 text-center font-medium">{index + 1}</td>
                    <td className="px-4 py-4 text-sm font-medium">
                      <Link href={`/partners/${partner.id}/edit`} className="text-blue-600 hover:text-blue-900">編集</Link>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{partner.name}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{partner.type || '未設定'}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{partner.contact_info || '未設定'}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="text-center py-8">パートナーが見つかりません。</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}