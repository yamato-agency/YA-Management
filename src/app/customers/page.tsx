'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline'; // アイコン追加

interface Customer {
  id: number;
  dealer_code: string;
  company_name: string;
  office_name: string;
  postal_code: string;
  address: string;
  tel: string;
  fax: string;
  contact_name: string;
  contact_email: string;
  payment_terms: string;
  credit_limit: number;
  remarks?: string;
  created_at?: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data, error, count } = await supabase
        .from('customers')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });
      if (data) setCustomers(data);
      if (typeof count === 'number') setTotalCount(count);
      setLoading(false);
    };
    fetchCustomers();
  }, []);

  return (
    <div className="mx-auto p-6">
      <div className="flex items-center mb-8">
        <BuildingOffice2Icon className="h-8 w-8 text-blue-600 mr-2" />
        <h1 className="text-2xl font-bold text-blue-700">取引先マスタ</h1>
      </div>
      <div className="bg-white border border-blue-100 shadow-lg rounded-xl mb-8 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-blue-600">取引先一覧</h2>
          <div className="text-sm text-gray-600">
            <span className="font-medium">総件数: {totalCount.toLocaleString()}件</span>
          </div>
        </div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">取引先マスタ一覧</h1>
          <Link
            href="/customers/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            取引先新規登録
          </Link>
        </div>
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full whitespace-nowrap">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">No.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase">コード</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase">会社名</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase">営業所名</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase">郵便番号</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase">住所</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase">電話番号</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase">FAX番号</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase">担当者名</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase">担当者メール</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase">支払い条件</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase">与信限度額</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase">備考</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-blue-100">
              {loading ? (
                <tr><td colSpan={13} className="text-center py-8">読み込み中...</td></tr>
              ) : customers.length > 0 ? (
                customers.map((c, idx) => (
                  <tr key={c.id}>
                    <td className="px-4 py-4 text-sm text-gray-500 text-center font-medium">{idx + 1}</td>
                    <td className="px-4 py-4 text-sm">{c.dealer_code}</td>
                    <td className="px-4 py-4 text-sm">{c.company_name}</td>
                    <td className="px-4 py-4 text-sm">{c.office_name}</td>
                    <td className="px-4 py-4 text-sm">{c.postal_code}</td>
                    <td className="px-4 py-4 text-sm">{c.address}</td>
                    <td className="px-4 py-4 text-sm">{c.tel}</td>
                    <td className="px-4 py-4 text-sm">{c.fax}</td>
                    <td className="px-4 py-4 text-sm">{c.contact_name}</td>
                    <td className="px-4 py-4 text-sm">{c.contact_email}</td>
                    <td className="px-4 py-4 text-sm">{c.payment_terms}</td>
                    <td className="px-4 py-4 text-sm">{c.credit_limit?.toLocaleString?.() ?? ''}</td>
                    <td className="px-4 py-4 text-sm">{c.remarks}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={13} className="text-center py-8">取引先が見つかりません。</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
