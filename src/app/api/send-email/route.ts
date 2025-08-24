import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { Project } from '@/types/project';

export async function POST(request: NextRequest) {
  try {
    const projectData: Project = await request.json();

    // Gmail SMTPサーバー設定
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // アプリパスワード
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO, // 受信者のメールアドレス
      subject: `新規プロジェクト申し込み - ${projectData.pj_number}`,
      html: `
        <h2>新規プロジェクト申し込みが登録されました</h2>
        <table border="1" cellpadding="5" cellspacing="0">
          <tr><td><strong>PJ番号</strong></td><td>${projectData.pj_number}</td></tr>
          <tr><td><strong>案件発生日</strong></td><td>${projectData.project_date}</td></tr>
          <tr><td><strong>取引形態</strong></td><td>${projectData.transaction_type}</td></tr>
          <tr><td><strong>営業担当</strong></td><td>${projectData.sales_person}</td></tr>
          <tr><td><strong>設置場所</strong></td><td>${projectData.installation_location}</td></tr>
          <tr><td><strong>ディーラー名</strong></td><td>${projectData.dealer_name}</td></tr>
          <tr><td><strong>現場名</strong></td><td>${projectData.site_name || ''}</td></tr>
          <tr><td><strong>商品カテゴリ</strong></td><td>${projectData.product_category || ''}</td></tr>
          <tr><td><strong>メモ</strong></td><td>${projectData.memo || ''}</td></tr>
        </table>
      `,
    };

    await transporter.sendMail(mailOptions);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('メール送信エラー:', error);
    return NextResponse.json({ error: 'メール送信に失敗しました' }, { status: 500 });
  }
}