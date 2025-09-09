'use client';

import { useEffect, useState, ChangeEvent, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Project } from '@/types/project';
import { 
  MagnifyingGlassIcon, ClipboardDocumentListIcon, PencilIcon, CheckIcon,
  XMarkIcon, PlusCircleIcon, ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';

interface Filters {
  pj_number: string; contract_status: string; project_date_from: string; project_date_to: string;
  site_name: string; dealer_name: string; sales_person: string; transaction_type: string;
  product_category: string; installation_scheduled_date_from: string; installation_scheduled_date_to: string;
  removal_scheduled_date_from: string; removal_scheduled_date_to: string;
}

// 編集用のProjectの型（日付などをstringで許容）
type EditableProject = Omit<Partial<Project>, 'id'>;

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<EditableProject>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Project | null>(null);

  const initialFilters = useMemo(() => ({
    pj_number: '', contract_status: '', project_date_from: '', project_date_to: '',
    site_name: '', dealer_name: '', sales_person: '', transaction_type: '',
    product_category: '', installation_scheduled_date_from: '', installation_scheduled_date_to: '',
    removal_scheduled_date_from: '', removal_scheduled_date_to: '',
  }), []);
  const [filters, setFilters] = useState<Filters>(initialFilters);

  const statusOptions: Project['contract_status'][] = ['成約', '作業完了', '発送済', '設置済', '撤去済'];
  const salesPersonOptions = ['西井', '佐藤', '鈴木', '高橋'];
  const transactionTypeOptions: Project['transaction_type'][] = ['レンタル', '販売'];
  const productCategoryOptions = ['モニたろう', 'モニすけ', 'モニまる', 'メッシュ', 'その他'];
  const stbOptions = ['ゲンバルジャー', 'TOTO', '他社STB', 'なし'];

  const fetchProjects = useCallback(async (currentFilters: Filters) => {
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

    const { data, error } = await query.order('id', { ascending: false });
    if (error) {
      console.error('プロジェクト取得エラー:', error);
    } else {
      setProjects((data as Project[]) || []);
      setFilteredCount(data?.length || 0);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects(initialFilters);
    const fetchTotalCount = async () => {
      const { count } = await supabase.from('projects').select('*', { count: 'exact', head: true });
      setTotalCount(count || 0);
    };
    fetchTotalCount();
  }, [fetchProjects, initialFilters]);

  // --- 編集関連のハンドラー ---
  const handleEditClick = (project: Project) => {
    setEditTarget(project);
    setShowEditModal(true);
  };

  // 編集モーダル用フォーム
  const { register: editRegister, handleSubmit: handleEditSubmit, reset: editReset, formState: { errors: editErrors } } = useForm<Project>();

  // 編集モーダルを開いたらフォームに既存内容をセット
  useEffect(() => {
    if (showEditModal && editTarget) {
      editReset(editTarget);
    }
  }, [showEditModal, editTarget, editReset]);

  // 編集保存
  const onEditSave = async (data: Project) => {
    const { id, ...updateData } = data;
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
    dateFields.forEach(field => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((updateData as any)[field] === '') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (updateData as any)[field] = null;
      }
    });
    const { error } = await supabase.from('projects').update(updateData).eq('id', id);
    if (error) {
      alert('更新に失敗しました: ' + error.message);
    } else {
      alert('更新しました');
      setShowEditModal(false);
      setEditTarget(null);
      fetchProjects(filters);
    }
  };

  const handleEditFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => fetchProjects(filters);
  const handleReset = () => {
    setFilters(initialFilters);
    fetchProjects(initialFilters);
  };

  // 編集内容を保存する関数を追加
  const handleSaveClick = async (id: number) => {
    const dataToUpdate: EditableProject = { ...editFormData };
    for (const key in dataToUpdate) {
      const typedKey = key as keyof EditableProject;
      if (key.includes('date') && dataToUpdate[typedKey] === '') {
        (dataToUpdate as { [key: string]: unknown })[typedKey] = null;
      }
    }
    const { error } = await supabase.from('projects').update(dataToUpdate).eq('id', id);
    if (error) {
      alert(`更新に失敗しました: ${error.message}`);
    } else {
      alert('更新しました。');
      setEditingId(null);
      await fetchProjects(filters);
    }
  };

  // 編集キャンセル用の関数を追加
  const handleCancelClick = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const totalColumns = 43; // 2列追加




  return (
    <div className="mx-auto p-6">
      <div className="flex items-center mb-8">
        <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600 mr-2" />
        <h1 className="text-2xl font-bold text-blue-700">プロジェクト管理</h1>
      </div>

      {/* 検索フォームセクション */}
      <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl mb-8 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* PJ番号 */}
          <div>
            <label className="block text-sm font-medium mb-1">PJ番号</label>
            <input type="text" name="pj_number" value={filters.pj_number} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          {/* ステータス */}
          <div>
            <label className="block text-sm font-medium mb-1">ステータス</label>
            <select name="contract_status" value={filters.contract_status} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option value="">すべて</option>
              {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          {/* 現場名 */}
          <div>
            <label className="block text-sm font-medium mb-1">現場名</label>
            <input type="text" name="site_name" value={filters.site_name} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          {/* ディーラー名 */}
          <div>
            <label className="block text-sm font-medium mb-1">ディーラー名</label>
            <input type="text" name="dealer_name" value={filters.dealer_name} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          {/* 案件発生日 */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium mb-1">案件発生日</label>
            <div className="flex items-center gap-2">
              <input type="date" name="project_date_from" value={filters.project_date_from} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              <span>～</span>
              <input type="date" name="project_date_to" value={filters.project_date_to} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
          </div>
           {/* 設置予定日 */}
           <div className="lg:col-span-2">
            <label className="block text-sm font-medium mb-1">設置予定日</label>
            <div className="flex items-center gap-2">
              <input type="date" name="installation_scheduled_date_from" value={filters.installation_scheduled_date_from} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
              <span>～</span>
              <input type="date" name="installation_scheduled_date_to" value={filters.installation_scheduled_date_to} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
          <button onClick={handleReset} className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-400 text-gray-700 rounded-md text-sm hover:bg-gray-100">
            <ArrowPathIcon className="h-4 w-4" />
            リセット
          </button>
          <button onClick={handleSearch} className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold shadow hover:bg-blue-700">
            <MagnifyingGlassIcon className="h-5 w-5" />
            検索
          </button>
        </div>
      </div>

      {/* テーブルセクション */}
      <div className="bg-white border border-blue-100 shadow-lg rounded-xl mb-8 p-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h2 className="text-lg font-semibold text-blue-600">プロジェクト一覧</h2>
          <div className='flex items-center gap-4'>
             <div className="text-sm text-gray-600">
               全 {totalCount} 件中 {filteredCount} 件表示
             </div>
             <Link href="/projects/new" className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-semibold shadow hover:bg-green-700">
                <PlusCircleIcon className="h-5 w-5" />
                新規作成
             </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {/* --- 固定表示 --- */}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 w-32">操作</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-32 bg-gray-50 z-10">PJ番号</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">案件発生日</th>
                
                {/* --- 担当・取引先情報 --- */}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">営業担当</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ディーラー名</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ディーラー担当者</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ゼネコン名</th>

                {/* --- 現場情報 --- */}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">現場名</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">設置場所(都道府県)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">設置場所住所</th>

                {/* --- 商品情報 --- */}
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

                {/* --- パートナー・配送先情報 --- */}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">発送先住所</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">設置時パートナー</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">撤去時パートナー</th>

                {/* --- 日付関連 --- */}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">成約日</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">設定作業完了日</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">発送日</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">設置業務依頼書提出日</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">設置予定日</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">設置日</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">撤去業務依頼書提出日</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">撤去予定日</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">撤去日</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">撤去後検品完了日</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">販売時保証終了日</th>

                {/* --- その他 --- */}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">メモ</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">成約時見積書</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">設置時請求書</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={totalColumns} className="text-center py-8">読み込み中...</td></tr>
              ) : projects.length > 0 ? (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    {editingId === project.id ? (
                      // --- 編集モード ---
                      <>
                        <td className="px-4 py-1 text-sm font-medium sticky left-0 bg-white z-10">
                          <div className="action-group">
                            {typeof project.id === 'number' && (() => {
                              const id = project.id;
                              return (
                                <button
                                  onClick={() => handleSaveClick(id)}
                                  className="save text-green-600 hover:text-green-700 transition-colors duration-200"
                                  title="保存"
                                >
                                  <CheckIcon className='h-5 w-5'/>
                                </button>
                            );
                            })()}
                            <button 
                              onClick={handleCancelClick} 
                              className="cancel text-gray-500 hover:text-red-600 transition-colors duration-200"
                              title="キャンセル"
                            >
                              <XMarkIcon className='h-5 w-5'/>
                            </button>
                          </div>
                        </td>
                        <td className="px-1 py-1 sticky left-32 bg-white"><input type="text" name="pj_number" value={editFormData.pj_number || ''} onChange={handleEditFormChange} className="w-40 text-sm border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><select name="contract_status" value={editFormData.contract_status || ''} onChange={handleEditFormChange} className="w-32 text-sm border-gray-300 rounded-md">{statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></td>
                        <td className="px-1 py-1"><input type="date" name="project_date" value={editFormData.project_date || ''} onChange={handleEditFormChange} className="w-40 text-sm border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><select name="sales_person" value={editFormData.sales_person || ''} onChange={handleEditFormChange} className="w-32 text-sm border-gray-300 rounded-md">{salesPersonOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></td>
                        <td className="px-1 py-1"><input type="text" name="dealer_name" value={editFormData.dealer_name || ''} onChange={handleEditFormChange} className="w-48 text-sm border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="text" name="dealer_contact" value={editFormData.dealer_contact || ''} onChange={handleEditFormChange} className="w-40 text-sm border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="text" name="general_contractor" value={editFormData.general_contractor || ''} onChange={handleEditFormChange} className="w-48 text-sm border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="text" name="site_name" value={editFormData.site_name || ''} onChange={handleEditFormChange} className="w-48 text-sm border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="text" name="installation_location" value={editFormData.installation_location || ''} onChange={handleEditFormChange} className="w-32 text-sm border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="text" name="installation_address" value={editFormData.installation_address || ''} onChange={handleEditFormChange} className="w-64 text-sm border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><select name="transaction_type" value={editFormData.transaction_type || ''} onChange={handleEditFormChange} className="w-28 text-sm border-gray-300 rounded-md">{transactionTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></td>
                        <td className="px-1 py-1"><select name="product_category" value={editFormData.product_category || ''} onChange={handleEditFormChange} className="w-32 text-sm border-gray-300 rounded-md">{productCategoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></td>
                        <td className="px-1 py-1"><select name="stb" value={editFormData.stb || ''} onChange={handleEditFormChange} className="w-32 text-sm border-gray-300 rounded-md"><option value="">未選択</option>{stbOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></td>
                        <td className="px-1 py-1"><input type="text" name="main_product_name" value={editFormData.main_product_name || ''} onChange={handleEditFormChange} className="w-48 text-sm border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1">
                          <input
                            type="text"
                            name="product_spec"
                            value={editFormData.product_spec || ''}
                            onChange={handleEditFormChange}
                            className="w-48 text-sm border-gray-300 rounded-md"
                          />
                        </td>
                        {Array.from({ length: 10 }).map((_, i) => {
                          const key = `accessory_${i + 1}` as keyof EditableProject;
                          return (
                            <td key={i} className="px-1 py-1">
                              <input
                                type="text"
                                name={key}
                                value={editFormData[key] as string || ''}
                                onChange={handleEditFormChange}
                                className="w-40 text-sm border-gray-300 rounded-md"
                              />
                            </td>
                          );
                        })}
                        <td className="px-1 py-1"><input type="text" name="shipping_address" value={editFormData.shipping_address || ''} onChange={handleEditFormChange} className="w-64 text-sm border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="text" name="installation_partner" value={editFormData.installation_partner || ''} onChange={handleEditFormChange} className="w-40 text-sm border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="text" name="removal_partner" value={editFormData.removal_partner || ''} onChange={handleEditFormChange} className="w-40 text-sm border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="date" name="contract_date" value={editFormData.contract_date || ''} onChange={handleEditFormChange} className="w-40 text-sm border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="date" name="setup_completion_date" value={editFormData.setup_completion_date || ''} onChange={handleEditFormChange} className="w-40 text-sm border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="date" name="shipping_date" value={editFormData.shipping_date || ''} onChange={handleEditFormChange} className="w-40 text-sm border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="date" name="installation_request_submission_date" value={editFormData.installation_request_date || ''} onChange={handleEditFormChange} className="w-40 text-sm border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="date" name="installation_scheduled_date" value={editFormData.installation_scheduled_date || ''} onChange={handleEditFormChange} className="w-40 text-sm border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="date" name="installation_date" value={editFormData.installation_date || ''} onChange={handleEditFormChange} className="w-40 text-sm border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1">
                          <input
                            type="date"
                            name="removal_request_date"
                            value={editFormData.removal_request_date || ''}
                            onChange={handleEditFormChange}
                            className="w-40 text-sm border-gray-300 rounded-md"
                          />
                        </td>
                        <td className="px-1 py-1"><input type="date" name="removal_scheduled_date" value={editFormData.removal_scheduled_date || ''} onChange={handleEditFormChange} className="w-40 text-sm border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="date" name="removal_date" value={editFormData.removal_date || ''} onChange={handleEditFormChange} className="w-40 text-sm border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="date" name="removal_inspection_date" value={editFormData.removal_inspection_date || ''} onChange={handleEditFormChange} className="w-40 text-sm border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><input type="date" name="warranty_end_date" value={editFormData.warranty_end_date || ''} onChange={handleEditFormChange} className="w-40 text-sm border-gray-300 rounded-md" /></td>
                        <td className="px-1 py-1"><textarea name="memo" value={editFormData.memo || ''} onChange={handleEditFormChange} className="w-64 text-sm border-gray-300 rounded-md" rows={1}></textarea></td>
                      </>
                    ) : (
                      // --- 表示モード ---
                      <>
                        <td className="px-4 py-4 text-sm font-medium sticky left-0 bg-white"><div className='flex gap-4'><button onClick={() => handleEditClick(project)} className="text-blue-600 hover:text-blue-900" title="編集"><PencilIcon className='h-5 w-5'/></button><Link href={`/projects/new?clone=${project.id}`} className="text-gray-500 hover:text-gray-800" title="複製">複製</Link></div></td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900 sticky left-32 bg-white">{project.pj_number}</td>
                        <td className="px-4 py-4 text-sm"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{project.contract_status}</span></td>
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">{project.project_date}</td>
                        <td className="px-4 py-4 text-sm text-gray-500">{project.sales_person}</td>
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-normal break-words">{project.dealer_name}</td>
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-normal break-words">{project.dealer_contact}</td>
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-normal break-words">{project.general_contractor}</td>
                        <td className="px-4 py-4 text-sm text-gray-800 whitespace-normal break-words">{project.site_name}</td>
                        <td className="px-4 py-4 text-sm text-gray-500">{project.installation_location}</td>
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-normal break-words">{project.installation_address}</td>
                        <td className="px-4 py-4 text-sm text-gray-500">{project.transaction_type}</td>
                        <td className="px-4 py-4 text-sm text-gray-500">{project.product_category}</td>
                        <td className="px-4 py-4 text-sm text-gray-500">{project.stb}</td>
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-normal break-words">{project.main_product_name}</td>
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-normal break-words">{project.product_spec}</td>
                        {Array.from({ length: 10 }).map((_, i) => (<td key={i} className="px-4 py-4 text-sm text-gray-500 whitespace-normal break-words">{project[`accessory_${i + 1}` as keyof Project] as string}</td>))}
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-normal break-words">{project.shipping_address}</td>
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-normal break-words">{project.installation_partner}</td>
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-normal break-words">{project.removal_partner}</td>
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">{project.contract_date}</td>
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">{project.setup_completion_date}</td>
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">{project.shipping_date}</td>
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">{project.installation_request_date}</td>
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">{project.installation_scheduled_date}</td>
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">{project.installation_date}</td>
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">{project.removal_request_date}</td>
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">{project.removal_scheduled_date}</td>
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">{project.removal_date}</td>
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">{project.removal_inspection_date}</td>
                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-normal break-words">{project.memo}</td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {project.quote_file_url
                            ? <a href={project.quote_file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{project.quote_file_name || 'ダウンロード'}</a>
                            : <span className="text-gray-400">未登録</span>
                          }
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {project.invoice_file_url
                            ? <a href={project.invoice_file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{project.invoice_file_name || 'ダウンロード'}</a>
                            : <span className="text-gray-400">未登録</span>
                          }
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr><td colSpan={totalColumns} className="text-center py-8">該当するプロジェクトが見つかりません。</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* 編集モーダル */}
      {showEditModal && editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full relative overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => { setShowEditModal(false); setEditTarget(null); }}
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-6">{editTarget ? 'プロジェクト編集' : '新規プロジェクト申し込み'}</h2>
            <form onSubmit={handleEditSubmit(onEditSave)} className="space-y-8">
              {/* --- 基本情報 --- */}
              <div className="p-6 border rounded-lg bg-white shadow-sm">
                <h2 className="text-lg font-semibold mb-6 border-b pb-4">基本情報</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">案件発生日 <span className="text-red-500">*</span></label>
                    <input type="date" {...editRegister('project_date', { required: true })} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">取引形態 <span className="text-red-500">*</span></label>
                    <select {...editRegister('transaction_type', { required: true })} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                      <option value="">選択してください</option>
                      <option value="レンタル">レンタル</option>
                      <option value="販売">販売</option>
                    </select>
                  </div>
                </div>
              </div>
              {/* --- 担当・取引先情報 --- */}
              <div className="p-6 border rounded-lg bg-white shadow-sm">
                <h2 className="text-lg font-semibold mb-6 border-b pb-4">担当・取引先情報</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">営業担当 <span className="text-red-500">*</span></label>
                    <input type="text" {...editRegister('sales_person', { required: true })} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">ディーラー名 <span className="text-red-500">*</span></label>
                    <input type="text" {...editRegister('dealer_name', { required: true })} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">ディーラー担当者名</label>
                    <input type="text" {...editRegister('dealer_contact')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">ゼネコン名</label>
                    <input type="text" {...editRegister('general_contractor')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" />
                  </div>
                </div>
              </div>
              {/* --- 現場情報 --- */}
              <div className="p-6 border rounded-lg bg-white shadow-sm">
                <h2 className="text-lg font-semibold mb-6 border-b pb-4">現場情報</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">設置場所(都道府県) <span className="text-red-500">*</span></label>
                    <input type="text" {...editRegister('installation_location', { required: true })} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">現場名</label>
                    <input type="text" {...editRegister('site_name')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">設置場所住所</label>
                    <input type="text" {...editRegister('installation_address')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" />
                  </div>
                </div>
              </div>
              {/* --- 商品カテゴリとSTB --- */}
              <div className="p-6 border rounded-lg bg-white shadow-sm">
                <h2 className="text-lg font-semibold mb-6 border-b pb-4">商品カテゴリ・STB</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">商品カテゴリ <span className="text-red-500">*</span></label>
                    <select {...editRegister('product_category', { required: true })} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                      <option value="">選択してください</option>
                      <option value="モニたろう">モニたろう</option>
                      <option value="モニすけ">モニすけ</option>
                      <option value="モニまる">モニまる</option>
                      <option value="メッシュ">メッシュ</option>
                      <option value="その他">その他</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">STB</label>
                    <select {...editRegister('stb')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
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
                    <input type="text" {...editRegister('main_product_name')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">製品仕様</label>
                    <input type="text" {...editRegister('product_spec')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" />
                  </div>
                </div>
                <h3 className="text-md font-semibold mt-6 mb-4 border-t pt-4">付属品</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i}>
                      <label className="block text-sm font-medium mb-2">{`付属品名 ${i + 1}`}</label>
                      <input type="text" {...editRegister(`accessory_${i + 1}` as keyof Project)} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" />
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
                    <input type="text" {...editRegister('installation_partner')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">撤去時パートナー</label>
                    <input type="text" {...editRegister('removal_partner')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">発送先住所</label>
                    <input type="text" {...editRegister('shipping_address')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" />
                  </div>
                </div>
              </div>
              {/* --- 日付関連 --- */}
              <div className="p-6 border rounded-lg bg-white shadow-sm">
                <h2 className="text-lg font-semibold mb-6 border-b pb-4">関連日付</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="block text-sm font-medium mb-2">成約日</label><input type="date" {...editRegister('contract_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" /></div>
                  <div><label className="block text-sm font-medium mb-2">設置予定日</label><input type="date" {...editRegister('installation_scheduled_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" /></div>
                  <div><label className="block text-sm font-medium mb-2">設定作業完了日</label><input type="date" {...editRegister('setup_completion_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" /></div>
                  <div><label className="block text-sm font-medium mb-2">発送日</label><input type="date" {...editRegister('shipping_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" /></div>
                  <div><label className="block text-sm font-medium mb-2">設置業務依頼日</label><input type="date" {...editRegister('installation_request_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" /></div>
                  <div><label className="block text-sm font-medium mb-2">設置日</label><input type="date" {...editRegister('installation_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" /></div>
                  <div><label className="block text-sm font-medium mb-2">撤去予定日</label><input type="date" {...editRegister('removal_scheduled_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" /></div>
                  <div><label className="block text-sm font-medium mb-2">撤去業務依頼日</label><input type="date" {...editRegister('removal_request_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" /></div>
                  <div><label className="block text-sm font-medium mb-2">撤去日</label><input type="date" {...editRegister('removal_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" /></div>
                  <div><label className="block text-sm font-medium mb-2">撤去後検品日</label><input type="date" {...editRegister('removal_inspection_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" /></div>
                  <div><label className="block text-sm font-medium mb-2">販売時保証終了日</label><input type="date" {...editRegister('warranty_end_date')} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" /></div>
                </div>
              </div>
              {/* --- メモ --- */}
              <div className="p-6 border rounded-lg bg-white shadow-sm">
                <h2 className="text-lg font-semibold mb-6 border-b pb-4">メモ</h2>
                <div>
                  <textarea {...editRegister('memo')} rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50" />
                </div>
              </div>
              {/* --- 操作ボタン --- */}
              <div className="flex justify-end gap-4 mt-8">
                <button type="submit" className="px-8 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">
                  保存
                </button>
                <button type="button" className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100" onClick={() => { setShowEditModal(false); setEditTarget(null); }}>
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}