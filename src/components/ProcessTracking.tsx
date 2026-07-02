import React from "react";
import { Activity, Search, PlayCircle, Clock } from "lucide-react";

export default function ProcessTracking() {
  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Theo Dõi Tiến Độ</h2>
              <p className="text-[13px] font-medium text-slate-500">Giám sát trạng thái các luồng quy trình đang được thực thi</p>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm mã hồ sơ..." 
              className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[13px] font-medium w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Mã Hồ Sơ</th>
                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Tên Quy Trình</th>
                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Người Yêu Cầu</th>
                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng Thái (Bước hiện tại)</th>
                <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Bắt Đầu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {[
                { id: 'REQ-2023-0102', process: 'Tuyển dụng nhân sự mới', requester: 'Lê Thị B', status: 'Phỏng vấn vòng 1', date: '02/10/2026' },
                { id: 'REQ-2023-0105', process: 'Thanh toán công tác phí', requester: 'Trần Văn C', status: 'Chờ phê duyệt GĐ', date: '04/10/2026' },
                { id: 'REQ-2023-0108', process: 'Mua sắm tài sản', requester: 'Nguyễn Văn A', status: 'Thẩm định giá', date: '05/10/2026' }
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-[12px] font-bold text-slate-700 dark:text-slate-300">{row.id}</td>
                  <td className="py-3 px-4 text-[13px] font-bold text-slate-800 dark:text-slate-100">{row.process}</td>
                  <td className="py-3 px-4 text-[13px] font-medium text-slate-600 dark:text-slate-400">{row.requester}</td>
                  <td className="py-3 px-4">
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg text-[11px] font-bold">
                      <PlayCircle className="w-3.5 h-3.5" />
                      {row.status}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[12px] font-medium text-slate-500">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
