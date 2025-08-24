// src/app/partners/new/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';

interface PartnerFormData {
  name: string;
  type?: string;
  contact_info?: string;
}

export default function NewPartnerPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<PartnerFormData>();

  const onSubmit = async (data: PartnerFormData) => {
    try {
      const { error } = await supabase.from('partners').insert([data]);
      if (error) throw error;
      alert('パートナーが正常に登録されました。');
      router.push('/partners');
      router.refresh();
    } catch (error) {
      console.error('パートナー登録エラー:', error);
      alert('エラーが発生しました。');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">新規パートナー登録</h1>
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
            登録する
          </button>
        </div>
      </form>
    </div>
  );
}