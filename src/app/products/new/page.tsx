'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';

// Productの型定義（src/types/に移動しても良い）
interface ProductFormData {
  product_code: string;
  category_1: string;
  category_2: string;
  product_name: string;
  model_number?: string;
  category_main: string;
  size_info?: string;
  manufacturer?: string;
  rental_price_monthly?: number;
  sales_price?: number;
  cost_price?: number;
  remarks?: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, setError } = useForm<ProductFormData>();

const onSubmit = async (data: ProductFormData) => {
  // 送信するデータを安全な形に整形する
  const dataToInsert = {
    ...data,
    // 数値項目が空、または無効な場合はnullに設定する
    // parseFloatは文字列を浮動小数点数に変換する。無効な場合はNaNを返す。
    rental_price_monthly: isNaN(Number(data.rental_price_monthly)) ? null : Number(data.rental_price_monthly),
    sales_price: isNaN(Number(data.sales_price)) ? null : Number(data.sales_price),
    cost_price: isNaN(Number(data.cost_price)) ? null : Number(data.cost_price),
  };

  // テキストフィールドが空文字の場合もnullに変換する
  (Object.keys(dataToInsert) as Array<keyof ProductFormData>).forEach(key => {
    if (dataToInsert[key] === '') {
      // (dataToInsert as any)[key] = null;
      (dataToInsert as Record<string, unknown>)[key] = null;
    }
  });

  try {
    // Supabaseにデータを挿入
    const { error } = await supabase
      .from('products')
      .insert([dataToInsert]);

    if (error) {
      if (error.code === '23505') { // 商品コード重複エラー
        alert('エラー: この商品コードは既に使用されています。');
      } else {
        // その他のDBエラーの詳細を表示
        console.error('データベースエラー詳細:', error);
        alert(`データベースエラーが発生しました: ${error.message}`);
      }
    } else {
      alert('商品が正常に登録されました。');
      router.push('/products');
      router.refresh();
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      setError('product_code', { type: 'manual', message: error.message });
    } else {
      setError('product_code', { type: 'manual', message: '不明なエラーが発生しました' });
    }
  }
};

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">新規商品登録</h1>
      
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
            <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">登録する</button>
        </div>
      </form>
    </div>
  );
}