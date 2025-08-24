// src/app/products/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { CubeTransparentIcon } from '@heroicons/react/24/outline';

// Productの型定義（必要に応じて src/types/ に作成）
interface Product {
  id: number;
  product_code: string;
  product_name: string;
  category_1: string;
  category_2: string;
  model_number: string;
  manufacturer: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchTotalCount();
  }, []);

  const fetchTotalCount = async () => {
    try {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      setTotalCount(count || 0);
    } catch (error) {
      console.error('商品総件数取得エラー:', error);
    }
  };

  const fetchProducts = async (searchTerm = '') => {
    setLoading(true);
    let query = supabase.from('products').select('*');
    if (searchTerm) {
      query = query.or(`product_name.ilike.%${searchTerm}%,product_code.ilike.%${searchTerm}%,model_number.ilike.%${searchTerm}%`);
    }
    const { data, error } = await query.order('id', { ascending: true });
    if (data) setProducts(data);
    setLoading(false);
  };

  return (
    <div className="mx-auto p-6">
      <div className="flex items-center mb-8">
        <CubeTransparentIcon className="h-8 w-8 text-blue-600 mr-2" />
        <h1 className="text-2xl font-bold text-blue-700">商品マスタ</h1>
      </div>
      <div className="bg-white border border-blue-100 shadow-lg rounded-xl mb-8 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-blue-600">商品一覧</h2>
          <div className="text-sm text-gray-600">
            <span className="font-medium">総件数: {totalCount.toLocaleString()}件</span>
          </div>
        </div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">商品マスタ一覧</h1>
          <Link href="/products/new" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            新規商品登録
          </Link>
        </div>
        {/* 商品テーブル */}
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full whitespace-nowrap">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">No.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase">操作</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase">商品コード</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase">商品名</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase">大分類</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase">中分類</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-blue-500 uppercase">型番</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-blue-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8">読み込み中...</td></tr>
              ) : products.length > 0 ? (
                products.map((product, idx) => (
                  <tr key={product.id}>
                    <td className="px-4 py-4 text-sm text-gray-500 text-center font-medium">{idx + 1}</td>
                    <td className="px-4 py-4 text-sm font-medium">
                      <Link href={`/products/${product.id}/edit`} className="text-blue-600 hover:text-blue-900">編集</Link>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{product.product_code}</td>
                    <td className="px-4 py-4 text-sm text-gray-800">{product.product_name}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{product.category_1}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{product.category_2}</td>
                    <td className="px-4 py-4 text-sm text-gray-500">{product.model_number}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="text-center py-8">商品が見つかりません。</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}