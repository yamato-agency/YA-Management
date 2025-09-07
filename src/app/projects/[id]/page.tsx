// src/app/projects/[id]/page.tsx (修正済み・詳細ページ)

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Project } from '@/types/project';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      if (!error && data) setProject(data as Project);
      setLoading(false);
    };
    fetchProject();
  }, [id]);

  if (loading) return <div className="p-8 text-center">読み込み中...</div>;
  if (!project) return <div className="p-8 text-center text-red-500">プロジェクトが見つかりません。</div>;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">プロジェクト詳細</h1>
      <div className="space-y-2">
        <div><strong>PJ番号:</strong> {project.pj_number}</div>
        <div><strong>案件発生日:</strong> {project.project_date}</div>
        <div><strong>取引形態:</strong> {project.transaction_type}</div>
        <div><strong>契約ステータス:</strong> {project.contract_status}</div>
        <div><strong>営業担当:</strong> {project.sales_person}</div>
        <div><strong>ディーラー名:</strong> {project.dealer_name}</div>
        <div><strong>ディーラー担当者名:</strong> {project.dealer_contact}</div>
        <div><strong>ゼネコン名:</strong> {project.general_contractor}</div>
        <div><strong>現場名:</strong> {project.site_name}</div>
        <div><strong>設置場所(都道府県):</strong> {project.installation_location}</div>
        <div><strong>設置場所住所:</strong> {project.installation_address}</div>
        <div><strong>発送先住所:</strong> {project.shipping_address}</div>
        <div><strong>商品カテゴリ:</strong> {project.product_category}</div>
        <div><strong>STB:</strong> {project.stb}</div>
        <div><strong>本体商品名:</strong> {project.main_product_name}</div>
        <div><strong>製品仕様:</strong> {project.product_spec}</div>
        <div>
          <strong>付属品:</strong>
          <ul className="list-disc ml-6">
            {Array.from({ length: 10 }).map((_, i) => {
              const acc = project[`accessory_${i + 1}` as keyof Project];
              return acc ? <li key={i}>{acc}</li> : null;
            })}
          </ul>
        </div>
        <div><strong>設置時パートナー:</strong> {project.installation_partner}</div>
        <div><strong>撤去時パートナー:</strong> {project.removal_partner}</div>
        <div><strong>成約日:</strong> {project.contract_date}</div>
        <div><strong>設定作業完了日:</strong> {project.setup_completion_date}</div>
        <div><strong>発送日:</strong> {project.shipping_date}</div>
        <div><strong>設置業務依頼日:</strong> {project.installation_request_date}</div>
        <div><strong>設置予定日:</strong> {project.installation_scheduled_date}</div>
        <div><strong>設置日:</strong> {project.installation_date}</div>
        <div><strong>撤去業務依頼日:</strong> {project.removal_request_date}</div>
        <div><strong>撤去予定日:</strong> {project.removal_scheduled_date}</div>
        <div><strong>撤去日:</strong> {project.removal_date}</div>
        <div><strong>撤去後検品日:</strong> {project.removal_inspection_date}</div>
        <div><strong>販売時保証終了日:</strong> {project.warranty_end_date}</div>
        <div><strong>メモ:</strong> {project.memo}</div>
        <div>
          <strong>成約時見積書:</strong>{' '}
          {project.quote_file_url
            ? <a href={project.quote_file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{project.quote_file_name || 'ダウンロード'}</a>
            : <span className="text-gray-400">未登録</span>
          }
        </div>
        <div>
          <strong>設置時請求書:</strong>{' '}
          {project.invoice_file_url
            ? <a href={project.invoice_file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{project.invoice_file_name || 'ダウンロード'}</a>
            : <span className="text-gray-400">未登録</span>
          }
        </div>
      </div>
    </div>
  );
}