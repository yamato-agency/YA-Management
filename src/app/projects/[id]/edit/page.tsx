'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Project } from '@/types/project'; // 型定義ファイルをインポート
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
  '岐阜県', '静岡県', '愛知県', '三重県', '滋賀県', '京都府',
  '大阪府', '兵庫県', '奈良県', '和歌山県', '鳥取県', '島根県',
  '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県',
  '高知県', '福岡県', '佐賀県', '長崎県', '熊本県', '大分県',
  '宮崎県', '鹿児島県', '沖縄県'
];

const TRANSACTION_TYPES: Project['transaction_type'][] = ['レンタル', '販売'];
const CONTRACT_STATUS: Project['contract_status'][] = ['成約', '作業完了', '発送済', '設置済', '撤去済'];
const PRODUCT_CATEGORIES = ['モニたろう', 'モニすけ', 'モニまる', 'メッシュ', 'その他'];
const STB_OPTIONS = ['ゲンバルジャー', 'TOTO', '他社STB', 'なし'];

export default function EditProjectPage() {
  const router = useRouter();
  const { id } = useParams();
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<Project>();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const quoteFileUrl = watch('quote_file_url');
  const invoiceFileUrl = watch('invoice_file_url');
  const transactionType = watch('transaction_type');

  useEffect(() => {
    if (!id) return;
    const fetchProject = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
        if (error) throw error;
        
        if (data) {
          (Object.keys(data) as Array<keyof Project>).forEach(key => {
            const value = data[key];
            if (key.includes('date') && typeof value === 'string' && value) {
              try {
                setValue(key, format(new Date(value), 'yyyy-MM-dd'));
              } catch (e) {
                setValue(key, value); // フォーマットエラー時は元の値を設定
              }
            } else if (value !== null) {
              setValue(key, value as any);
            } else {
              setValue(key, ''); // nullの場合は空文字を設定
            }
          });
        }
      } catch (error) {
        console.error("データ取得エラー:", error);
        alert('プロジェクトデータの取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id, setValue]);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const fieldName = e.target.name as 'quote_file_url' | 'invoice_file_url';
    if (!file || !id) return;
    setUploading(true);
    const filePath = `public/${id}/${fieldName}-${file.name}`;
    try {
      const { error: uploadError } = await supabase.storage.from('project-files').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('project-files').getPublicUrl(filePath);
      setValue(fieldName, data.publicUrl, { shouldValidate: true, shouldDirty: true });
      alert('ファイルがアップロードされました');
    } catch(error) {
        alert('ファイルアップロードに失敗しました');
        console.error(error);
    } finally {
        setUploading(false);
    }
  };

  const onSubmit = async (formData: Project) => {
    const dataToUpdate: Partial<Project> = { ...formData };
    
    Object.keys(dataToUpdate).forEach(keyStr => {
      const key = keyStr as keyof Project;
      if (key.includes('date') && (dataToUpdate[key] === '' || dataToUpdate[key] === null)) {
        (dataToUpdate as any)[key] = null;
      }
    });

    if (dataToUpdate.transaction_type === 'レンタル') {
      dataToUpdate.warranty_end_date = null;
    }

    delete dataToUpdate.id;

    try {
      const { error } = await supabase.from('projects').update(dataToUpdate).eq('id', id);
      if (error) throw error;
      alert('プロジェクトが更新されました');
      router.push(`/projects`); // 一覧ページに戻る
      router.refresh();
    } catch (error) {
      console.error('プロジェクト更新エラー:', error);
      alert('エラーが発生しました');
    }
  };

  if (loading) return <div className="text-center py-10">データを読み込んでいます...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">プロジェクト編集</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        {/* --- 基本情報 --- */}
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-6 border-b pb-4">基本情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">PJ番号</label>
              <input type="text" {...register('pj_number')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" disabled />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">案件発生日 <span className="text-red-500">*</span></label>
              <input type="date" {...register('project_date', { required: '必須項目です' })} className="w-full px-3 py-2 border border-gray-300 rounded-md"/>
              {errors.project_date && <p className="text-red-500 text-sm mt-1">{errors.project_date.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">取引形態 <span className="text-red-500">*</span></label>
              <select {...register('transaction_type', { required: '必須項目です' })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">選択してください</option>
                {TRANSACTION_TYPES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              {errors.transaction_type && <p className="text-red-500 text-sm mt-1">{errors.transaction_type.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">契約ステータス</label>
              <select {...register('contract_status')} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">選択してください</option>
                {CONTRACT_STATUS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* --- 担当・取引先 --- */}
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-6 border-b pb-4">担当・取引先</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">営業担当 <span className="text-red-500">*</span></label>
              <input type="text" {...register('sales_person', { required: '必須項目です' })} className="w-full px-3 py-2 border border-gray-300 rounded-md"/>
              {errors.sales_person && <p className="text-red-500 text-sm mt-1">{errors.sales_person.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">ディーラー名 <span className="text-red-500">*</span></label>
              <input type="text" {...register('dealer_name', { required: '必須項目です' })} className="w-full px-3 py-2 border border-gray-300 rounded-md"/>
              {errors.dealer_name && <p className="text-red-500 text-sm mt-1">{errors.dealer_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">ディーラー担当者名</label>
              <input type="text" {...register('dealer_contact')} className="w-full px-3 py-2 border border-gray-300 rounded-md"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">ゼネコン名</label>
              <input type="text" {...register('general_contractor')} className="w-full px-3 py-2 border border-gray-300 rounded-md"/>
            </div>
          </div>
        </div>

        {/* --- 現場情報 --- */}
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-6 border-b pb-4">現場情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">設置場所(都道府県) <span className="text-red-500">*</span></label>
              <select {...register('installation_location', { required: '必須項目です' })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">選択してください</option>
                {PREFECTURES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {errors.installation_location && <p className="text-red-500 text-sm mt-1">{errors.installation_location.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">現場名</label>
              <input type="text" {...register('site_name')} className="w-full px-3 py-2 border border-gray-300 rounded-md"/>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">設置場所住所</label>
              <textarea {...register('installation_address')} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md"/>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">発送先住所</label>
              <textarea {...register('shipping_address')} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-md"/>
            </div>
          </div>
        </div>

        {/* --- 商品情報 --- */}
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-6 border-b pb-4">商品情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">商品カテゴリ <span className="text-red-500">*</span></label>
              <select {...register('product_category', { required: '必須項目です' })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">選択してください</option>
                {PRODUCT_CATEGORIES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              {errors.product_category && <p className="text-red-500 text-sm mt-1">{errors.product_category.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">STB</label>
              <select {...register('stb')} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">選択してください</option>
                {STB_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">本体商品名</label>
              <input type="text" {...register('main_product_name')} className="w-full px-3 py-2 border border-gray-300 rounded-md"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">製品仕様</label>
              <input type="text" {...register('product_spec')} className="w-full px-3 py-2 border border-gray-300 rounded-md"/>
            </div>
          </div>
          <h3 className="text-md font-semibold mt-6 mb-4 border-t pt-4">付属品</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {[...Array(10)].map((_, i) => (
              <div key={i}>
                <label className="block text-sm font-medium mb-2">{`付属品名 ${i + 1}`}</label>
                <input type="text" {...register(`accessory_${i + 1}` as keyof Project)} className="w-full px-3 py-2 border border-gray-300 rounded-md"/>
              </div>
            ))}
          </div>
        </div>

        {/* --- パートナー --- */}
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-6 border-b pb-4">パートナー</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">設置時パートナー</label>
              <input type="text" {...register('installation_partner')} className="w-full px-3 py-2 border border-gray-300 rounded-md"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">撤去時パートナー</label>
              <input type="text" {...register('removal_partner')} className="w-full px-3 py-2 border border-gray-300 rounded-md"/>
            </div>
          </div>
        </div>

        {/* --- 関連日付 --- */}
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-6 border-b pb-4">関連日付</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium mb-2">成約日</label><input type="date" {...register('contract_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md"/></div>
            <div><label className="block text-sm font-medium mb-2">設置予定日</label><input type="date" {...register('installation_scheduled_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md"/></div>
            <div><label className="block text-sm font-medium mb-2">設定作業完了日</label><input type="date" {...register('setup_completion_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md"/></div>
            <div><label className="block text-sm font-medium mb-2">発送日</label><input type="date" {...register('shipping_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md"/></div>
            <div><label className="block text-sm font-medium mb-2">設置業務依頼日</label><input type="date" {...register('installation_request_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md"/></div>
            <div><label className="block text-sm font-medium mb-2">設置日</label><input type="date" {...register('installation_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md"/></div>
            <div><label className="block text-sm font-medium mb-2">撤去予定日</label><input type="date" {...register('removal_scheduled_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md"/></div>
            <div><label className="block text-sm font-medium mb-2">撤去業務依頼日</label><input type="date" {...register('removal_request_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md"/></div>
            <div><label className="block text-sm font-medium mb-2">撤去日</label><input type="date" {...register('removal_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md"/></div>
            <div><label className="block text-sm font-medium mb-2">撤去後検品日</label><input type="date" {...register('removal_inspection_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md"/></div>
          </div>
        </div>

        {/* --- 保証 --- */}
        {transactionType === '販売' && (
          <div className="p-6 border rounded-lg bg-white shadow-sm">
            <h2 className="text-lg font-semibold mb-6 border-b pb-4">保証</h2>
            <div>
              <label className="block text-sm font-medium mb-2">販売時保証終了日</label>
              <input type="date" {...register('warranty_end_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md"/>
            </div>
          </div>
        )}

        {/* --- ファイル --- */}
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-6 border-b pb-4">関連ファイル</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">成約時見積書</label>
              <input type="file" name="quote_file_url" accept="application/pdf" onChange={handleFileUpload} disabled={uploading} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
              {quoteFileUrl && <a href={quoteFileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm mt-2 block">アップロード済みファイルを表示</a>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">設置時請求書</label>
              <input type="file" name="invoice_file_url" accept="application/pdf" onChange={handleFileUpload} disabled={uploading} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"/>
              {invoiceFileUrl && <a href={invoiceFileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm mt-2 block">アップロード済みファイルを表示</a>}
            </div>
          </div>
        </div>

        {/* --- メモ --- */}
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-6 border-b pb-4">メモ</h2>
          <textarea {...register('memo')} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="備考・メモなど"/>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button type="button" onClick={() => router.back()} className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50">キャンセル</button>
          <button type="submit" disabled={uploading || loading} className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400">{uploading ? 'アップロード中...' : '更新する'}</button>
        </div>
      </form>
    </div>
  );
}