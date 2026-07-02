import React, { useState } from "react";
import { Process, ProcessStatus } from "../types";
import { 
  Building2, ArrowRight, ShieldCheck, Star, Zap, HelpCircle, 
  ChevronRight, ArrowUpRight, Plus, ExternalLink, RefreshCw
} from "lucide-react";

interface ProcessMapProps {
  processes: Process[];
  onSelectProcess: (id: string, tab: 'workflow' | 'sop' | 'publish') => void;
  onCreateProcess: (newProc: Process) => void;
}

export default function ProcessMap({ processes, onSelectProcess, onCreateProcess }: ProcessMapProps) {
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const departments = [
    { name: "Khối Kinh doanh", icon: "💼", color: "border-blue-200 hover:border-blue-400 bg-blue-50/20 text-blue-800" },
    { name: "Khối Marketing", icon: "📢", color: "border-pink-200 hover:border-pink-400 bg-pink-50/20 text-pink-800" },
    { name: "Khối Dịch vụ Khách hàng", icon: "🎧", color: "border-teal-200 hover:border-teal-400 bg-teal-50/20 text-teal-800" },
    { name: "Khối Nhân sự", icon: "👥", color: "border-emerald-200 hover:border-emerald-400 bg-emerald-50/20 text-emerald-800" },
    { name: "Khối CNTT", icon: "💻", color: "border-cyan-200 hover:border-cyan-400 bg-cyan-50/20 text-cyan-800" },
    { name: "Khối Tài chính", icon: "💰", color: "border-amber-200 hover:border-amber-400 bg-amber-50/20 text-amber-800" }
  ];

  // Filtering logic
  const filteredProcesses = processes.filter(p => {
    const matchesDept = selectedDept === 'all' || p.department === selectedDept;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const handleAddNewProcess = (deptName: string) => {
    const codeSuffix = Math.floor(Math.random() * 900) + 100;
    const newProc: Process = {
      id: `proc-new-${Date.now()}`,
      name: `Quy trình Mới Phòng ${deptName.replace("Khối ", "")}`,
      code: `QT-${deptName.includes("Kinh doanh") ? "KD" : deptName.includes("Dịch vụ") ? "CSKH" : deptName.includes("Nhân sự") ? "NS" : "QT"}-${codeSuffix}`,
      department: deptName,
      level: 3,
      status: "draft",
      description: `Mô tả chi tiết quy trình nghiệp vụ mới áp dụng cho ${deptName} theo quy chuẩn ISO 9001.`,
      completionRate: 20,
      version: "V1.0",
      publishDate: new Date().toISOString().split('T')[0],
      creator: "Người dùng hiện tại",
      reviewer: "Trưởng phòng nghiệp vụ",
      approver: "Giám đốc vận hành",
      changelog: [
        { version: "V1.0", date: new Date().toISOString().split('T')[0], author: "Người dùng hiện tại", description: "Tạo nháp sơ đồ khung quy trình." }
      ],
      nodes: [
        {
          id: "n-start",
          type: "start",
          label: "Bắt đầu quy trình",
          code: "STEP-01",
          assigneeRole: "Nhân viên nghiệp vụ",
          assigneeDept: deptName,
          assigneePerson: "Chưa phân công",
          sla: 1,
          description: "Nhận yêu cầu hoặc sự kiện kích hoạt đầu tiên.",
          objective: "Ghi nhận đầy đủ thông tin sự việc.",
          startCondition: "Kích hoạt nghiệp vụ.",
          endCondition: "Hoàn tất ghi nhận thông tin.",
          checklist: ["Điền thông tin ban đầu"],
          sop: {
            purpose: "Tiếp nhận đầu vào.",
            scope: "Áp dụng nội bộ bộ phận.",
            definitions: "N/A",
            responsibility: "Nhân viên thực hiện.",
            steps: ["Bước 1: Nhận yêu cầu.", "Bước 2: Ghi thông tin."],
            forms: [],
            kpi: "Không lỗi đầu vào",
            sla: "Xử lý trong vòng 1 giờ",
            risks: "Thông tin sai lệch",
            controls: "Kiểm tra chéo",
            version: "V1.0"
          },
          formId: null,
          x: 150,
          y: 200
        },
        {
          id: "n-end",
          type: "end",
          label: "Kết thúc",
          code: "STEP-02",
          assigneeRole: "Hệ thống",
          assigneeDept: "Hệ thống",
          assigneePerson: "Hệ thống",
          sla: 0,
          description: "Lưu trữ thông tin và kết thúc.",
          objective: "Lưu trữ hồ sơ.",
          startCondition: "Mọi tác vụ hoàn thành.",
          endCondition: "Lưu trữ thành công.",
          checklist: [],
          sop: {
            purpose: "Kết thúc nghiệp vụ.",
            scope: "Nội bộ.",
            definitions: "N/A",
            responsibility: "Hệ thống.",
            steps: ["Bước 1: Lưu trữ dữ liệu."],
            forms: [],
            kpi: "Lưu trữ chính xác",
            sla: "Tức thời",
            risks: "Mất dữ liệu",
            controls: "Sao lưu",
            version: "V1.0"
          },
          formId: null,
          x: 550,
          y: 200
        }
      ],
      edges: [
        { id: "e-start-end", source: "n-start", target: "n-end" }
      ]
    };
    onCreateProcess(newProc);
    onSelectProcess(newProc.id, 'workflow');
  };

  return (
    <div className="space-y-6" id="process-map-tab">
      {/* LEVEL 1: STRATEGIC OVERVIEW */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 relative overflow-hidden" id="level-1-block">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded uppercase tracking-widest">ISO 9001:2015 Quy Chuẩn</span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs text-slate-300">Level 1: Chiến Lược Toàn Cục</span>
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-display">KHỐI HOẠCH ĐỊNH & KIỂM SOÁT CHIẾN LƯỢC</h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Toàn bộ hoạt động của doanh nghiệp được vận hành và kiểm soát thông qua bản đồ liên kết 3 cấp độ (Level 1: Ban lãnh đạo định hướng, Level 2: Khối phòng ban phối hợp, Level 3: Quy trình thao tác chuẩn SOP chi tiết).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs border-t border-slate-800 text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Định hướng Khách hàng trọng tâm</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span>Kiểm soát chất lượng chuẩn ISO 9001</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <span>Cải tiến liên tục PDCA (Plan-Do-Check-Act)</span>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4" id="process-map-filters">
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 text-slate-400 w-full md:w-80 border border-slate-200 dark:border-slate-700">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input 
            type="text" 
            placeholder="Tìm theo tên, mã quy trình..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none text-xs outline-none text-slate-700 dark:text-slate-300 w-full focus:ring-0"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button 
            onClick={() => setSelectedDept('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${selectedDept === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'}`}
          >
            Tất cả phòng ban
          </button>
          {departments.map((d, idx) => (
            <button 
              key={idx}
              onClick={() => setSelectedDept(d.name)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${selectedDept === d.name ? 'bg-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'}`}
            >
              {d.icon} {d.name.replace("Khối ", "")}
            </button>
          ))}
        </div>
      </div>

      {/* LEVEL 2 & 3: DEPARTMENT BENTO CARDS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6" id="level-2-grid">
        {departments.map((d, dIdx) => {
          const deptProcesses = filteredProcesses.filter(p => p.department === d.name);
          const rawDeptCount = processes.filter(p => p.department === d.name).length;

          // If filtering on a specific department and this is not it, hide it in search mode, otherwise keep card visible
          if (selectedDept !== 'all' && selectedDept !== d.name) return null;

          return (
            <div 
              key={dIdx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden"
              id={`dept-card-${dIdx}`}
            >
              {/* Card Header: Level 2 Department Title */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-lg shadow-sm">
                    {d.icon}
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">Level 2: Phòng Ban Chức Năng</span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{d.name}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 font-bold px-2.5 py-1 rounded-full text-slate-600 dark:text-slate-400">
                    {rawDeptCount} quy trình
                  </span>
                  <button 
                    onClick={() => handleAddNewProcess(d.name)}
                    className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors dark:bg-blue-950 dark:text-blue-400"
                    title="Thêm quy trình mới vào khối này"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Body: Level 3 Detailed Processes */}
              <div className="p-5 flex-1 space-y-3">
                {deptProcesses.length === 0 ? (
                  <div className="h-28 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-400 italic">Chưa có quy trình chi tiết cho khối này hoặc không khớp bộ lọc tìm kiếm.</p>
                    <button 
                      onClick={() => handleAddNewProcess(d.name)}
                      className="mt-2 text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tạo quy trình ngay
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {deptProcesses.map(p => (
                      <div 
                        key={p.id}
                        className="p-3 border border-slate-150 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 rounded-xl hover:border-blue-400 dark:hover:border-blue-700 transition-all flex flex-col justify-between group"
                      >
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold">
                              {p.code}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${p.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : p.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-blue-100 text-blue-800'}`}>
                              {p.status}
                            </span>
                          </div>

                          <h4 
                            onClick={() => onSelectProcess(p.id, 'workflow')}
                            className="font-bold text-[13px] text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 cursor-pointer line-clamp-2 leading-snug min-h-[38px]"
                          >
                            {p.name}
                          </h4>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed min-h-[32px]">
                            {p.description || "Chưa có mô tả chi tiết cho quy trình này."}
                          </p>
                        </div>

                        {/* Completion and Action block */}
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-700 dark:text-slate-300">{p.completionRate}%</span>
                            <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-full" style={{ width: `${p.completionRate}%` }} />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => onSelectProcess(p.id, 'workflow')}
                              className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 transition-colors"
                              title="Mở sơ đồ thiết kế workflow"
                            >
                              Sơ đồ <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-slate-300">|</span>
                            <button 
                              onClick={() => onSelectProcess(p.id, 'sop')}
                              className="text-indigo-600 hover:text-indigo-800 font-bold transition-colors"
                              title="Xem chi tiết tài liệu SOP chuẩn ISO"
                            >
                              SOP
                            </button>
                            <span className="text-slate-300">|</span>
                            <button 
                              onClick={() => onSelectProcess(p.id, 'publish')}
                              className="text-slate-600 hover:text-slate-900 font-bold dark:text-slate-400 dark:hover:text-white"
                              title="Ban hành tài liệu ISO 9001"
                            >
                              Ban hành
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
