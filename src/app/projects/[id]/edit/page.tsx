'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Project } from '@/types/project';

export default function ProjectEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [formData, setFormData] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      if (!error && data) setFormData(data as Project);
      setLoading(false);
    };
    fetchProject();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : prev);
  };

  const handleSave = async () => {
    if (!formData) return;
    const { error } = await supabase.from('projects').update(formData).eq('id', id);
    if (error) {
      alert('更新に失敗しました: ' + error.message);
    } else {
      alert('更新しました');
      router.push(`/projects/${id}`);
    }
  };

  if (loading) return <div className="p-8 text-center">読み込み中...</div>;
  if (!formData) return <div className="p-8 text-center text-red-500">プロジェクトが見つかりません。</div>;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">プロジェクト編集</h1>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSave();
        }}
        className="space-y-4"
      >
        <div>
          <label className="font-semibold">PJ番号</label>
          <input type="text" name="pj_number" value={formData.pj_number} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="font-semibold">案件発生日</label>
          <input type="date" name="project_date" value={formData.project_date || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="font-semibold">取引形態</label>
          <select name="transaction_type" value={formData.transaction_type} onChange={handleChange} className="w-full border rounded px-2 py-1">
            <option value="">選択してください</option>
            <option value="レンタル">レンタル</option>
            <option value="販売">販売</option>
          </select>
        </div>
        <div>
          <label className="font-semibold">契約ステータス</label>
          <input type="text" name="contract_status" value={formData.contract_status} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="font-semibold">営業担当</label>
          <input type="text" name="sales_person" value={formData.sales_person} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="font-semibold">ディーラー名</label>
          <input type="text" name="dealer_name" value={formData.dealer_name} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="font-semibold">ディーラー担当者名</label>
          <input type="text" name="dealer_contact" value={formData.dealer_contact || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="font-semibold">ゼネコン名</label>
          <input type="text" name="general_contractor" value={formData.general_contractor || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="font-semibold">現場名</label>
          <input type="text" name="site_name" value={formData.site_name} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="font-semibold">設置場所(都道府県)</label>
          <input type="text" name="installation_location" value={formData.installation_location || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="font-semibold">設置場所住所</label>
          <input type="text" name="installation_address" value={formData.installation_address || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="font-semibold">発送先住所</label>
          <input type="text" name="shipping_address" value={formData.shipping_address || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="font-semibold">商品カテゴリ</label>
          <select name="product_category" value={formData.product_category} onChange={handleChange} className="w-full border rounded px-2 py-1">
            <option value="">選択してください</option>
            <option value="モニたろう">モニたろう</option>
            <option value="モニすけ">モニすけ</option>
            <option value="モニまる">モニまる</option>
            <option value="メッシュ">メッシュ</option>
            <option value="その他">その他</option>
          </select>
        </div>
        <div>
          <label className="font-semibold">STB</label>
          <select name="stb" value={formData.stb || ''} onChange={handleChange} className="w-full border rounded px-2 py-1">
            <option value="">選択してください</option>
            <option value="ゲンバルジャー">ゲンバルジャー</option>
            <option value="TOTO">TOTO</option>
            <option value="他社STB">他社STB</option>
            <option value="なし">なし</option>
          </select>
        </div>
        <div>
          <label className="font-semibold">本体商品名</label>
          <input type="text" name="main_product_name" value={formData.main_product_name || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="font-semibold">製品仕様</label>
          <input type="text" name="product_spec" value={formData.product_spec || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="font-semibold">付属品</label>
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <input
                key={i}
                type="text"
                name={`accessory_${i + 1}`}
                value={formData[`accessory_${i + 1}` as keyof Project] as string || ''}
                onChange={handleChange}
                className="border rounded px-2 py-1"
                placeholder={`付属品${i + 1}`}
              />
            ))}
          </div>
        </div>
        <div>
          <label className="font-semibold">設置時パートナー</label>
          <input type="text" name="installation_partner" value={formData.installation_partner || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="font-semibold">撤去時パートナー</label>
          <input type="text" name="removal_partner" value={formData.removal_partner || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="font-semibold">成約日</label>
          <input type="date" name="contract_date" value={formData.contract_date || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="font-semibold">設定作業完了日</label>
          <input type="date" name="setup_completion_date" value={formData.setup_completion_date || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="font-semibold">発送日</label>
          <input type="date" name="shipping_date" value={formData.shipping_date || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="font-semibold">設置業務依頼日</label>
          <input type="date" name="installation_request_date" value={formData.installation_request_date || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="font-semibold">設置予定日</label>
          <input type="date" name="installation_scheduled_date" value={formData.installation_scheduled_date || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="font-semibold">設置日</label>
          <input type="date" name="installation_date" value={formData.installation_date || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="font-semibold">撤去業務依頼日</label>
          <input type="date" name="removal_request_date" value={formData.removal_request_date || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="font-semibold">撤去予定日</label>
          <input type="date" name="removal_scheduled_date" value={formData.removal_scheduled_date || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="font-semibold">撤去日</label>
          <input type="date" name="removal_date" value={formData.removal_date || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="font-semibold">撤去後検品日</label>
          <input type="date" name="removal_inspection_date" value={formData.removal_inspection_date || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="font-semibold">販売時保証終了日</label>
          <input type="date" name="warranty_end_date" value={formData.warranty_end_date || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label className="font-semibold">メモ</label>
          <textarea name="memo" value={formData.memo || ''} onChange={handleChange} className="w-full border rounded px-2 py-1" />
        </div>
        {/* ファイル情報の編集は必要に応じて追加 */}
        <div className="flex justify-end gap-4 mt-8">
          <button type="submit" className="px-8 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">
            保存
          </button>
          <button type="button" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100" onClick={() => router.back()}>
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}