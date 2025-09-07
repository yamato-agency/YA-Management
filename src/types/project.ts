// src/types/project.ts

export interface Project {
  id?: number;
  pj_number: string;
  project_date: string | null;
  transaction_type: string;
  contract_status: string;
  sales_person: string;
  dealer_name: string;
  dealer_contact?: string;          // 追加
  general_contractor?: string;      // 追加
  site_name: string;
  installation_location?: string;   // 追加
  installation_address?: string;    // 追加
  shipping_address?: string;
  product_category: string;
  stb?: string;
  main_product_name?: string;
  product_spec?: string;
  accessory_1?: string;
  accessory_2?: string;
  accessory_3?: string;
  accessory_4?: string;
  accessory_5?: string;
  accessory_6?: string;
  accessory_7?: string;
  accessory_8?: string;
  accessory_9?: string;
  accessory_10?: string;
  installation_partner?: string;
  removal_partner?: string;
  contract_date?: string | null;
  setup_completion_date?: string | null;
  shipping_date?: string | null;
  installation_request_date?: string | null;
  installation_scheduled_date?: string | null;
  installation_date?: string | null;
  removal_request_date?: string | null;
  removal_scheduled_date?: string | null;
  removal_date?: string | null;
  removal_inspection_date?: string | null; // inspection_date から名称を修正
  warranty_end_date?: string | null;
  memo?: string;
  created_at?: string;
  quote_file_url?: string;
  quote_file_name?: string;
  invoice_file_url?: string;
  invoice_file_name?: string;
}

export interface ProjectHistory {
  id: number;
  project_id: number;
  category: '営業' | '作業' | 'メンテ';
  date: string;
  content: string;
  input_by: string;
  created_at?: string;
}