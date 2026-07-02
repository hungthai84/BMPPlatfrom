import React, { useState, useRef, useEffect } from "react";
import { Process, ProcessStatus } from "../types";
import { 
  TrendingUp, CheckCircle, Edit, Clock, AlertTriangle, 
  Search, ZoomIn, ZoomOut, Maximize2, GitBranch, 
  Layers, Users, ShieldAlert, Award
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Cell 
} from "recharts";

interface DashboardProps {
  processes: Process[];
  onSelectProcess: (id: string, tab: 'workflow' | 'sop' | 'publish') => void;
}

type MapType = 'value_chain' | 'tree' | 'mindmap' | 'org_map' | 'kanban';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-md text-left z-50">
        <p className="font-bold text-xs text-slate-900 dark:text-white mb-1">{data.fullName}</p>
        <div className="space-y-1 text-[11px] font-semibold">
          <p className="text-blue-600 dark:text-blue-400">
            Trung bình: <span className="font-bold text-xs">{data['Tỷ lệ hoàn thành (%)']}%</span>
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            Số quy trình: <span className="font-bold">{data['Quy trình']}</span>
          </p>
          <p className="text-emerald-600 dark:text-emerald-400">
            Hiệu lực: <span className="font-bold">{data['Đang hiệu lực']}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function Dashboard({ processes, onSelectProcess }: DashboardProps) {
  const [mapType, setMapType] = useState<MapType>('kanban');
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Department filter
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("Tất cả");

  // Kanban state
  const [kanbanProcesses, setKanbanProcesses] = useState<Process[]>(processes);
  
  useEffect(() => {
    setKanbanProcesses(processes);
  }, [processes]);

  // Group processes by level 2 departments for comparison (always calculated across all processes)
  const depts = [
    { name: "Khối Chiến lược", color: "from-indigo-500 to-indigo-600", border: "border-indigo-200", text: "text-indigo-700", bg: "bg-indigo-50" },
    { name: "Khối Kinh doanh", color: "from-blue-500 to-blue-600", border: "border-blue-200", text: "text-blue-700", bg: "bg-blue-50" },
    { name: "Khối Marketing", color: "from-pink-500 to-pink-600", border: "border-pink-200", text: "text-pink-700", bg: "bg-pink-50" },
    { name: "Khối Dịch vụ Khách hàng", color: "from-teal-500 to-teal-600", border: "border-teal-200", text: "text-teal-700", bg: "bg-teal-50" },
    { name: "Khối Nhân sự", color: "from-emerald-500 to-emerald-600", border: "border-emerald-200", text: "text-emerald-700", bg: "bg-emerald-50" },
    { name: "Khối CNTT", color: "from-cyan-500 to-cyan-600", border: "border-cyan-200", text: "text-cyan-700", bg: "bg-cyan-50" },
    { name: "Khối Tài chính", color: "from-amber-500 to-amber-600", border: "border-amber-200", text: "text-amber-700", bg: "bg-amber-50" },
  ];

  // Filter processes based on selected department filter
  const filteredProcesses = selectedDeptFilter === "Tất cả"
    ? kanbanProcesses
    : kanbanProcesses.filter(p => p.department === selectedDeptFilter);

  // Statistics calculations based on filtered processes
  const total = filteredProcesses.length;
  const active = filteredProcesses.filter(p => p.status === 'active').length;
  const draft = filteredProcesses.filter(p => p.status === 'draft').length;
  const pending = filteredProcesses.filter(p => p.status === 'pending').length;
  const expired = filteredProcesses.filter(p => p.status === 'expired').length;
  
  const totalCompletionRate = total > 0 
    ? Math.round(filteredProcesses.reduce((sum, p) => sum + p.completionRate, 0) / total) 
    : 0;

  // Zoom/Pan controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.15, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.5));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (mapType === 'kanban') return;
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mapType === 'kanban') return;
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Recharts structured comparison data
  const rechartsData = depts.map(d => {
    const deptProcesses = kanbanProcesses.filter(p => p.department === d.name);
    const avgComp = deptProcesses.length > 0
      ? Math.round(deptProcesses.reduce((s, p) => s + p.completionRate, 0) / deptProcesses.length)
      : 0;
    const activeCount = deptProcesses.filter(p => p.status === 'active').length;
    return {
      name: d.name.replace("Khối ", ""),
      fullName: d.name,
      'Tỷ lệ hoàn thành (%)': avgComp,
      'Quy trình': deptProcesses.length,
      'Đang hiệu lực': activeCount,
    };
  });

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('processId', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: ProcessStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('processId');
    setKanbanProcesses(prev => 
      prev.map(p => p.id === id ? { ...p, status } : p)
    );
  };

  return (
    <div className="space-y-6" id="dashboard-tab">
      
      {/* Department Filter Selector Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 hover:shadow-md" id="dashboard-filter-bar">
        <div className="space-y-1">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-4 bg-blue-600 rounded"></span>
            Tổng Quan Chỉ Số Vận Hành Doanh Nghiệp
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Theo dõi tiến độ chuẩn hóa quy trình và tuân thủ tiêu chuẩn chất lượng ISO 9001:2015
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">
              Lọc theo khối ban:
            </span>
            <select
              id="dept-filter-select"
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all min-w-[200px]"
            >
              <option value="Tất cả">-- Tất cả phòng ban ({processes.length} Quy trình) --</option>
              {depts.map((d, i) => (
                <option key={i} value={d.name}>
                  {d.name} ({processes.filter(p => p.department === d.name).length})
                </option>
              ))}
            </select>
          </div>
          {selectedDeptFilter !== "Tất cả" && (
            <button
              onClick={() => setSelectedDeptFilter("Tất cả")}
              className="text-[11px] text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900 transition-all cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4" id="dashboard-metrics">
        {/* Metric 1: Total */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between" id="metric-total">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tổng Quy Trình</p>
            <p className="text-3xl font-bold font-display text-slate-900 dark:text-white">{total}</p>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">Toàn bộ doanh nghiệp</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Active */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between" id="metric-active">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Đang Hiệu Lực</p>
            <p className="text-3xl font-bold font-display text-emerald-700 dark:text-emerald-400">{active}</p>
            <span className="text-[11px] text-emerald-500 font-medium">Đạt chuẩn ISO 9001</span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Draft */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between" id="metric-draft">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Đang Chỉnh Sửa</p>
            <p className="text-3xl font-bold font-display text-blue-700 dark:text-blue-400">{draft}</p>
            <span className="text-[11px] text-blue-500">Mới tạo & đang soạn</span>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <Edit className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Pending */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between" id="metric-pending">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Chờ Phê Duyệt</p>
            <p className="text-3xl font-bold font-display text-amber-700 dark:text-amber-400">{pending}</p>
            <span className="text-[11px] text-amber-500 font-medium">Quy trình cải tiến</span>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 5: Expired */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between" id="metric-expired">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Hết Hiệu Lực</p>
            <p className="text-3xl font-bold font-display text-slate-500 dark:text-slate-500">{expired}</p>
            <span className="text-[11px] text-slate-400">Đã lưu trữ / thay thế</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Progress & Quick Stats Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-progress-charts">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" /> Tiến độ chuẩn hóa quy trình
            </h3>
            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2 py-1 rounded font-bold">
              {totalCompletionRate}% Hoàn thành
            </span>
          </div>

          {/* Semi-circular radial gauge in pure custom SVG */}
          <div className="flex flex-col items-center justify-center py-4 relative">
            <svg className="w-48 h-28" viewBox="0 0 100 60">
              {/* Background Arc */}
              <path 
                d="M 10 50 A 40 40 0 0 1 90 50" 
                fill="none" 
                stroke="#E2E8F0" 
                strokeWidth="10" 
                strokeLinecap="round"
                className="dark:stroke-slate-800"
              />
              {/* Filled Arc */}
              <path 
                d="M 10 50 A 40 40 0 0 1 90 50" 
                fill="none" 
                stroke="url(#blue-gradient)" 
                strokeWidth="10" 
                strokeLinecap="round"
                strokeDasharray="125.6"
                strokeDashoffset={125.6 - (125.6 * totalCompletionRate) / 100}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="text-center -mt-6">
              <p className="text-4xl font-extrabold font-display text-slate-900 dark:text-white">{totalCompletionRate}%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Chỉ số hoàn thiện ISO</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between items-center">
              <span>Đã hoàn thành 100% tài liệu & SOP</span>
              <span className="font-bold text-emerald-600">{filteredProcesses.filter(p => p.completionRate === 100).length} quy trình</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${(filteredProcesses.filter(p => p.completionRate === 100).length / (total || 1)) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center pt-2">
              <span>Cần tối ưu và thiết kế lại</span>
              <span className="font-bold text-amber-500">{filteredProcesses.filter(p => p.completionRate < 100).length} quy trình</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${(filteredProcesses.filter(p => p.completionRate < 100).length / (total || 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Recharts Department Comparison Bar Chart & Detailed Info Cards */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2 space-y-4" id="dashboard-recharts-card">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-500" /> Biểu Đồ Trực Quan Tỷ Lệ Hoàn Thành Theo Phòng Ban / Khối
            </h3>
            <span className="text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">ISO 9001 INDEX</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
            {/* Recharts Bar Chart - Col-span 7 */}
            <div className="md:col-span-7 h-56 min-h-[220px]" id="recharts-bar-chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={rechartsData} margin={{ top: 10, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 600 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fill: '#94a3b8', fontSize: 9 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
                  <Bar dataKey="Tỷ lệ hoàn thành (%)" radius={[4, 4, 0, 0]} barSize={18}>
                    {rechartsData.map((entry, index) => {
                      let fill = '#3b82f6'; 
                      if (entry.fullName.includes("Chiến lược")) fill = '#6366f1';
                      else if (entry.fullName.includes("Kinh doanh")) fill = '#2563eb';
                      else if (entry.fullName.includes("Marketing")) fill = '#ec4899';
                      else if (entry.fullName.includes("Khách hàng")) fill = '#14b8a6';
                      else if (entry.fullName.includes("Nhân sự")) fill = '#10b981';
                      else if (entry.fullName.includes("CNTT")) fill = '#06b6d4';
                      else if (entry.fullName.includes("Tài chính")) fill = '#f59e0b';
                      return <Cell key={`cell-${index}`} fill={fill} />;
                    })}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>

            {/* Department Detailed List with Mini CSS Bars - Col-span 5 */}
            <div className="md:col-span-5 flex flex-col justify-between space-y-3" id="recharts-detailed-list">
              {depts.map((d, idx) => {
                const deptProcesses = processes.filter(p => p.department === d.name);
                const avgComp = deptProcesses.length > 0
                  ? Math.round(deptProcesses.reduce((s, p) => s + p.completionRate, 0) / deptProcesses.length)
                  : 0;

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate w-32" title={d.name}>
                        {d.name} <span className="text-[10px] text-slate-400">({deptProcesses.length})</span>
                      </span>
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded shrink-0 ${avgComp > 80 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : avgComp > 50 ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'}`}>
                        {avgComp}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`bg-gradient-to-r ${d.color} h-full rounded-full transition-all duration-1000`}
                        style={{ width: `${avgComp}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Organizational Process Map Container with ZOOM & PAN */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col" id="org-process-map">
        {/* Visual Map Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/60">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-blue-600" /> Sơ đồ Hệ Thống Quy Trình Doanh Nghiệp
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Click chọn bất kỳ quy trình nào để mở chi tiết workflow và SOP</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Map Types */}
            <div className="inline-flex rounded-lg p-0.5 bg-slate-200 dark:bg-slate-800 text-xs">
              <button 
                onClick={() => setMapType('value_chain')} 
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${mapType === 'value_chain' ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
              >
                Process Map
              </button>
              <button 
                onClick={() => setMapType('tree')} 
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${mapType === 'tree' ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
              >
                Tree View
              </button>
              <button 
                onClick={() => setMapType('mindmap')} 
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${mapType === 'mindmap' ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
              >
                Mindmap
              </button>
              <button 
                onClick={() => setMapType('org_map')} 
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${mapType === 'org_map' ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
              >
                Org Map
              </button>
              <button 
                onClick={() => setMapType('kanban')} 
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${mapType === 'kanban' ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
              >
                Kanban
              </button>
            </div>

            {/* Zoom / Pan Actions */}
            <div className="flex items-center gap-1 border-l border-slate-300 dark:border-slate-700 pl-2">
              <button 
                onClick={handleZoomIn} 
                className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                title="Phóng to"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button 
                onClick={handleZoomOut} 
                className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button 
                onClick={handleResetZoom} 
                className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                title="Khôi phục zoom"
              >
                Reset ({Math.round(zoom * 100)}%)
              </button>
            </div>
          </div>
        </div>

        {/* Map Stage Canvas */}
        <div 
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`h-[500px] relative overflow-hidden bg-slate-50 dark:bg-slate-950 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          id="process-map-canvas-container"
        >
          {/* Zoom & Pan Applied Wrapper */}
          <div 
            className="absolute transition-transform duration-75 ease-out origin-center"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* 1. PROCESS MAP / VALUE CHAIN VIEW */}
            {mapType === 'value_chain' && (
              <div className="flex flex-col gap-12 items-center p-8 w-max" id="view-value-chain">
                {/* Level 1: Company Strategic Node */}
                <div className="bg-indigo-600 dark:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold font-display shadow-lg border-2 border-indigo-400 flex flex-col items-center gap-1 z-10 w-80 text-center">
                  <span className="text-[10px] tracking-widest text-indigo-200 uppercase font-bold">LEVEL 1: CHIẾN LƯỢC DOANH NGHIỆP</span>
                  <p className="text-sm">HỆ THỐNG QUẢN TRỊ QUY TRÌNH ISO 9001</p>
                </div>

                {/* Grid for Level 2 (Departments/Divisions) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                  {/* Category 1: Khối Vận hành Kinh Doanh */}
                  <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 space-y-4 shadow-sm w-72">
                    <div className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                      VẬN HÀNH & KINH DOANH
                    </div>
                    <div className="space-y-2">
                      {filteredProcesses.filter(p => p.department === 'Khối Kinh doanh' || p.department === 'Khối Marketing').map(p => (
                        <div 
                          key={p.id}
                          onClick={() => onSelectProcess(p.id, 'workflow')}
                          className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transition-all hover:translate-x-1 group"
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold text-slate-400">{p.code}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${p.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}`}>
                              {p.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">{p.name}</p>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full mt-2 overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: `${p.completionRate}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category 2: Khối Chăm Sóc Khách Hàng */}
                  <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 space-y-4 shadow-sm w-72">
                    <div className="text-xs font-extrabold uppercase tracking-widest text-teal-600 dark:text-teal-400 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div>
                      DỊCH VỤ & KHÁCH HÀNG
                    </div>
                    <div className="space-y-2">
                      {filteredProcesses.filter(p => p.department === 'Khối Dịch vụ Khách hàng').map(p => (
                        <div 
                          key={p.id}
                          onClick={() => onSelectProcess(p.id, 'workflow')}
                          className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-teal-500 dark:hover:border-teal-400 cursor-pointer transition-all hover:translate-x-1 group"
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold text-slate-400">{p.code}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${p.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {p.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 group-hover:text-teal-600">{p.name}</p>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full mt-2 overflow-hidden">
                            <div className="bg-teal-500 h-full" style={{ width: `${p.completionRate}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category 3: Khối Hỗ Trợ - Nhân Sự */}
                  <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 space-y-4 shadow-sm w-72">
                    <div className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                      QUẢN TRỊ NHÂN SỰ
                    </div>
                    <div className="space-y-2">
                      {filteredProcesses.filter(p => p.department === 'Khối Nhân sự').map(p => (
                        <div 
                          key={p.id}
                          onClick={() => onSelectProcess(p.id, 'workflow')}
                          className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-emerald-500 dark:hover:border-emerald-400 cursor-pointer transition-all hover:translate-x-1 group"
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold text-slate-400">{p.code}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${p.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {p.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 group-hover:text-emerald-600">{p.name}</p>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full mt-2 overflow-hidden">
                            <div className="bg-emerald-500 h-full" style={{ width: `${p.completionRate}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category 4: Khối CNTT & Tài chính */}
                  <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-5 space-y-4 shadow-sm w-72">
                    <div className="text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                      TÀI CHÍNH & HỆ THỐNG
                    </div>
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center">
                      <p className="text-[11px] text-slate-500">Sẵn sàng tích hợp thêm các quy trình về Công nghệ & Kế toán theo chuẩn ISO</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. TREE VIEW */}
            {mapType === 'tree' && (
              <div className="flex flex-col gap-4 p-8 w-full max-w-3xl" id="view-tree">
                {/* Company root */}
                <div className="bg-slate-800 text-white p-3 rounded-lg font-bold text-center border-b border-slate-700 text-sm">
                  🏢 TỔNG CÔNG TY DOANH NGHIỆP THƯƠNG MẠI & DỊCH VỤ
                </div>
                {depts.map((d, dIdx) => {
                  const deptProcesses = filteredProcesses.filter(p => p.department === d.name);
                  return (
                    <div key={dIdx} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 pl-6 relative">
                      <div className="absolute top-4 left-2.5 bottom-0 border-l-2 border-slate-200 dark:border-slate-800"></div>
                      <h4 className="font-bold text-xs flex items-center gap-2 text-slate-900 dark:text-white">
                        <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${d.color}`}></span>
                        {d.name} <span className="text-[10px] text-slate-400">({deptProcesses.length} quy trình)</span>
                      </h4>
                      <div className="mt-3 pl-4 space-y-2">
                        {deptProcesses.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic">Chưa liên kết quy trình chi tiết</p>
                        ) : (
                          deptProcesses.map(p => (
                            <div 
                              key={p.id}
                              onClick={() => onSelectProcess(p.id, 'workflow')}
                              className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded border border-slate-100 dark:border-slate-800 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded font-bold">{p.code}</span>
                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400">{p.name}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-slate-400">{p.version}</span>
                                <span className="text-[11px] font-bold text-blue-600">{p.completionRate}%</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 3. MINDMAP VIEW */}
            {mapType === 'mindmap' && (
              <div className="relative p-8 w-max h-max flex items-center justify-center min-w-[900px]" id="view-mindmap">
                {/* Central Node */}
                <div className="absolute bg-blue-600 text-white font-bold p-5 rounded-full text-center shadow-xl border-4 border-white dark:border-slate-900 w-36 h-36 flex flex-col justify-center items-center z-10 font-display">
                  <span className="text-[10px] text-blue-200 uppercase font-bold">PROCESS MAP</span>
                  <p className="text-xs leading-tight">ISO 9001:2015</p>
                </div>

                {/* Satellite Nodes mapping from processes */}
                {filteredProcesses.map((p, idx) => {
                  const angle = (idx * 2 * Math.PI) / filteredProcesses.length;
                  const radius = 250; // distance from center
                  const x = Math.round(Math.cos(angle) * radius);
                  const y = Math.round(Math.sin(angle) * radius);

                  return (
                    <div 
                      key={p.id}
                      className="absolute z-10 transition-transform hover:scale-105"
                      style={{
                        transform: `translate(${x}px, ${y}px)`
                      }}
                    >
                      <div 
                        onClick={() => onSelectProcess(p.id, 'workflow')}
                        className="bg-white dark:bg-slate-800 border-2 border-blue-500 dark:border-slate-700 p-3 rounded-xl shadow-lg w-52 hover:border-indigo-500 cursor-pointer text-center"
                      >
                        <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 block mb-1">{p.code}</span>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight">{p.name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{p.department}</p>
                      </div>

                      {/* SVG line connector between center and satellite */}
                      <svg className="absolute overflow-visible pointer-events-none" style={{ top: '50%', left: '50%', width: 0, height: 0 }}>
                        <line 
                          x1={0} 
                          y1={0} 
                          x2={-x} 
                          y2={-y} 
                          stroke="#3b82f6" 
                          strokeWidth="2" 
                          strokeDasharray="4 4" 
                          className="opacity-40"
                        />
                      </svg>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 4. ORGANIZATIONAL PROCESS MAP */}
            {mapType === 'org_map' && (
              <div className="flex flex-col items-center gap-8 p-6 w-max" id="view-org-map">
                <div className="bg-slate-900 text-white p-4 rounded-xl shadow border-2 border-slate-700 text-center w-80 font-display">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">MANAGEMENT & QUALITY COMMITTEE</p>
                  <p className="text-sm font-bold">Ban Giám Đốc / Ban ISO</p>
                </div>

                <div className="flex gap-12">
                  <div className="flex flex-col gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow w-72">
                    <h5 className="font-bold text-xs text-blue-600">Đơn vị chủ quản</h5>
                    <p className="text-[11px] text-slate-500 text-center">Chịu trách nhiệm ban hành, rà soát, kiểm toán nội bộ.</p>
                    <div className="w-full space-y-1">
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded text-center text-xs font-semibold text-slate-700 dark:text-slate-300">Phòng Đảm Bảo Chất Lượng (QA)</div>
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded text-center text-xs font-semibold text-slate-700 dark:text-slate-300">Phòng Kiểm soát Nội bộ</div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow w-72">
                    <h5 className="font-bold text-xs text-indigo-600">Phòng Ban Nghiệp vụ</h5>
                    <p className="text-[11px] text-slate-500 text-center">Thực hiện trực tiếp các quy trình tác nghiệp liên thông.</p>
                    <div className="w-full space-y-1">
                      {filteredProcesses.map(p => (
                        <div 
                          key={p.id}
                          onClick={() => onSelectProcess(p.id, 'workflow')}
                          className="p-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded text-left text-xs text-slate-700 dark:text-slate-300 truncate cursor-pointer flex justify-between items-center"
                        >
                          <span className="truncate font-medium">{p.name}</span>
                          <span className="text-[9px] font-bold text-slate-400 ml-1 shrink-0">{p.code.split('-')[1] || "ISO"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. KANBAN BOARD VIEW */}
            {mapType === 'kanban' && (
              <div className="flex gap-6 p-6 min-w-max h-full items-start" id="view-kanban">
                {[
                  { id: 'draft', title: 'Đang Chỉnh Sửa', icon: Edit, color: 'blue' },
                  { id: 'pending', title: 'Chờ Phê Duyệt', icon: Clock, color: 'amber' },
                  { id: 'active', title: 'Đang Hiệu Lực', icon: CheckCircle, color: 'emerald' },
                  { id: 'expired', title: 'Hết Hiệu Lực', icon: AlertTriangle, color: 'slate' }
                ].map(column => {
                  const colProcesses = filteredProcesses.filter(p => p.status === column.id);
                  const Icon = column.icon;
                  
                  // Color mappings
                  const bgClass = {
                    blue: 'bg-blue-50 dark:bg-blue-900/20',
                    amber: 'bg-amber-50 dark:bg-amber-900/20',
                    emerald: 'bg-emerald-50 dark:bg-emerald-900/20',
                    slate: 'bg-slate-50 dark:bg-slate-900/20',
                  }[column.color as 'blue' | 'amber' | 'emerald' | 'slate'];
                  
                  const textClass = {
                    blue: 'text-blue-700 dark:text-blue-300',
                    amber: 'text-amber-700 dark:text-amber-300',
                    emerald: 'text-emerald-700 dark:text-emerald-300',
                    slate: 'text-slate-700 dark:text-slate-300',
                  }[column.color as 'blue' | 'amber' | 'emerald' | 'slate'];
                  
                  const iconClass = {
                    blue: 'text-blue-600 dark:text-blue-400',
                    amber: 'text-amber-600 dark:text-amber-400',
                    emerald: 'text-emerald-600 dark:text-emerald-400',
                    slate: 'text-slate-600 dark:text-slate-400',
                  }[column.color as 'blue' | 'amber' | 'emerald' | 'slate'];
                  
                  const badgeBgClass = {
                    blue: 'bg-blue-100 dark:bg-blue-800',
                    amber: 'bg-amber-100 dark:bg-amber-800',
                    emerald: 'bg-emerald-100 dark:bg-emerald-800',
                    slate: 'bg-slate-100 dark:bg-slate-800',
                  }[column.color as 'blue' | 'amber' | 'emerald' | 'slate'];
                  
                  const badgeTextClass = {
                    blue: 'text-blue-800 dark:text-blue-200',
                    amber: 'text-amber-800 dark:text-amber-200',
                    emerald: 'text-emerald-800 dark:text-emerald-200',
                    slate: 'text-slate-800 dark:text-slate-200',
                  }[column.color as 'blue' | 'amber' | 'emerald' | 'slate'];

                  return (
                    <div 
                      key={column.id}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, column.id as ProcessStatus)}
                      className={`flex flex-col w-72 h-full max-h-[420px] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden`}
                    >
                      <div className={`p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between ${bgClass}`}>
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${iconClass}`} />
                          <h4 className={`text-xs font-bold uppercase tracking-wider ${textClass}`}>{column.title}</h4>
                        </div>
                        <span className={`text-[10px] font-bold ${badgeBgClass} ${badgeTextClass} px-2 py-0.5 rounded-full`}>
                          {colProcesses.length}
                        </span>
                      </div>
                      <div className="p-3 overflow-y-auto flex-1 space-y-3 bg-slate-50/50 dark:bg-slate-950/50">
                        {colProcesses.map(p => (
                          <div
                            key={p.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, p.id)}
                            onClick={() => onSelectProcess(p.id, 'workflow')}
                            className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm cursor-grab hover:border-blue-400 hover:shadow-md transition-all group"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{p.code}</span>
                              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{p.completionRate}%</span>
                            </div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2 leading-snug group-hover:text-blue-600">{p.name}</p>
                            <div className="flex justify-between items-center text-[10px] text-slate-400">
                              <span className="truncate">{p.department}</span>
                              <span>v{p.version}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Canvas Floating Overlay Controls */}
          <div className="absolute bottom-4 right-4 bg-white/95 dark:bg-slate-900/95 p-2 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 flex items-center gap-4 text-xs font-medium z-20 backdrop-blur-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-slate-600 dark:text-slate-400">Hiệu lực (Active)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-slate-600 dark:text-slate-400">Đang soạn (Draft)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span className="text-slate-600 dark:text-slate-400">Chờ duyệt (Pending)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
