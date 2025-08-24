'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // Supabaseクライアントをインポート

export default function CustomerNewPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    dealerCode: '',
    companyName: '',
    officeName: '',
    postalCode: '',
    address: '',
    tel: '',
    fax: '',
    contactName: '',
    contactEmail: '',
    paymentTerms: '',
    creditLimit: '',
    remarks: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // 入力値のバリデーション
    if (!form.dealerCode || !form.companyName) {
      setError('ディラーコードと会社名は必須です');
      return;
    }
    // Supabaseへ登録
    const { error: insertError } = await supabase
      .from('customers')
      .insert([{
        dealer_code: form.dealerCode,
        company_name: form.companyName,
        office_name: form.officeName,
        postal_code: form.postalCode,
        address: form.address,
        tel: form.tel,
        fax: form.fax,
        contact_name: form.contactName,
        contact_email: form.contactEmail,
        payment_terms: form.paymentTerms,
        credit_limit: form.creditLimit ? Number(form.creditLimit) : null,
        remarks: form.remarks,
      }]);
    if (insertError) {
      setError('登録に失敗しました: ' + insertError.message);
      return;
    }
    router.push('/customers');
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4">新規取引先マスタ登録</h1>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">ディラー(取引先)コード</label>
          <input name="dealerCode" value={form.dealerCode} onChange={handleChange} className="w-full border px-2 py-1 rounded" required />
        </div>
        <div>
          <label className="block text-sm font-medium">会社名</label>
          <input name="companyName" value={form.companyName} onChange={handleChange} className="w-full border px-2 py-1 rounded" required />
        </div>
        <div>
          <label className="block text-sm font-medium">営業所名</label>
          <input name="officeName" value={form.officeName} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">郵便番号</label>
          <input name="postalCode" value={form.postalCode} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">住所</label>
          <input name="address" value={form.address} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">電話番号</label>
          <input name="tel" value={form.tel} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">FAX番号</label>
          <input name="fax" value={form.fax} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">担当者名</label>
          <input name="contactName" value={form.contactName} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">担当者メール</label>
          <input name="contactEmail" value={form.contactEmail} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">支払い条件</label>
          <input name="paymentTerms" value={form.paymentTerms} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">与信限度額</label>
          <input name="creditLimit" value={form.creditLimit} onChange={handleChange} className="w-full border px-2 py-1 rounded" type="number" />
        </div>
        <div>
          <label className="block text-sm font-medium">備考</label>
          <textarea name="remarks" value={form.remarks} onChange={handleChange} className="w-full border px-2 py-1 rounded" />
        </div>
        <div className="text-right space-x-2">
          <button
            type="button"
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            onClick={() => router.push('/customers')}
          >
            キャンセル
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            登録
          </button>
        </div>
      </form>
    </div>
  );
}
