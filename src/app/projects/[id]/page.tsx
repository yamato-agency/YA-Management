'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Project } from '@/types/project';
import PDFGenerator from '@/components/PDFGenerator'; // PDF出力コンポーネント
import Link from 'next/link';
import { ArrowLeftIcon, PencilIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

// 詳細項目を表示するためのヘルパーコンポーネント
const DetailItem = ({ label, value, fullWidth = false }: { label: string; value: React.ReactNode; fullWidth?: boolean }) => (
  <div className={fullWidth ? 'col-span-2' : ''}>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-base text-gray-900 break-words">{value || <span className="text-gray-400">未入力</span>}</dd>
  </div>
);

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProject(data as Project);
    } catch (error) {
      console.error('プロジェクト詳細の取得エラー:', error);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">データを読み込んでいます...</div>;
  }

  if (!project) {
    return <div className="text-center py-10">プロジェクトが見つかりません。</div>;
  }

  // 付属品のリストを生成
  const accessories = Array.from({ length: 10 }, (_, i) => project[`accessory_${i + 1}` as keyof Project] as string)
    .filter(Boolean); // 値が存在するものだけフィルタリング

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{project.site_name || 'プロジェクト詳細'}</h1>
          <p className="text-gray-500">{project.pj_number}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/projects`} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            <ArrowLeftIcon className="h-4 w-4" />
            一覧へ戻る
          </Link>
          <Link href={`/projects/new?clone=${id}`} className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-gray-500 rounded-md hover:bg-gray-600">
            <DocumentDuplicateIcon className="h-4 w-4" />
            複製
          </Link>
          <Link href={`/projects/${id}/edit`} className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">
            <PencilIcon className="h-4 w-4" />
            編集
          </Link>
          <PDFGenerator project={project} />
        </div>
      </div>
      
      <div className="space-y-8">
        {/* --- 基本情報 --- */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold border-b pb-3 mb-4">基本情報</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <DetailItem label="PJ番号" value={project.pj_number} />
            <DetailItem label="案件発生日" value={project.project_date} />
            <DetailItem label="取引形態" value={project.transaction_type} />
            <DetailItem label="契約ステータス" value={project.contract_status} />
          </dl>
        </div>

        {/* --- 担当・取引先情報 --- */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold border-b pb-3 mb-4">担当・取引先情報</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <DetailItem label="営業担当" value={project.sales_person} />
            <DetailItem label="ディーラー名" value={project.dealer_name} />
            <DetailItem label="ディーラー担当者名" value={project.dealer_contact} />
            <DetailItem label="ゼネコン名" value={project.general_contractor} />
          </dl>
        </div>

        {/* --- 現場情報 --- */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold border-b pb-3 mb-4">現場情報</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <DetailItem label="現場名" value={project.site_name} fullWidth />
            <DetailItem label="設置場所 (都道府県)" value={project.installation_location} />
            <DetailItem label="設置場所住所" value={project.installation_address} fullWidth />
            <DetailItem label="発送先住所" value={project.shipping_address} fullWidth />
          </dl>
        </div>

        {/* --- 商品情報 --- */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold border-b pb-3 mb-4">商品情報</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <DetailItem label="商品カテゴリ" value={project.product_category} />
            <DetailItem label="STB" value={project.stb} />
            <DetailItem label="本体商品名" value={project.main_product_name} />
            <DetailItem label="製品仕様" value={project.product_spec} />
            {accessories.length > 0 && (
              <DetailItem 
                label="付属品" 
                value={<ul className="list-disc list-inside">{accessories.map((acc, i) => <li key={i}>{acc}</li>)}</ul>} 
                fullWidth 
              />
            )}
          </dl>
        </div>

        {/* --- パートナー情報 --- */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold border-b pb-3 mb-4">パートナー情報</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <DetailItem label="設置時パートナー" value={project.installation_partner} />
            <DetailItem label="撤去時パートナー" value={project.removal_partner} />
          </dl>
        </div>

        {/* --- 関連日付 --- */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold border-b pb-3 mb-4">関連日付</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <DetailItem label="成約日" value={project.contract_date} />
            <DetailItem label="設定作業完了日" value={project.setup_completion_date} />
            <DetailItem label="発送日" value={project.shipping_date} />
            <DetailItem label="設置業務依頼日" value={project.installation_request_date} />
            <DetailItem label="設置予定日" value={project.installation_scheduled_date} />
            <DetailItem label="設置日" value={project.installation_date} />
            <DetailItem label="撤去業務依頼日" value={project.removal_request_date} />
            <DetailItem label="撤去予定日" value={project.removal_scheduled_date} />
            <DetailItem label="撤去日" value={project.removal_date} />
            <DetailItem label="撤去後検品日" value={project.removal_inspection_date} />
            {project.transaction_type === '販売' && (
              <DetailItem label="販売時保証終了日" value={project.warranty_end_date} />
            )}
          </dl>
        </div>

        {/* --- 関連ファイル --- */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold border-b pb-3 mb-4">関連ファイル</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <DetailItem 
              label="成約時見積書" 
              value={project.quote_file_url ? <a href={project.quote_file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ファイルを開く</a> : undefined}
            />
            <DetailItem 
              label="設置時請求書" 
              value={project.invoice_file_url ? <a href={project.invoice_file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ファイルを開く</a> : undefined}
            />
          </dl>
        </div>

        {/* --- メモ --- */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold border-b pb-3 mb-4">メモ</h2>
          <p className="whitespace-pre-wrap mt-1 text-base">{project.memo || <span className="text-gray-400">メモはありません</span>}</p>
        </div>
      </div>
    </div>
  );
}