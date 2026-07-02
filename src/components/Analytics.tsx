import React from "react";
import { BarChart2, TrendingUp, Users, Activity } from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from "recharts";

const approvalTrendData = [
  { month: 'T1', approved: 45, rejected: 10 },
  { month: 'T2', approved: 52, rejected: 12 },
  { month: 'T3', approved: 68, rejected: 8 },
  { month: 'T4', approved: 74, rejected: 15 },
  { month: 'T5', approved: 85, rejected: 11 },
  { month: 'T6', approved: 92, rejected: 9 },
];

const complianceData = [
  { department: 'Nhân sự', rate: 95 },
  { department: 'Kế toán', rate: 98 },
  { department: 'IT', rate: 85 },
  { department: 'Kinh doanh', rate: 76 },
  { department: 'Sản xuất', rate: 88 },
];

export default function Analytics() {
  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Báo Cáo Nâng Cao</h2>
            <p className="text-[13px] font-medium text-slate-500">Phân tích hiệu suất, điểm thắt nút và SLA quy trình</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest">Thời gian xử lý TB</span>
            </div>
            <div className="text-2xl font-black text-slate-800 dark:text-slate-100">4.2 <span className="text-sm font-medium text-slate-500">giờ</span></div>
          </div>
          
          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest">Tỉ lệ quá hạn (SLA)</span>
            </div>
            <div className="text-2xl font-black text-slate-800 dark:text-slate-100">12.5%</div>
          </div>
          
          <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Users className="w-4 h-4 text-purple-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest">Nhân sự quá tải</span>
            </div>
            <div className="text-2xl font-black text-slate-800 dark:text-slate-100">3 <span className="text-sm font-medium text-slate-500">phòng ban</span></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1 */}
          <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/30">
            <h3 className="text-[14px] font-bold text-slate-800 dark:text-slate-200 mb-4">Xu hướng phê duyệt quy trình</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={approvalTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="approved" name="Đã duyệt" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorApproved)" />
                  <Area type="monotone" dataKey="rejected" name="Từ chối" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorRejected)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2 */}
          <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/30">
            <h3 className="text-[14px] font-bold text-slate-800 dark:text-slate-200 mb-4">Tỷ lệ tuân thủ ISO theo phòng ban</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={complianceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis dataKey="department" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} width={80} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`${value}%`, 'Tỷ lệ tuân thủ']}
                  />
                  <Bar dataKey="rate" name="Tỷ lệ tuân thủ" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
