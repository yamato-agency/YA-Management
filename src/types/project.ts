'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Project } from '@/types/project'; // ご提示いただいた型定義をインポート
import { 
  MagnifyingGlassIcon, 
  ClipboardDocumentListIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  PlusCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// フィルターの型を定義
interface Filters {
  pj_number: string;
  contract_status: string;
  project_date_from: string;
  project_date_to: string;
  site_name: string;
  dealer_name: string;
  sales_person: string;
  transaction_type: string;
  product_category: string;
  installation_scheduled_date_from: string;
  installation_scheduled_date_to: string;
  removal_scheduled_date_from: string;
  removal_scheduled_date_to: string;
}

// 編集用のProjectの型
type EditableProject = Partial<Omit<Project, 'id'>>;

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // --- 編集機能のためのState ---
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<EditableProject>({});

  // --- 検索フィルターのためのState ---
  const initialFilters: Filters = {
    pj_number: '', contract_status: '', project_date_from: '', project_date_to: '',
    site_name: '', dealer_name: '', sales_person: '', transaction_type: '',
    product_category: '', installation_scheduled_date_from: '', installation_scheduled_date_to: '',
    removal_scheduled_date_from: '', removal_scheduled_date_to: '',
  };
  const [filters, setFilters] = useState<Filters>(initialFilters);

  // --- フィルターの選択肢 (型定義に合わせて修正) ---
  const statusOptions: Project['contract_status'][] = ['成約', '作業完了', '発送済', '設置済', '撤去済'];
  const salesPersonOptions = ['西井', '佐藤', '鈴木', '高橋']; // 本来はマスタテーブルから取得するのが望ましい
  const transactionTypeOptions: Project['transaction_type'][] = ['レンタル', '販売'];
  const productCategoryOptions = ['モニたろう', 'モニすけ', 'モニまる', 'メッシュ', 'その他'];
  const stbOptions = ['ゲンバルジャー', 'TOTO', '他社STB', 'なし'];

  useEffect(() => {
    fetchProjects(initialFilters);
    fetchTotalCount();
  }, []);

  // --- データ取得関連 ---
  const fetchTotalCount = async () => {
    const { count, error } = await supabase.from('projects').select('*', { count: 'exact', head: true });
    if (!error) setTotalCount(count || 0);
  };

  const fetchProjects = async (currentFilters: Filters) => {
    setLoading(true);
    let query = supabase.from('projects').select('*');

    if (currentFilters.pj_number) query = query.ilike('pj_number', `%${currentFilters.pj_number}%`);
    if (currentFilters.contract_status) query = query.eq('contract_status', currentFilters.contract_status);
    if (currentFilters.project_date_from) query = query.gte('project_date', currentFilters.project_date_from);
    if (currentFilters.project_date_to) query = query.lte('project_date', currentFilters.project_date_to);
    if (currentFilters.site_name) query = query.ilike('site_name', `%${currentFilters.site_name}%`);
    if (currentFilters.dealer_name) query = query.ilike('dealer_name', `%${currentFilters.dealer_name}%`);
    if (currentFilters.sales_person) query = query.eq('sales_person', currentFilters.sales_person);
    if (currentFilters.transaction_type) query = query.eq('transaction_type', currentFilters.transaction_type);
    if (currentFilters.product_category) query = query.eq('product_category', currentFilters.product_category);
    if (currentFilters.installation_scheduled_date_from) query = query.gte('installation_scheduled_date', currentFilters.installation_scheduled_date_from);
    if (currentFilters.installation_scheduled_date_to) query = query.lte('installation_scheduled_date', currentFilters.installation_scheduled_date_to);
    if (currentFilters.removal_scheduled_date_from) query = query.gte('removal_scheduled_date', currentFilters.removal_scheduled_date_from);
    if (currentFilters.removal_scheduled_date_to) query = query.lte('removal_scheduled_date', currentFilters.removal_scheduled_date_to);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('プロジェクト取得エラー:', error);
      alert('データの取得に失敗しました。');
    } else {
      setProjects(data as Project[] || []);
      setFilteredCount(data?.length || 0);
    }
    setLoading(false);
  };

  // --- 編集関連のハンドラー ---
  const handleEditClick = (project: Project) => {
    setEditingId(project.id!);
    const formattedProject: any = { ...project };
    // 日付フィールドを yyyy-mm-dd 形式に変換
    Object.keys(formattedProject).forEach(key => {
      if (key.includes('date') && formattedProject[key]) {
        try {
          formattedProject[key] = new Date(formattedProject[key]).toISOString().split('T')[0];
        } catch (e) { /* no-op */ }
      }
    });
    setEditFormData(formattedProject);
  };

  const handleCancelClick = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleSaveClick = async (id: number) => {
    const dataToUpdate: any = { ...editFormData };
    // 空の日付フィールドを null に変換
    for (const key in dataToUpdate) {
      if (key.includes('date') && dataToUpdate[key] === '') {
        dataToUpdate[key] = null;
      }
    }
    delete dataToUpdate.id; // 更新データにidは含めない

    const { error } = await supabase.from('projects').update(dataToUpdate).eq('id', id);
    if (error) {
      alert(`更新に失敗しました: ${error.message}`);
      console.error(error);
    } else {
      alert('更新しました。');
      setEditingId(null);
      await fetchProjects(filters); // データを再取得
    }
  };

  const handleEditFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // --- 検索関連のハンドラー ---
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => fetchProjects(filters);

  const handleReset = () => {
    setFilters(initialFilters);
    fetchProjects(initialFilters);
  };

  const totalColumns = 41;

  return (
    <div className="mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold text-blue-700">プロジェクト管理</h1>
        </div>
        <Link href="/projects/new" className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-semibold shadow hover:bg-green-700">
          <PlusCircleIcon className="h-5 w-5" />
          新規作成
        </Link>
      </div>

      {/* 検索フォームセクション */}
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">PJ番号</label>
            <input type="text" name="pj_number" value={filters.pj_number} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ステータス</label>
            <select name="contract_status" value={filters.contract_status} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option value="">すべて</option>
              {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">現場名</label>
            <input type="text" name="site_name" value={filters.site_name} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ディーラー名</label>
            <input type="text" name="dealer_name" value={filters.dealer_name} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium mb-1">案件発生日</label>
            <div className="flex items-center gap-2">
              <input type="date" name="project_date_from" value={filters.project_date_from} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              <span>～</span>
              <input type="date" name="project_date_to" value={filters.project_date_to} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
          </div>
           <div className="lg:col-span-2">
            <label className="block text-sm font-medium mb-1">設置予定日</label>
            <div className="flex items-center gap-2">
              <input type="date" name="installation_scheduled_date_from" value={filters.installation_scheduled_date_from} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              <span>～</span>
              <input type="date" name="installation_scheduled_date_to" value={filters.installation_scheduled_date_to} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 border border-gray-400 text-gray-700 rounded-md text-sm hover:bg-gray-100">
            <ArrowPathIcon className="h-4 w-4" />
            リセット
          </button>
          <button onClick={handleSearch} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold shadow hover:bg-blue-700">
            <MagnifyingGlassIcon className="h-5 w-5" />
            検索
          </button>
        </div>
      </div>

      {/* テーブルセクション */}
      <div className="bg-white border border-blue-100 shadow-lg rounded-xl mb-8 p-4">
        <div className="text-sm text-gray-600 mb-4">
            全 {totalCount} 件中 {filteredCount} 件表示
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full whitespace-nowrap text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 w-32">操作</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-32 bg-gray-50 z-10">PJ番号</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">案件発生日</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">営業担当</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ディーラー名</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ディーラー担当者</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ゼネコン名</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">現場名</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">設置場所(都道府県)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">設置場所住所</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">取引形態</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">商品カテゴリ</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STB</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">本体商品名</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">製品仕様</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">付属品1</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">付属品2</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">付属品3</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">付属品4</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">付属品5</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">付属品6</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">付属品7</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">付属品8</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">付属品9</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">付属品10</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">発送先住所</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">設置時パートナー</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">撤去時パートナー</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">成約日</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">設定作業完了日</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">発送日</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">設置業務依頼日</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">設置予定日</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">設置日</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">撤去業務依頼日</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">撤去予定日</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">撤去日</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">撤去後検品日</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">販売時保証終了日</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">メモ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? ( <tr><td colSpan={totalColumns} className="text-center py-8">読み込み中...</td></tr> ) : 
              projects.length > 0 ? ( projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    {editingId === project.id ? (
                      // --- 編集モード ---
                      <>
                        <td className="px-4 py-1 text-sm font-medium sticky left-0 bg-white"><div className='flex gap-4'><button onClick={() => handleSaveClick(project.id!)} className="text-green-600"><CheckIcon className='h-5 w-5'/></button><button onClick={handleCancelClick} className="text-gray-500"><XMarkIcon className='h-5 w-5'/></button></div></td>
                        <td className="px-1 py-1 sticky left-32 bg-white"><input type="text" name="pj_number" value={editFormData.pj_number || ''} onChange={handleEditFormChange} className="w-40 border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><select name="contract_status" value={editFormData.contract_status || ''} onChange={handleEditFormChange} className="w-32 border-gray-300 rounded-md">{statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></td>
                        <td className="px-1 py-1"><input type="date" name="project_date" value={editFormData.project_date || ''} onChange={handleEditFormChange} className="w-40 border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><select name="sales_person" value={editFormData.sales_person || ''} onChange={handleEditFormChange} className="w-32 border-gray-300 rounded-md">{salesPersonOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></td>
                        <td className="px-1 py-1"><input type="text" name="dealer_name" value={editFormData.dealer_name || ''} onChange={handleEditFormChange} className="w-48 border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="text" name="dealer_contact" value={editFormData.dealer_contact || ''} onChange={handleEditFormChange} className="w-40 border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="text" name="general_contractor" value={editFormData.general_contractor || ''} onChange={handleEditFormChange} className="w-48 border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="text" name="site_name" value={editFormData.site_name || ''} onChange={handleEditFormChange} className="w-48 border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="text" name="installation_location" value={editFormData.installation_location || ''} onChange={handleEditFormChange} className="w-32 border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="text" name="installation_address" value={editFormData.installation_address || ''} onChange={handleEditFormChange} className="w-64 border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><select name="transaction_type" value={editFormData.transaction_type || ''} onChange={handleEditFormChange} className="w-28 border-gray-300 rounded-md">{transactionTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></td>
                        <td className="px-1 py-1"><select name="product_category" value={editFormData.product_category || ''} onChange={handleEditFormChange} className="w-32 border-gray-300 rounded-md">{productCategoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></td>
                        <td className="px-1 py-1"><select name="stb" value={editFormData.stb || ''} onChange={handleEditFormChange} className="w-32 border-gray-300 rounded-md"><option value="">未選択</option>{stbOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></td>
                        <td className="px-1 py-1"><input type="text" name="main_product_name" value={editFormData.main_product_name || ''} onChange={handleEditFormChange} className="w-48 border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="text" name="product_spec" value={editFormData.product_spec || ''} onChange={handleEditFormChange} className="w-48 border-gray-300 rounded-md" /></td>
                        {Array.from({ length: 10 }).map((_, i) => (<td key={i} className="px-1 py-1"><input type="text" name={`accessory_${i + 1}`} value={editFormData[`accessory_${i + 1}` as keyof Project] as string || ''} onChange={handleEditFormChange} className="w-40 border-gray-300 rounded-md" /></td>))}
                        <td className="px-1 py-1"><input type="text" name="shipping_address" value={editFormData.shipping_address || ''} onChange={handleEditFormChange} className="w-64 border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="text" name="installation_partner" value={editFormData.installation_partner || ''} onChange={handleEditFormChange} className="w-40 border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="text" name="removal_partner" value={editFormData.removal_partner || ''} onChange={handleEditFormChange} className="w-40 border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="date" name="contract_date" value={editFormData.contract_date || ''} onChange={handleEditFormChange} className="w-40 border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="date" name="setup_completion_date" value={editFormData.setup_completion_date || ''} onChange={handleEditFormChange} className="w-40 border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="date" name="shipping_date" value={editFormData.shipping_date || ''} onChange={handleEditFormChange} className="w-40 border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="date" name="installation_request_date" value={editFormData.installation_request_date || ''} onChange={handleEditFormChange} className="w-40 border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="date" name="installation_scheduled_date" value={editFormData.installation_scheduled_date || ''} onChange={handleEditFormChange} className="w-40 border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="date" name="installation_date" value={editFormData.installation_date || ''} onChange={handleEditFormChange} className="w-40 border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="date" name="removal_request_date" value={editFormData.removal_request_date || ''} onChange={handleEditFormChange} className="w-40 border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="date" name="removal_scheduled_date" value={editFormData.removal_scheduled_date || ''} onChange={handleEditFormChange} className="w-40 border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="date" name="removal_date" value={editFormData.removal_date || ''} onChange={handleEditFormChange} className="w-40 border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="date" name="removal_inspection_date" value={editFormData.removal_inspection_date || ''} onChange={handleEditFormChange} className="w-40 border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="date" name="warranty_end_date" value={editFormData.warranty_end_date || ''} onChange={handleEditFormChange} className="w-40 border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><textarea name="memo" value={editFormData.memo || ''} onChange={handleEditFormChange} className="w-64 border-gray-300 rounded-md" rows={1}></textarea></td>
                      </>
                    ) : (
                      // --- 表示モード ---
                      <>
                        <td className="px-4 py-2 font-medium sticky left-0 bg-white"><div className='flex gap-4'><button onClick={() => handleEditClick(project)} className="text-blue-600 hover:text-blue-900" title="編集"><PencilIcon className='h-5 w-5'/></button><Link href={`/projects/${project.id}`} className="text-indigo-600 hover:text-indigo-900" title="詳細">詳細</Link><Link href={`/projects/new?clone=${project.id}`} className="text-gray-500 hover:text-gray-800" title="複製">複製</Link></div></td>
                        <td className="px-4 py-2 font-medium text-gray-900 sticky left-32 bg-white">{project.pj_number}</td>
                        <td className="px-4 py-2"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{project.contract_status}</span></td>
                        <td className="px-4 py-2 text-gray-500">{project.project_date}</td>
                        <td className="px-4 py-2 text-gray-500">{project.sales_person}</td>
                        <td className="px-4 py-2 text-gray-500">{project.dealer_name}</td>
                        <td className="px-4 py-2 text-gray-500">{project.dealer_contact}</td>
                        <td className="px-4 py-2 text-gray-500">{project.general_contractor}</td>
                        <td className="px-4 py-2 text-gray-800">{project.site_name}</td>
                        <td className="px-4 py-2 text-gray-500">{project.installation_location}</td>
                        <td className="px-4 py-2 text-gray-500">{project.installation_address}</td>
                        <td className="px-4 py-2 text-gray-500">{project.transaction_type}</td>
                        <td className="px-4 py-2 text-gray-500">{project.product_category}</td>
                        <td className="px-4 py-2 text-gray-500">{project.stb}</td>
                        <td className="px-4 py-2 text-gray-500">{project.main_product_name}</td>
                        <td className="px-4 py-2 text-gray-500">{project.product_spec}</td>
                        {Array.from({ length: 10 }).map((_, i) => (<td key={i} className="px-4 py-2 text-gray-500">{project[`accessory_${i + 1}` as keyof Project] as string}</td>))}
                        <td className="px-4 py-2 text-gray-500">{project.shipping_address}</td>
                        <td className="px-4 py-2 text-gray-500">{project.installation_partner}</td>
                        <td className="px-4 py-2 text-gray-500">{project.removal_partner}</td>
                        <td className="px-4 py-2 text-gray-500">{project.contract_date}</td>
                        <td className="px-4 py-2 text-gray-500">{project.setup_completion_date}</td>
                        <td className="px-4 py-2 text-gray-500">{project.shipping_date}</td>
                        <td className="px-4 py-2 text-gray-500">{project.installation_request_date}</td>
                        <td className="px-4 py-2 text-gray-500">{project.installation_scheduled_date}</td>
                        <td className="px-4 py-2 text-gray-500">{project.installation_date}</td>
                        <td className="px-4 py-2 text-gray-500">{project.removal_request_date}</td>
                        <td className="px-4 py-2 text-gray-500">{project.removal_scheduled_date}</td>
                        <td className="px-4 py-2 text-gray-500">{project.removal_date}</td>
                        <td className="px-4 py-2 text-gray-500">{project.removal_inspection_date}</td>
                        <td className="px-4 py-2 text-gray-500">{project.warranty_end_date}</td>
                        <td className="px-4 py-2 text-gray-500"><div className="w-40 truncate" title={project.memo || ''}>{project.memo}</div></td>
                      </>
                    )}
                  </tr>
                ))
              ) : ( <tr><td colSpan={totalColumns} className="text-center py-8">該当するプロジェクトが見つかりません。</td></tr> )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}