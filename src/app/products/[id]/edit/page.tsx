'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';

// 新規登録ページと共通の型定義
interface ProductFormData {
  product_code: string;
  category_1: string | null;
  category_2: string | null;
  product_name: string;
  model_number: string | null;
  category_main: string;
  size_info: string | null;
  manufacturer: string | null;
  rental_price_monthly: number | null;
  sales_price: number | null;
  cost_price: number | null;
  remarks: string | null;
}

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams(); // URLから商品IDを取得
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ProductFormData>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // 既存の商品データを取得してフォームにセット
    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) {
        // 取得したデータをフォームの各フィールドにセット
        (Object.keys(data) as Array<keyof ProductFormData>).forEach(key => {
            if (data[key] !== null) {
                setValue(key, data[key]);
            }
        });
      } else {
        console.error("商品データ取得エラー:", error);
        alert('商品データの取得に失敗しました。');
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id, setValue]);

  const onSubmit = async (data: ProductFormData) => {
    // 送信するデータを安全な形に整形する
    const dataToUpdate = {
        ...data,
        rental_price_monthly: data.rental_price_monthly ? parseFloat(data.rental_price_monthly as any) : null,
        sales_price: data.sales_price ? parseFloat(data.sales_price as any) : null,
        cost_price: data.cost_price ? parseFloat(data.cost_price as any) : null,
    };

    // テキストフィールドが空文字の場合もnullに変換する
    (Object.keys(dataToUpdate) as Array<keyof ProductFormData>).forEach(key => {
        if (dataToUpdate[key] === '') {
            (dataToUpdate as any)[key] = null;
        }
    });

    try {
      const { error } = await supabase
        .from('products')
        .update(dataToUpdate) // updateメソッドでデータを更新
        .eq('id', id);

      if (error) {
        if (error.code === '23505') {
            alert('エラー: この商品コードは既に使用されています。');
        } else {
            throw error;
        }
      } else {
        alert('商品情報が更新されました。');
        router.push('/products'); // 一覧ページに戻る
        router.refresh();
      }
    } catch (error) {
      console.error('商品更新エラー:', error);
      alert('エラーが発生しました。');
    }
  };
  
  if (loading) {
    return <div className="text-center py-10">読み込み中...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">商品情報編集</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* --- 基本情報 --- */}
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-6 border-b pb-4">基本情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">商品コード <span className="text-red-500">*</span></label>
              <input type="text" {...register('product_code', { required: '必須項目です' })} className="w-full px-3 py-2 border rounded-md"/>
              {errors.product_code && <p className="text-red-500 text-sm mt-1">{errors.product_code.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">商品名 <span className="text-red-500">*</span></label>
              <input type="text" {...register('product_name', { required: '必須項目です' })} className="w-full px-3 py-2 border rounded-md"/>
              {errors.product_name && <p className="text-red-500 text-sm mt-1">{errors.product_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">カテゴリ <span className="text-red-500">*</span></label>
              <input type="text" {...register('category_main', { required: '必須項目です' })} className="w-full px-3 py-2 border rounded-md"/>
              {errors.category_main && <p className="text-red-500 text-sm mt-1">{errors.category_main.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">型番</label>
              <input type="text" {...register('model_number')} className="w-full px-3 py-2 border rounded-md"/>
            </div>
          </div>
        </div>

        {/* --- 分類・詳細情報 --- */}
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-6 border-b pb-4">分類・詳細情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">大分類</label>
              <input type="text" {...register('category_1')} className="w-full px-3 py-2 border rounded-md"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">中分類</label>
              <input type="text" {...register('category_2')} className="w-full px-3 py-2 border rounded-md"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">メーカー</label>
              <input type="text" {...register('manufacturer')} className="w-full px-3 py-2 border rounded-md"/>
            </div>
             <div>
              <label className="block text-sm font-medium mb-2">サイズ</label>
              <input type="text" {...register('size_info')} className="w-full px-3 py-2 border rounded-md"/>
            </div>
          </div>
        </div>

        {/* --- 価格情報 --- */}
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-6 border-b pb-4">価格情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">標準レンタル単価（月額）</label>
              <input type="number" step="0.01" {...register('rental_price_monthly')} className="w-full px-3 py-2 border rounded-md"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">標準販売単価</label>
              <input type="number" step="0.01" {...register('sales_price')} className="w-full px-3 py-2 border rounded-md"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">仕入価格</label>
              <input type="number" step="0.01" {...register('cost_price')} className="w-full px-3 py-2 border rounded-md"/>
            </div>
          </div>
        </div>
        
        {/* --- 備考 --- */}
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-6 border-b pb-4">備考</h2>
          <div>
            <textarea {...register('remarks')} rows={4} className="w-full px-3 py-2 border rounded-md"/>
          </div>
        </div>
        
        <div className="flex justify-end gap-4 mt-8">
            <button type="button" onClick={() => router.back()} className="px-6 py-2 border rounded-md hover:bg-gray-50">キャンセル</button>
            <button type="submit" className="px-8 py-3 bg-green-600 text-white rounded-md hover:bg-green-700">更新する</button>
        </div>
      </form>
    </div>
  );
}