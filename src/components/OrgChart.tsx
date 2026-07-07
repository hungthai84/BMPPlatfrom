import React from 'react';

const blocks = [
  { title: 'KHỐI ĐIỀU HÀNH CHIẾN LƯỢC', color: 'bg-blue-600', items: ['Ban Chiến lược', 'Quản trị rủi ro', 'Quản trị hiệu suất (OKR/KPI)', 'Báo cáo & Phân tích điều hành'] },
  { title: 'KHỐI HÀNH CHÍNH QUẢN TRỊ', color: 'bg-green-600', items: ['Hành chính văn phòng', 'Quản lý tài sản văn phòng', 'Quản lý mua sắm hành chính', 'Quản lý dịch vụ hậu cần', 'Lễ tân – Bảo vệ – Vệ sinh'] },
  { title: 'KHỐI NHÂN SỰ', color: 'bg-orange-500', items: ['Tuyển dụng', 'Hồ sơ nhân sự', 'Chấm công & Quản lý thời gian', 'Tiền lương & Phúc lợi', 'Đào tạo & Phát triển', 'Đánh giá & Khen thưởng'] },
  { title: 'KHỐI TÀI CHÍNH KẾ TOÁN', color: 'bg-teal-600', items: ['Tài chính', 'Kế toán', 'Ngân sách & Kế hoạch tài chính', 'Quản lý thuế', 'Quản lý công nợ'] },
  { title: 'KHỐI MUA HÀNG VẬN HÀNH', color: 'bg-purple-600', items: ['Mua hàng', 'Quản lý nhà cung cấp', 'Kho', 'Logistics', 'Quản lý chất lượng (QA/QC)', 'Sản xuất', 'R&D (Nghiên cứu & Phát triển)'] },
  { title: 'KHỐI KINH DOANH MARKETING', color: 'bg-blue-500', items: ['Kinh doanh (Sales)', 'Marketing', 'Quản lý khách hàng (CRM)', 'Chăm sóc khách hàng (Customer Service)', 'Contact Center'] },
  { title: 'KHỐI CÔNG NGHỆ THÔNG TIN', color: 'bg-red-500', items: ['IT (Hạ tầng & Hệ thống)', 'Phát triển phần mềm (Software Development)', 'Helpdesk (ITSM)', 'An ninh mạng & Bảo mật', 'Quản lý dữ liệu (Data)', 'AI & Chuyển đổi số'] },
  { title: 'KHỐI HỖ TRỢ KIỂM SOÁT', color: 'bg-amber-500', items: ['Pháp chế', 'Kiểm toán nội bộ', 'Tuân thủ (Compliance)', 'Quản lý rủi ro'] },
  { title: 'KHỐI PHÂN TÍCH & QUẢN TRỊ DỮ LIỆU', color: 'bg-slate-500', items: ['BI & Data Analytics', 'Quản trị dữ liệu (Data Governance)', 'Báo cáo quản trị (Dashboard)'] }
];

export default function OrgChartVisual() {
  return (
    <div className="p-6 main-card overflow-auto">
      <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-10">SƠ ĐỒ TỔ CHỨC DOANH NGHIỆP</h2>
      
      <div className="flex flex-col items-center gap-2 mb-10">
        <div className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold text-sm">ĐẠI HỘI ĐỒNG CỔ ĐÔNG</div>
        <div className="w-0.5 h-4 bg-slate-400" />
        <div className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold text-sm">HỘI ĐỒNG QUẢN TRỊ</div>
        <div className="w-0.5 h-4 bg-slate-400" />
        <div className="bg-blue-900 text-white px-6 py-2 rounded-lg font-bold text-sm">TỔNG GIÁM ĐỐC (CEO)</div>
        <div className="w-full max-w-5xl h-0.5 bg-slate-400 mt-4" />
      </div>

      <div className="grid grid-cols-9 gap-2">
        {blocks.map((block, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            <div className={`${block.color} text-white p-2 rounded-lg font-bold text-[10px] text-center h-16 flex items-center justify-center`}>
              {block.title}
            </div>
            {block.items.map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1.5 rounded text-[9px] text-center font-semibold text-slate-800 dark:text-slate-200 shadow-sm">
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
