// src/app/api/send-email/route.ts (修正済み・完全版)

import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { Project } from '@/types/project'; // 修正: 名前付きインポート {} を使用

export async function POST(request: NextRequest) {
  try {
    const projectData: Project = await request.json();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const createHtmlTable = (project: Project) => {
  let tableRows = '';
  const allKeys: Array<keyof Project> = [
    'pj_number', 'project_date', 'transaction_type', 'contract_status',
    'sales_person', 'dealer_name', 'dealer_contact', 'general_contractor',
    'site_name', 'installation_location', 'installation_address', 'shipping_address',
    'product_category', 'stb', 'main_product_name', 'product_spec',
    'accessory_1', 'accessory_2', 'accessory_3', 'accessory_4', 'accessory_5',
    'accessory_6', 'accessory_7', 'accessory_8', 'accessory_9', 'accessory_10',
    'installation_partner', 'removal_partner', 'contract_date', 'setup_completion_date',
    'shipping_date', 'installation_request_date', 'installation_scheduled_date',
    'installation_date', 'removal_request_date', 'removal_scheduled_date',
    'removal_date', 'removal_inspection_date', 'warranty_end_date', 'memo'
  ];
  
  const labels: { [key in keyof Project]?: string } = {
    pj_number: 'PJ番号', project_date: '案件発生日', transaction_type: '取引形態', contract_status: '契約ステータス',
    sales_person: '営業担当', dealer_name: 'ディーラー名', dealer_contact: 'ディーラー担当者', general_contractor: 'ゼネコン名',
    site_name: '現場名', installation_location: '設置場所(都道府県)', installation_address: '設置場所住所', shipping_address: '発送先住所',
    product_category: '商品カテゴリ', stb: 'STB', main_product_name: '本体商品名', product_spec: '製品仕様',
    accessory_1: '付属品1', accessory_2: '付属品2', accessory_3: '付属品3', accessory_4: '付属品4', accessory_5: '付属品5',
    accessory_6: '付属品6', accessory_7: '付属品7', accessory_8: '付属品8', accessory_9: '付属品9', accessory_10: '付属品10',
    installation_partner: '設置時パートナー', removal_partner: '撤去時パートナー', contract_date: '成約日', setup_completion_date: '設定作業完了日',
    shipping_date: '発送日', installation_request_date: '設置業務依頼日', installation_scheduled_date: '設置予定日',
    installation_date: '設置日', removal_request_date: '撤去業務依頼日', removal_scheduled_date: '撤去予定日',
    removal_date: '撤去日', removal_inspection_date: '撤去後検品日', warranty_end_date: '販売時保証終了日', memo: 'メモ'
  };

  for (const key of allKeys) {
    if (project[key]) {
      tableRows += `<tr><td style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2;"><strong>${labels[key] || key}</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${project[key]}</td></tr>`;
    }
  }
  return tableRows;
};

const mailOptions = {
  from: `PJ管理システム <${process.env.EMAIL_USER}>`,
  to: process.env.EMAIL_TO,
  subject: `【新規プロジェクト登録通知】${projectData.pj_number} / ${projectData.site_name || '現場名未設定'}`,
  html: `
    <div style="font-family: sans-serif; line-height: 1.6;">
      <h2 style="color: #333;">新規プロジェクトが登録されました</h2>
      <p>以下の内容で新しいプロジェクトが登録されましたので、ご確認ください。</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        ${createHtmlTable(projectData)}
      </table>
      <p style="margin-top: 20px; font-size: 12px; color: #777;">
        これはPJ管理システムからの自動通知メールです。
      </p>
    </div>
  `,
};

await transporter.sendMail(mailOptions);

return NextResponse.json({ success: true, message: 'メールが正常に送信されました' });

  } catch (error) {
    console.error('メール送信APIエラー:', error);
    const errorMessage = error instanceof Error ? error.message : '不明なエラーです。';
    return NextResponse.json({ success: false, error: 'メール送信に失敗しました', details: errorMessage }, { status: 500 });
  }
}