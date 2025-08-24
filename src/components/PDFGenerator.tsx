// src/components/PDFGenerator.tsx (修正済み・完全版)

'use client';

import { Project } from '@/types/project';
import jsPDF from 'jspdf';

// PDF生成ボタンのアイコン
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';

interface PDFGeneratorProps {
  project: Project;
}

export default function PDFGenerator({ project }: PDFGeneratorProps) {

  const generatePDF = async () => {
    try {
      // ステップ1: publicフォルダからフォントファイルを読み込む
      const fontResponse = await fetch('/fonts/NotoSansJP-Regular.ttf');
      if (!fontResponse.ok) {
        throw new Error('フォントファイルの読み込みに失敗しました。');
      }
      const fontBuffer = await fontResponse.arrayBuffer();
      const fontBase64 = btoa(new Uint8Array(fontBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));

      // ステップ2: jsPDFインスタンスを作成し、フォントを登録
      const doc = new jsPDF();
      doc.addFileToVFS('NotoSansJP-Regular.ttf', fontBase64);
      doc.addFont('NotoSansJP-Regular.ttf', 'NotoSansJP', 'normal');
      doc.setFont('NotoSansJP');

      // --- 以下、PDFの内容を描画する処理 (変更なし) ---

      let y = 20;
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const lineHeight = 8;
      const sectionSpacing = 12;

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      const drawSectionTitle = (title: string) => {
        checkPageBreak(sectionSpacing);
        y += sectionSpacing;
        doc.setFontSize(14);
        doc.text(title, margin, y);
        y += lineHeight;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, 190, y);
        y += lineHeight;
      };

      const drawField = (label: string, value: string | undefined | null) => {
        const text = value || '未入力';
        const splitText = doc.splitTextToSize(`${label ? label + ': ' : ''}${text}`, 170);
        const textHeight = splitText.length * 6;
        checkPageBreak(textHeight);
        doc.setFontSize(10);
        doc.text(splitText, margin, y);
        y += textHeight + 2;
      };

      doc.setFontSize(18);
      doc.text(`プロジェクト詳細: ${project.pj_number}`, margin, y);

      drawSectionTitle('基本情報');
      drawField('PJ番号', project.pj_number);
      drawField('案件発生日', project.project_date);
      drawField('取引形態', project.transaction_type);
      drawField('契約ステータ tribulations', project.contract_status);

      drawSectionTitle('担当・取引先情報');
      drawField('営業担当', project.sales_person);
      drawField('ディーラー名', project.dealer_name);
      drawField('ディーラー担当者名', project.dealer_contact);
      drawField('ゼネコン名', project.general_contractor);

      drawSectionTitle('現場情報');
      drawField('現場名', project.site_name);
      drawField('設置場所 (都道府県)', project.installation_location);
      drawField('設置場所住所', project.installation_address);
      drawField('発送先住所', project.shipping_address);

      drawSectionTitle('商品情報');
      drawField('商品カテゴリ', project.product_category);
      drawField('STB', project.stb);
      drawField('本体商品名', project.main_product_name);
      drawField('製品仕様', project.product_spec);
      
      const accessories = Array.from({ length: 10 }, (_, i) => project[`accessory_${i + 1}` as keyof Project] as string)
        .filter(Boolean)
        .map((acc, i) => `${i + 1}. ${acc}`)
        .join('\n');
      if (accessories) {
        drawField('付属品', accessories);
      }
      
      drawSectionTitle('パートナー情報');
      drawField('設置時パートナー', project.installation_partner);
      drawField('撤去時パートナー', project.removal_partner);

      drawSectionTitle('関連日付');
      drawField('成約日', project.contract_date);
      drawField('設定作業完了日', project.setup_completion_date);
      drawField('発送日', project.shipping_date);
      drawField('設置業務依頼日', project.installation_request_date);
      drawField('設置予定日', project.installation_scheduled_date);
      drawField('設置日', project.installation_date);
      drawField('撤去業務依頼日', project.removal_request_date);
      drawField('撤去予定日', project.removal_scheduled_date);
      drawField('撤去日', project.removal_date);
      drawField('撤去後検品日', project.removal_inspection_date);
      if (project.transaction_type === '販売') {
          drawField('販売時保証終了日', project.warranty_end_date);
      }

      drawSectionTitle('メモ');
      drawField('', project.memo);

      const fileName = `プロジェクト詳細_${project.pj_number}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('PDF生成エラー:', error);
      alert('PDFの生成に失敗しました。フォントファイルが正しい場所に配置されているか確認してください。');
    }
  };

  return (
    <button
      onClick={generatePDF}
      className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
    >
      <DocumentArrowDownIcon className="h-4 w-4" />
      PDF出力
    </button>
  );
}