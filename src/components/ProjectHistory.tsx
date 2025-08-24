// src/components/ProjectHistory.tsx

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { ProjectHistory as ProjectHistoryType } from '@/types/project';

interface ProjectHistoryProps {
  projectId: number;
}

interface HistoryFormData {
  category: '営業' | '作業' | 'メンテ';
  date: string;
  content: string;
}

export default function ProjectHistory({ projectId }: ProjectHistoryProps) {
  const [history, setHistory] = useState<ProjectHistoryType[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { register, handleSubmit, reset } = useForm<HistoryFormData>();

  useEffect(() => {
    fetchHistory();
  }, [projectId]);

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('project_history')
      .select('*')
      .eq('project_id', projectId)
      .order('date', { ascending: false });

    if (data) setHistory(data);
    setLoading(false);
  };

  const onSubmit = async (formData: HistoryFormData) => {
    const newHistoryEntry = {
      project_id: projectId,
      ...formData,
      input_by: '（現在のユーザー）' // Auth機能と連携して設定
    };

    const { data, error } = await supabase
      .from('project_history')
      .insert([newHistoryEntry])
      .select();
    
    if (data) {
      setHistory([data[0], ...history]);
      reset(); // フォームをリセット
    } else {
      console.error('履歴追加エラー:', error);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">プロジェクト履歴</h2>
      
      {/* 履歴追加フォーム */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select {...register('category')} className="px-3 py-2 border rounded-md">
              <option value="営業">営業</option>
              <option value="作業">作業</option>
              <option value="メンテ">メンテ</option>
            </select>
            <input type="date" {...register('date', { required: true })} className="px-3 py-2 border rounded-md" />
          </div>
          <textarea {...register('content', { required: true })} rows={3} placeholder="内容を入力..." className="w-full px-3 py-2 border rounded-md" />
          <div className="text-right">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              履歴を追加
            </button>
          </div>
        </form>
      </div>

      {/* 履歴一覧 */}
      <div className="space-y-4">
        {loading ? <p>履歴を読み込み中...</p> : history.map(item => (
          <div key={item.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-white shadow-sm">
            <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
              <span><strong>カテゴリ:</strong> {item.category}</span>
              <span><strong>日付:</strong> {item.date}</span>
            </div>
            <p className="text-gray-800">{item.content}</p>
            <p className="text-right text-xs text-gray-500 mt-2">入力者: {item.input_by}</p>
          </div>
        ))}
      </div>
    </div>
  );
}