'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Project } from '@/types/project'; // 型定義ファイルをインポート
import { supabase } from '@/lib/supabase';

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

export default function NewProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState<Project | null>(null);
  const [quoteFile, setQuoteFile] = useState<File | null>(null);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [isCloning, setIsCloning] = useState(false);
  const [clonedProject, setClonedProject] = useState<Project | null>(null);
  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<Project>();

  useEffect(() => {
    const cloneId = searchParams.get('clone');
    if (cloneId) {
      fetchProjectForClone(cloneId);
    }
  }, [searchParams]);

  const fetchProjectForClone = async (projectId: string) => {
    try {
      setIsCloning(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      
      const projectData = data as Project;
      setClonedProject(projectData);
      
      // フォームに値を設定 (正しいフィールド名を使用)
      setValue('transaction_type', projectData.transaction_type);
      setValue('sales_person', projectData.sales_person);
      setValue('dealer_name', projectData.dealer_name);
      setValue('dealer_contact', projectData.dealer_contact || '');
      setValue('general_contractor', projectData.general_contractor || '');
      setValue('installation_location', projectData.installation_location);
      setValue('site_name', projectData.site_name || '');
      setValue('product_category', projectData.product_category || '');
      setValue('stb', projectData.stb || '');
      setValue('installation_scheduled_date', projectData.installation_scheduled_date || '');
      setValue('removal_scheduled_date', projectData.removal_scheduled_date || '');
      setValue('contract_date', projectData.contract_date || '');
      setValue('setup_completion_date', projectData.setup_completion_date || '');
      setValue('shipping_date', projectData.shipping_date || '');
      setValue('installation_date', projectData.installation_date || '');
      setValue('removal_date', projectData.removal_date || '');
      setValue('warranty_end_date', projectData.warranty_end_date || '');
      setValue('main_product_name', projectData.main_product_name || '');
      setValue('installation_address', projectData.installation_address || '');
      setValue('shipping_address', projectData.shipping_address || '');
      setValue('installation_partner', projectData.installation_partner || '');
      setValue('removal_partner', projectData.removal_partner || '');
      setValue('memo', projectData.memo || '');
      
      // データベーススキーマに合わせたフィールド名
      setValue('product_spec', projectData.product_spec || '');
      setValue('installation_request_date', projectData.installation_request_date || '');
      setValue('removal_request_date', projectData.removal_request_date || '');
      setValue('removal_inspection_date', projectData.removal_inspection_date || '');

      for (let i = 1; i <= 10; i++) {
        const key = `accessory_${i}` as keyof Project;
        setValue(key, projectData[key] as string || '');
      }
      
    } catch (error) {
      console.error('プロジェクト取得エラー:', error);
      alert('プロジェクトの取得に失敗しました。');
    } finally {
      setIsCloning(false);
    }
  };

  const onSubmit = (data: Project) => {
    data.pj_number = generateProjectNumber();
    data.project_date = new Date().toISOString().split('T')[0];
    data.contract_status = '成約';
    setFormData(data);
    setShowConfirmation(true);
  };

  const generateProjectNumber = (): string => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `PJ${year}${month}${day}${hours}${minutes}${seconds}`;
  };

  const handleQuoteFileChange = (e: React.ChangeEvent<HTMLInputElement>) => setQuoteFile(e.target.files?.[0] || null);
  const handleInvoiceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => setInvoiceFile(e.target.files?.[0] || null);

  const confirmSubmit = async () => {
    if (!formData) return;
    try {
      const dataToInsert: Partial<Project> = { ...formData };
      delete dataToInsert.id;

      Object.keys(dataToInsert).forEach(key => {
        if (key.includes('date') && dataToInsert[key as keyof Project] === '') {
          (dataToInsert as any)[key] = null;
        }
      });
      
      const { data: newProject, error } = await supabase
        .from('projects')
        .insert([dataToInsert])
        .select()
        .single();
      
      if (error) {
        console.error('Supabaseエラー詳細:', error);
        throw new Error(`データベースエラー: ${error.message}`);
      }

      console.log('プロジェクト作成成功:', newProject);

      if (quoteFile) {
        const filePath = `public/${newProject.id}/quote_file_url-${quoteFile.name}`;
        await supabase.storage.from('project-files').upload(filePath, quoteFile, { upsert: true });
        const { data: urlData } = supabase.storage.from('project-files').getPublicUrl(filePath);
        await supabase.from('projects').update({ quote_file_url: urlData.publicUrl }).eq('id', newProject.id);
      }
      
      if (invoiceFile) {
        const filePath = `public/${newProject.id}/invoice_file_url-${invoiceFile.name}`;
        await supabase.storage.from('project-files').upload(filePath, invoiceFile, { upsert: true });
        const { data: urlData } = supabase.storage.from('project-files').getPublicUrl(filePath);
        await supabase.from('projects').update({ invoice_file_url: urlData.publicUrl }).eq('id', newProject.id);
      }

      router.push(`/projects/${newProject.id || ''}`);
    } catch (error) {
      console.error('プロジェクト作成エラー詳細:', error);
      alert(`エラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  };

  const sendNotificationEmail = async (projectData: Project) => {
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });
    } catch (error) {
      console.error('メール送信エラー:', error);
    }
  };

  if (showConfirmation && formData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">申し込み内容確認</h1>
        <table className="w-full mb-6 border rounded-lg bg-white">
          <tbody>
            <tr><th className="text-left px-4 py-2 border-b w-1/3">PJ番号</th><td className="px-4 py-2 border-b">{formData.pj_number}</td></tr>
            <tr><th className="text-left px-4 py-2 border-b">案件発生日</th><td className="px-4 py-2 border-b">{formData.project_date}</td></tr>
            <tr><th className="text-left px-4 py-2 border-b">取引形態</th><td className="px-4 py-2 border-b">{formData.transaction_type}</td></tr>
            <tr><th className="text-left px-4 py-2 border-b">営業担当</th><td className="px-4 py-2 border-b">{formData.sales_person}</td></tr>
            <tr><th className="text-left px-4 py-2 border-b">ディーラー名</th><td className="px-4 py-2 border-b">{formData.dealer_name}</td></tr>
            <tr><th className="text-left px-4 py-2 border-b">ディーラー担当者名</th><td className="px-4 py-2 border-b">{formData.dealer_contact || '未入力'}</td></tr>
            <tr><th className="text-left px-4 py-2 border-b">ゼネコン名</th><td className="px-4 py-2 border-b">{formData.general_contractor || '未入力'}</td></tr>
            <tr><th className="text-left px-4 py-2 border-b">設置場所(都道府県)</th><td className="px-4 py-2 border-b">{formData.installation_location}</td></tr>
            <tr><th className="text-left px-4 py-2 border-b">現場名</th><td className="px-4 py-2 border-b">{formData.site_name || '未入力'}</td></tr>
            <tr><th className="text-left px-4 py-2 border-b">商品カテゴリ</th><td className="px-4 py-2 border-b">{formData.product_category}</td></tr>
            <tr><th className="text-left px-4 py-2 border-b">STB</th><td className="px-4 py-2 border-b">{formData.stb || '未選択'}</td></tr>
            <tr><th className="text-left px-4 py-2 border-b">本体商品名</th><td className="px-4 py-2 border-b">{formData.main_product_name || '未入力'}</td></tr>
            <tr><th className="text-left px-4 py-2 border-b">製品仕様</th><td className="px-4 py-2 border-b">{formData.product_spec || '未入力'}</td></tr>
            {Array.from({ length: 10 }).map((_, i) => (
              formData[`accessory_${i + 1}` as keyof Project] && (
                <tr key={i}><th className="text-left px-4 py-2 border-b">{`付属品名${i + 1}`}</th><td className="px-4 py-2 border-b">{formData[`accessory_${i + 1}` as keyof Project]}</td></tr>
              )
            ))}
            <tr><th className="text-left px-4 py-2 border-b">設置場所住所</th><td className="px-4 py-2 border-b">{formData.installation_address || '未入力'}</td></tr>
            <tr><th className="text-left px-4 py-2 border-b">発送先住所</th><td className="px-4 py-2 border-b">{formData.shipping_address || '未入力'}</td></tr>
            <tr><th className="text-left px-4 py-2 border-b">設置時パートナー</th><td className="px-4 py-2 border-b">{formData.installation_partner || '未入力'}</td></tr>
            <tr><th className="text-left px-4 py-2 border-b">撤去時パートナー</th><td className="px-4 py-2 border-b">{formData.removal_partner || '未入力'}</td></tr>
            <tr><th className="text-left px-4 py-2 border-b">成約日</th><td className="px-4 py-2 border-b">{formData.contract_date || '未入力'}</td></tr>
            <tr><th className="text-left px-4 py-2 border-b">設置予定日</th><td className="px-4 py-2 border-b">{formData.installation_scheduled_date || '未入力'}</td></tr>
            <tr><th className="text-left px-4 py-2 border-b">設定作業完了日</th><td className="px-4 py-2 border-b">{formData.setup_completion_date || '未入力'}</td></tr>
            <tr><th className="text-left px-4 py-2 border-b">発送日</th><td className="px-4 py-2 border-b">{formData.shipping_date || '未入力'}</td></tr>
            <tr><th className="text-left px-4 py-2 border-b">設置業務依頼日</th><td className="px-4 py-2 border-b">{formData.installation_request_date || '未入力'}</td></tr>
            <tr><th className="text-left px-4 py-2 border-b">設置日</th><td className="px-4 py-2 border-b">{formData.installation_date || '未入力'}</td></tr>
            <tr><th className="text-left px-4 py-2 border-b">撤去予定日</th><td className="px-4 py-2 border-b">{formData.removal_scheduled_date || '未入力'}</td></tr>
            <tr><th className="text-left px-4 py-2 border-b">撤去業務依頼日</th><td className="px-4 py-2 border-b">{formData.removal_request_date || '未入力'}</td></tr>
            <tr><th className="text-left px-4 py-2 border-b">撤去日</th><td className="px-4 py-2 border-b">{formData.removal_date || '未入力'}</td></tr>
            <tr><th className="text-left px-4 py-2 border-b">撤去後検品日</th><td className="px-4 py-2 border-b">{formData.removal_inspection_date || '未入力'}</td></tr>
            <tr><th className="text-left px-4 py-2 border-b">販売時保証終了日</th><td className="px-4 py-2 border-b">{formData.warranty_end_date || '未入力'}</td></tr>
            <tr><th className="text-left px-4 py-2 border-b">メモ</th><td className="px-4 py-2 border-b" style={{ whiteSpace: 'pre-wrap' }}>{formData.memo || '未入力'}</td></tr>
            <tr><th className="text-left px-4 py-2 border-b">成約時見積書</th><td className="px-4 py-2 border-b">{quoteFile ? quoteFile.name : '未選択'}</td></tr>
            <tr><th className="text-left px-4 py-2 border-b">設置時請求書</th><td className="px-4 py-2 border-b">{invoiceFile ? invoiceFile.name : '未選択'}</td></tr>
          </tbody>
        </table>
        <div className="flex gap-4 mt-6">
          <button onClick={() => setShowConfirmation(false)} className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50">戻る</button>
          <button onClick={confirmSubmit} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">申し込み確定</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isCloning ? 'プロジェクトクローン' : '新規プロジェクト申し込み'}</h1>
        {clonedProject && (
          <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-md">
            クローン元: {clonedProject.pj_number} - {clonedProject.site_name || '現場名なし'}
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* --- 基本情報 --- */}
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-6 border-b pb-4">基本情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                案件発生日 <span className="text-red-500">*</span>
              </label>
              <input type="date" value={new Date().toISOString().split('T')[0]} disabled className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" />
              <p className="text-gray-500 text-xs mt-1">今日の日付が自動設定されます</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                取引形態 <span className="text-red-500">*</span>
              </label>
              <select {...register('transaction_type', { required: '必須' })} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">選択してください</option>
                <option value="レンタル">レンタル</option>
                <option value="販売">販売</option>
              </select>
              {errors.transaction_type && <p className="text-red-500 text-xs mt-1">{errors.transaction_type.message}</p>}
            </div>
          </div>
        </div>

        {/* --- 担当・取引先情報 --- */}
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-6 border-b pb-4">担当・取引先情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                営業担当 <span className="text-red-500">*</span>
              </label>
              <input type="text" {...register('sales_person', { required: '必須' })} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="担当者名を入力" />
              {errors.sales_person && <p className="text-red-500 text-xs mt-1">{errors.sales_person.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                ディーラー名 <span className="text-red-500">*</span>
              </label>
              <input type="text" {...register('dealer_name', { required: '必須' })} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="ディーラー名を入力" />
              {errors.dealer_name && <p className="text-red-500 text-xs mt-1">{errors.dealer_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">ディーラー担当者名</label>
              <input type="text" {...register('dealer_contact')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="担当者名（任意）" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">ゼネコン名</label>
              <input type="text" {...register('general_contractor')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="ゼネコン名（任意）" />
            </div>
          </div>
        </div>
        
        {/* --- 現場情報 --- */}
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-6 border-b pb-4">現場情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                設置場所(都道府県) <span className="text-red-500">*</span>
              </label>
              <select {...register('installation_location', { required: '必須' })} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">選択してください</option>
                {PREFECTURES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {errors.installation_location && <p className="text-red-500 text-xs mt-1">{errors.installation_location.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">現場名</label>
              <input type="text" {...register('site_name')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="現場名（任意）" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">設置場所住所</label>
              <input type="text" {...register('installation_address')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="市区町村以降の住所（任意）" />
            </div>
          </div>
        </div>

        {/* --- 商品カテゴリとSTB --- */}
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-6 border-b pb-4">商品カテゴリ・STB</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                商品カテゴリ <span className="text-red-500">*</span>
              </label>
              <select {...register('product_category', { required: '必須' })} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">選択してください</option>
                <option value="モニたろう">モニたろう</option>
                <option value="モニすけ">モニすけ</option>
                <option value="モニまる">モニまる</option>
                <option value="メッシュ">メッシュ</option>
                <option value="その他">その他</option>
              </select>
              {errors.product_category && <p className="text-red-500 text-xs mt-1">{errors.product_category.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">STB</label>
              <select {...register('stb')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="">選択してください</option>
                <option value="ゲンバルジャー">ゲンバルジャー</option>
                <option value="TOTO">TOTO</option>
                <option value="他社STB">他社STB</option>
                <option value="なし">なし</option>
              </select>
            </div>
          </div>
        </div>

        {/* --- 商品詳細情報 --- */}
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-6 border-b pb-4">商品詳細情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">本体商品名</label>
              <input type="text" {...register('main_product_name')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="例: 90インチ基本セット(P4)" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">製品仕様</label>
              <input type="text" {...register('product_spec')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="例: Dazhi 6*4 P4" />
            </div>
          </div>
          <h3 className="text-md font-semibold mt-6 mb-4 border-t pt-4">付属品</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i}>
                <label className="block text-sm font-medium mb-2">{`付属品名 ${i + 1}`}</label>
                <input type="text" {...register(`accessory_${i + 1}` as keyof Project)} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" />
              </div>
            ))}
          </div>
        </div>
        
        {/* --- パートナー・配送先情報 --- */}
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-6 border-b pb-4">パートナー・配送先情報</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">設置時パートナー</label>
              <input type="text" {...register('installation_partner')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="例: ミライテック"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">撤去時パートナー</label>
              <input type="text" {...register('removal_partner')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="例: G.A. Build"/>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">発送先住所</label>
              <input type="text" {...register('shipping_address')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="設置場所と異なる場合に入力"/>
            </div>
          </div>
        </div>

        {/* --- 日付関連 --- */}
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-6 border-b pb-4">関連日付</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><label className="block text-sm font-medium mb-2">成約日</label><input type="date" {...register('contract_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"/></div>
            <div><label className="block text-sm font-medium mb-2">設置予定日</label><input type="date" {...register('installation_scheduled_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"/></div>
            <div><label className="block text-sm font-medium mb-2">設定作業完了日</label><input type="date" {...register('setup_completion_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"/></div>
            <div><label className="block text-sm font-medium mb-2">発送日</label><input type="date" {...register('shipping_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"/></div>
            <div><label className="block text-sm font-medium mb-2">設置業務依頼日</label><input type="date" {...register('installation_request_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"/></div>
            <div><label className="block text-sm font-medium mb-2">設置日</label><input type="date" {...register('installation_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"/></div>
            <div><label className="block text-sm font-medium mb-2">撤去予定日</label><input type="date" {...register('removal_scheduled_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"/></div>
            <div><label className="block text-sm font-medium mb-2">撤去業務依頼日</label><input type="date" {...register('removal_request_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"/></div>
            <div><label className="block text-sm font-medium mb-2">撤去日</label><input type="date" {...register('removal_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"/></div>
            <div><label className="block text-sm font-medium mb-2">撤去後検品日</label><input type="date" {...register('removal_inspection_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"/></div>
            <div><label className="block text-sm font-medium mb-2">販売時保証終了日</label><input type="date" {...register('warranty_end_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" placeholder="販売時のみ"/></div>
          </div>
        </div>
        
        {/* --- ファイルアップロード --- */}
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-6 border-b pb-4">関連ファイル</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">成約時見積書</label>
              <input type="file" accept="application/pdf" onChange={handleQuoteFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
              {quoteFile && <span className="text-blue-600 text-sm mt-2 block">{quoteFile.name}</span>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">設置時請求書</label>
              <input type="file" accept="application/pdf" onChange={handleInvoiceFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"/>
              {invoiceFile && <span className="text-blue-600 text-sm mt-2 block">{invoiceFile.name}</span>}
            </div>
          </div>
        </div>

        {/* --- メモ --- */}
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-6 border-b pb-4">メモ</h2>
          <div>
            <textarea {...register('memo')} rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" placeholder="特記事項など"></textarea>
          </div>
        </div>

        {/* --- 操作ボタン --- */}
        <div className="flex justify-between items-center mt-10 pt-6 border-t">
          <button type="button" onClick={() => router.back()} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100">
            キャンセル
          </button>
          <div className="flex items-center gap-4">
            {clonedProject && (
              <button type="button" onClick={() => { reset(); setClonedProject(null); router.push('/projects/new'); }} className="px-6 py-3 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                新規作成に切り替え
              </button>
            )}
            <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700" disabled={isCloning}>
              {isCloning ? '読み込み中...' : '確認画面へ'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}