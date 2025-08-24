'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';

interface PartnerFormData {
  name: string;
  type: string | null;
  contact_info: string | null;
}

export default function EditPartnerPage() {
  const router = useRouter();
  const { id } = useParams(); // URLからidを取得
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<PartnerFormData>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    // 既存のパートナーデータを取得してフォームにセット
    const fetchPartner = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) {
        // フォームの各フィールドに値をセット
        setValue('name', data.name);
        setValue('type', data.type);
        setValue('contact_info', data.contact_info);
      } else {
        console.error("パートナーデータ取得エラー:", error);
        alert('パートナーデータの取得に失敗しました。');
      }
      setLoading(false);
    };

    fetchPartner();
  }, [id, setValue]);

  const onSubmit = async (data: PartnerFormData) => {
    try {
      const { error } = await supabase
        .from('partners')
        .update(data) // updateメソッドでデータを更新
        .eq('id', id);

      if (error) throw error;

      alert('パートナー情報が更新されました。');
      router.push('/partners'); // 一覧ページに戻る
      router.refresh();
    } catch (error) {
      console.error('パートナー更新エラー:', error);
      alert('エラーが発生しました。');
    }
  };

  if (loading) {
    return <div className="text-center py-10">読み込み中...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">パートナー情報編集</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-lg shadow-md border border-blue-100">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2 text-blue-700">パートナー名 <span className="text-red-500">*</span></label>
          <input type="text" id="name" {...register('name', { required: '必須項目です' })} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-300"/>
          {errors.name && <p className="text-blue-500 text-sm mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium mb-2 text-blue-700">種別</label>
          <input type="text" id="type" placeholder="例: 設置, 撤去" {...register('type')} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-200"/>
        </div>
        <div>
          <label htmlFor="contact_info" className="block text-sm font-medium mb-2 text-blue-700">連絡先情報</label>
          <textarea id="contact_info" {...register('contact_info')} rows={4} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-200"/>
        </div>
        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={() => router.back()} className="px-6 py-2 border rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition">
            キャンセル
          </button>
          <button type="submit" className="px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-bold shadow">
            更新する
          </button>
        </div>
      </form>
    </div>
  );
}