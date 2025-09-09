'use client';

import { useState, useEffect, useCallback, Suspense } from 'react'; // useCallback をインポート
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

function NewProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formData, setFormData] = useState<Project | null>(null);
  const [quoteFile, setQuoteFile] = useState<File | null>(null);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [isCloning, setIsCloning] = useState(false);
  const [clonedProject, setClonedProject] = useState<Project | null>(null);
  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<Project>();

  // ▼▼▼ 修正1: useCallbackで関数をメモ化 ▼▼▼
  const fetchProjectForClone = useCallback(async (projectId: string) => {
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
      
      // setValueを使ってフォームに値を一括で設定
      (Object.keys(projectData) as Array<keyof Project>).forEach(key => {
        // 新規作成時にリセットしたいフィールドは除外
        if (key !== 'id' && key !== 'pj_number' && key !== 'project_date' && key !== 'contract_status') {
          setValue(key, projectData[key] || '');
        }
      });
      
    } catch (error) {
      console.error('プロジェクト取得エラー:', error);
      alert('プロジェクトの取得に失敗しました。');
    } finally {
      setIsCloning(false);
    }
  }, [setValue]); // setValueはReact Hook Formによって安定性が保証されている

  // ▼▼▼ 修正1: 依存配列に関数を追加 ▼▼▼
  useEffect(() => {
    const cloneId = searchParams.get('clone');
    if (cloneId) {
      fetchProjectForClone(cloneId);
    }
  }, [searchParams, fetchProjectForClone]);

  const onSubmit = (data: Project) => {
    data.pj_number = generateProjectNumber();
    data.project_date = new Date().toISOString().split('T')[0];
    data.contract_status = '成約';
    setFormData(data);
    setShowConfirmation(true);
  };

  // 登録処理
  const handleRegister = async () => {
    if (!formData) return;
    // date型フィールドをnullに変換
    const dateFields = [
      'project_date',
      'contract_date',
      'setup_completion_date',
      'shipping_date',
      'installation_request_date',
      'installation_scheduled_date',
      'installation_date',
      'removal_request_date',
      'removal_scheduled_date',
      'removal_date',
      'removal_inspection_date',
      'warranty_end_date'
    ];
    const dataToInsert = { ...formData };
    dateFields.forEach(field => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((dataToInsert as any)[field] === '') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (dataToInsert as any)[field] = null;
      }
    });
    const { error } = await supabase.from('projects').insert([dataToInsert]);
    if (error) {
      alert('登録に失敗しました: ' + error.message);
    } else {
      router.push('/projects/success');
    }
  };

  const generateProjectNumber = (): string => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
    const randomStr = Math.random().toString(36).substring(2, 7); // 5桁のランダムな英数字
    
    return `PJ${year}${month}${day}${hours}${minutes}${seconds}`;
  };

  const handleQuoteFileChange = (e: React.ChangeEvent<HTMLInputElement>) => setQuoteFile(e.target.files?.[0] || null);
  const handleInvoiceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => setInvoiceFile(e.target.files?.[0] || null);

  // ▼▼▼ 修正3: 未使用の警告が出ていたため、メール送信処理を一旦コメントアウト ▼▼▼
  // 必要に応じてコメントを解除し、APIルート(/api/send-email/route.ts)を実装してください。
  /*
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
  */

  // 確認画面の表示
  if (showConfirmation && formData) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-6">登録内容の確認</h2>
        <div className="space-y-2">
          <div><strong>PJ番号:</strong> {formData.pj_number}</div>
          <div><strong>案件発生日:</strong> {formData.project_date}</div>
          <div><strong>取引形態:</strong> {formData.transaction_type}</div>
          <div><strong>契約ステータス:</strong> {formData.contract_status}</div>
          <div><strong>営業担当:</strong> {formData.sales_person}</div>
          <div><strong>ディーラー名:</strong> {formData.dealer_name}</div>
          <div><strong>ディーラー担当者名:</strong> {formData.dealer_contact}</div>
          <div><strong>ゼネコン名:</strong> {formData.general_contractor}</div>
          <div><strong>現場名:</strong> {formData.site_name}</div>
          <div><strong>設置場所(都道府県):</strong> {formData.installation_location}</div>
          <div><strong>設置場所住所:</strong> {formData.installation_address}</div>
          <div><strong>発送先住所:</strong> {formData.shipping_address}</div>
          <div><strong>商品カテゴリ:</strong> {formData.product_category}</div>
          <div><strong>STB:</strong> {formData.stb}</div>
          <div><strong>本体商品名:</strong> {formData.main_product_name}</div>
          <div><strong>製品仕様:</strong> {formData.product_spec}</div>
          <div>
            <strong>付属品:</strong>
            <ul className="list-disc ml-6">
              {Array.from({ length: 10 }).map((_, i) => {
                const acc = formData[`accessory_${i + 1}` as keyof Project];
                return acc ? <li key={i}>{acc}</li> : null;
              })}
            </ul>
          </div>
          <div><strong>設置時パートナー:</strong> {formData.installation_partner}</div>
          <div><strong>撤去時パートナー:</strong> {formData.removal_partner}</div>
          <div><strong>成約日:</strong> {formData.contract_date}</div>
          <div><strong>設定作業完了日:</strong> {formData.setup_completion_date}</div>
          <div><strong>発送日:</strong> {formData.shipping_date}</div>
          <div><strong>設置業務依頼日:</strong> {formData.installation_request_date}</div>
          <div><strong>設置予定日:</strong> {formData.installation_scheduled_date}</div>
          <div><strong>設置日:</strong> {formData.installation_date}</div>
          <div><strong>撤去業務依頼日:</strong> {formData.removal_request_date}</div>
          <div><strong>撤去予定日:</strong> {formData.removal_scheduled_date}</div>
          <div><strong>撤去日:</strong> {formData.removal_date}</div>
          <div><strong>撤去後検品日:</strong> {formData.removal_inspection_date}</div>
          <div><strong>販売時保証終了日:</strong> {formData.warranty_end_date}</div>
          <div><strong>メモ:</strong> {formData.memo}</div>
        </div>
        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
            onClick={() => setShowConfirmation(false)}
          >
            戻る
          </button>
          <button
            type="button"
            className="px-8 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
            onClick={handleRegister}
          >
            登録
          </button>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
        <div className="flex flex-col sm:flex-row justify-between items-center mt-10 pt-6 border-t">
          <button type="button" onClick={() => router.back()} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 w-full sm:w-auto mb-2 sm:mb-0">
            キャンセル
          </button>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {clonedProject && (
              <button type="button" onClick={() => { reset(); setClonedProject(null); router.push('/projects/new'); }} className="px-6 py-3 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 w-full">
                新規作成に切り替え
              </button>
            )}
            <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 w-full" disabled={isCloning}>
              {isCloning ? '読み込み中...' : '確認画面へ'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function NewProjectPageWrapper() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <NewProjectPage />
    </Suspense>
  );
}

// 型定義（@/types/project.ts）を修正してください。