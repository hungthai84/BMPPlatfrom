import React from "react";
import { CheckSquare, Clock, Filter, AlertCircle } from "lucide-react";

export default function MyTasks() {
  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Công Việc Của Tôi</h2>
              <p className="text-[13px] font-medium text-slate-500">Danh sách các bước quy trình đang chờ bạn xử lý</p>
            </div>
          </div>
          
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[12px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
            <Filter className="w-3.5 h-3.5" />
            Lọc công việc
          </button>
        </div>
        
        <div className="space-y-3">
          {/* Fake tasks */}
          {[1, 2, 3].map((task) => (
            <div key={task} className="flex items-start gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors bg-white dark:bg-slate-900 cursor-pointer group">
              <div className="mt-1">
                <div className="w-5 h-5 rounded border border-slate-300 dark:border-slate-600 group-hover:border-emerald-500 transition-colors"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="text-[14px] font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">Phê duyệt yêu cầu mua sắm thiết bị IT #{2004 + task}</h4>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${task === 1 ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30'}`}>
                    {task === 1 ? 'Quá hạn' : 'Sắp đến hạn'}
                  </span>
                </div>
                <p className="text-[12px] font-medium text-slate-500 mb-3">Quy trình: Mua sắm tài sản (PROC-001) • Người tạo: Nguyễn Văn A</p>
                <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    Hạn xử lý: Hôm nay, 17:00
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Độ ưu tiên: Cao
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
