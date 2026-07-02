import React, { useState, useEffect } from "react";
import { Process, DynamicForm, ChangelogItem } from "./types";
import { INITIAL_PROCESSES, INITIAL_FORMS } from "./data";
import Dashboard from "./components/Dashboard";
import ProcessMap from "./components/ProcessMap";
import WorkflowBuilder from "./components/WorkflowBuilder";
import SOPManager from "./components/SOPManager";
import FormManager from "./components/FormManager";
import PublishDocument from "./components/PublishDocument";
import TrainingCenter from "./components/TrainingCenter";
import AIPortal from "./components/AIPortal";
import Analytics from "./components/Analytics";
import MyTasks from "./components/MyTasks";
import ProcessTracking from "./components/ProcessTracking";
import SystemSettings from "./components/SystemSettings";
import ProcessDashboard from "./components/ProcessDashboard";

import { 
  Box, Drawer, AppBar, Toolbar, List, ListItem, ListItemButton, 
  ListItemIcon, ListItemText, Typography, IconButton, InputBase, 
  Divider, Select, MenuItem, SelectChangeEvent, Badge
} from "@mui/material";
import { 
  LayoutDashboard, Network, GitBranch, BookOpen, FileSpreadsheet, 
  FileCheck2, GraduationCap, Bot, Clock, Shield, ChevronRight, Plus, Check,
  CheckCircle, AlertTriangle, Menu, ChevronLeft, Search, X, CheckSquare, Activity, Settings, BarChart2, Bell
} from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export default function App() {
  const [processes, setProcesses] = useState<Process[]>(INITIAL_PROCESSES);
  const [forms, setForms] = useState<DynamicForm[]>(INITIAL_FORMS);
  
  // Navigation tabs:
  // 'dashboard' | 'map' | 'workflow' | 'sop' | 'form' | 'publish' | 'training' | 'ai-search'
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Active process context for builder tabs
  const [selectedProcessId, setSelectedProcessId] = useState<string>(INITIAL_PROCESSES[0].id);

  // Simulation role: let users swap role to test permission flows
  const [currentUserRole, setCurrentUserRole] = useState<string>('Super Admin');

  // Sidebar states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("sidebar_collapsed");
      return saved ? JSON.parse(saved) : false;
    } catch (e) {
      return false;
    }
  });
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("CÔNG TY TNHH MTV SEN VÀNG VIỆT NAM");
  const [departments, setDepartments] = useState<string[]>(["Phòng Nhân Sự", "Phòng Kinh Doanh", "Phòng Kỹ Thuật"]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const nextVal = !prev;
      try {
        localStorage.setItem("sidebar_collapsed", JSON.stringify(nextVal));
      } catch (e) {}
      return nextVal;
    });
  };

  // Time clock display
  const [currentTime, setCurrentTime] = useState<string>("");

  // Toast State
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeProcess = processes.find(p => p.id === selectedProcessId) || processes[0];

  const handleSaveProcess = (updatedProc: Process) => {
    setProcesses(prev => prev.map(p => p.id === updatedProc.id ? updatedProc : p));
    showToast(`Đã lưu tài liệu & sơ đồ quy trình "${updatedProc.name}" chuẩn ISO thành công!`, 'success');
  };

  const handleCreateProcess = (newProc: Process) => {
    setProcesses(prev => [...prev, newProc]);
    setSelectedProcessId(newProc.id);
    showToast(`Đã khởi tạo quy trình mới "${newProc.name}" chuẩn hóa thành công!`, 'success');
  };

  const handleSaveForms = (updatedForms: DynamicForm[]) => {
    setForms(updatedForms);
    showToast("Đã lưu thiết lập biểu mẫu động thành công!", 'success');
  };

  const handleUpdateProcessStatus = (
    id: string, 
    newStatus: Process['status'], 
    reviewComments?: string, 
    updatedChangelog?: ChangelogItem[]
  ) => {
    setProcesses(prev => prev.map(p => {
      if (p.id === id) {
        const statusText = newStatus === 'active' ? 'Đang hiệu lực (Active)' 
          : newStatus === 'pending' ? 'Chờ phê duyệt (Pending)' 
          : newStatus === 'draft' ? 'Đang chỉnh sửa (Draft)' 
          : 'Hết hiệu lực (Expired)';
        showToast(`Đã chuyển trạng thái quy trình sang "${statusText}"!`, 'info');
        return {
          ...p,
          status: newStatus,
          ...(updatedChangelog ? { changelog: updatedChangelog } : {})
        };
      }
      return p;
    }));
  };

  // Switch process and navigate to that tab
  const handleSelectProcess = (id: string, tab: string) => {
    setSelectedProcessId(id);
    setActiveTab('process-dashboard');
  };

  const navigationGroups = [
    {
      title: 'Tổng Quan',
      items: [
        { id: 'dashboard', label: 'Bảng Điều Khiển', icon: LayoutDashboard, desc: 'Chỉ số & Tổng quan chất lượng' },
        { id: 'analytics', label: 'Báo Cáo Nâng Cao', icon: BarChart2, desc: 'Phân tích nút thắt & hiệu suất' },
        { id: 'map', label: 'Bản Đồ Quy Trình', icon: Network, desc: 'Sơ đồ liên kết 3 cấp độ phòng ban' },
      ]
    },
    {
      title: 'Thực Thi & Giám Sát',
      items: [
        { id: 'tasks', label: 'Công Việc Của Tôi', icon: CheckSquare, desc: 'Xử lý công việc & Giao việc' },
        { id: 'tracking', label: 'Theo Dõi Tiến Độ', icon: Activity, desc: 'Giám sát quy trình & SLA' },
      ]
    },
    {
      title: 'Quy Trình & Thiết Kế',
      items: [
        { id: 'process-dashboard', label: 'Quản Lý Quy Trình', icon: GitBranch, desc: 'Chi tiết, SOP, Biểu mẫu & Ban hành' },
      ]
    },
    {
      title: 'Quản Trị & Hệ Thống',
      items: [
        { id: 'training', label: 'Đào Tạo Nhân Sự', icon: GraduationCap, desc: 'Sát hạch & Chuyển giao quy trình' },
        { id: 'settings', label: 'Thiết Lập Hệ Thống', icon: Settings, desc: 'Vai trò, Phân quyền & Tích hợp' },
      ]
    },
    {
      title: 'Hỗ Trợ & Trợ Giúp',
      items: [
        { id: 'ai-search', label: 'Trợ Lý AI Search', icon: Bot, desc: 'Tra cứu quy trình thông minh' },
      ]
    }
  ];

  const filteredGroups = navigationGroups.map(group => {
    const matchingItems = group.items.filter(item => {
      const labelMatch = item.label.toLowerCase().includes(sidebarSearchQuery.toLowerCase());
      const descMatch = item.desc.toLowerCase().includes(sidebarSearchQuery.toLowerCase());
      return labelMatch || descMatch;
    });
    return {
      ...group,
      items: matchingItems
    };
  }).filter(group => group.items.length > 0);

  return (
    <>
      <Box sx={{ p: '15px', height: '100vh', bgcolor: 'background.default', boxSizing: 'border-box' }}>
        <Box sx={{ display: 'flex', height: '100%', bgcolor: 'background.paper', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}>
        
        {/* 1. SIDEBAR (Drawer) */}
        <Drawer
          variant="permanent"
          sx={{
            width: isSidebarCollapsed ? 80 : 260,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: isSidebarCollapsed ? 80 : 260,
              boxSizing: 'border-box',
              transition: 'width 0.3s',
              borderRight: '1px solid rgba(0, 0, 0, 0.12)',
              overflowX: 'hidden',
              position: 'relative',
              height: '100%',
              bgcolor: 'background.paper',
            },
          }}
        >
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2, justifyContent: 'space-between', minHeight: 64 }}>
          {!isSidebarCollapsed && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: 2, background: 'linear-gradient(45deg, #9155FD, #C6A7FE)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                PF
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.5px' }}>
                PROCESSFLOW
              </Typography>
            </Box>
          )}
          <IconButton onClick={toggleSidebar} sx={{ mx: isSidebarCollapsed ? 'auto' : 0 }}>
            {isSidebarCollapsed ? <Menu size={20} color="#9155FD" /> : <ChevronLeft size={20} />}
          </IconButton>
        </Box>
        <Divider />

        <Box sx={{ p: 2 }}>
          {isSidebarCollapsed ? (
            <IconButton onClick={toggleSidebar} sx={{ border: '1px dashed #e2e8f0', width: '100%' }}>
              <Search size={18} />
            </IconButton>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#f1f5f9', borderRadius: 2, px: 1.5, py: 0.5 }}>
              <Search size={16} color="#94a3b8" />
              <InputBase 
                placeholder="Tìm phân hệ..." 
                value={sidebarSearchQuery}
                onChange={(e) => setSidebarSearchQuery(e.target.value)}
                sx={{ ml: 1, flex: 1, fontSize: '0.85rem' }} 
              />
              {sidebarSearchQuery && (
                <IconButton size="small" onClick={() => setSidebarSearchQuery("")}>
                  <X size={14} />
                </IconButton>
              )}
            </Box>
          )}
        </Box>

        <List sx={{ px: 1.5, flex: 1, overflowY: 'auto' }}>
          {filteredGroups.map((group, groupIdx) => (
            <Box key={groupIdx} sx={{ mb: 1.5 }}>
              {!isSidebarCollapsed && (
                <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                  {group.title}
                </Typography>
              )}
              {isSidebarCollapsed && groupIdx > 0 && <Divider sx={{ my: 1 }} />}
              
              {group.items.map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                
                return (
                  <ListItem disablePadding key={item.id} sx={{ mb: 0.5 }}>
                    <ListItemButton 
                      onClick={() => setActiveTab(item.id)}
                      sx={{ 
                        borderRadius: 2, 
                        justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                        bgcolor: isSelected ? 'rgba(145, 85, 253, 0.08)' : 'transparent',
                        color: isSelected ? 'primary.main' : 'text.primary',
                        '&:hover': {
                          bgcolor: isSelected ? 'rgba(145, 85, 253, 0.12)' : 'action.hover',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 0, mr: isSidebarCollapsed ? 0 : 2, color: 'inherit' }}>
                        <Icon size={20} />
                      </ListItemIcon>
                      {!isSidebarCollapsed && (
                        <ListItemText 
                          primary={
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: isSelected ? 600 : 500 }}>
                              {item.label}
                            </Typography>
                          }
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </Box>
          ))}
        </List>
      </Drawer>

      {/* 2. MAIN CONTENT AREA */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        
          {/* HEADER
        <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)', bgcolor: 'background.paper' }}>
          <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px !important' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>
                Chi nhánh Hà Nội <ChevronRight size={14} style={{ verticalAlign: 'middle', margin: '0 4px' }} /> 
                <span style={{ color: '#000' }}>
                  {navigationGroups.flatMap(g => g.items).find(i => i.id === activeTab)?.label || 'Bảng Điều Khiển'}
                </span>
              </Typography>
              
              {['workflow', 'sop', 'publish'].includes(activeTab) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>ĐANG SỬA:</Typography>
                  <Select
                    size="small"
                    value={selectedProcessId}
                    onChange={(e: SelectChangeEvent) => setSelectedProcessId(e.target.value)}
                    sx={{ fontSize: '0.8rem', height: 30, '.MuiOutlinedInput-notchedOutline': { border: 'none' }, bgcolor: 'action.hover' }}
                  >
                    {processes.map(p => (
                      <MenuItem key={p.id} value={p.id} sx={{ fontSize: '0.8rem' }}>{p.code} - {p.name}</MenuItem>
                    ))}
                  </Select>
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton sx={{ color: 'text.secondary', bgcolor: 'action.hover', borderRadius: 2 }}>
                <Badge badgeContent={processes.filter(p => p.status === 'pending' || p.status === 'expired').length} color="error" max={99}>
                  <Bell size={20} />
                </Badge>
              </IconButton>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'action.hover', px: 1.5, py: 0.5, borderRadius: 2 }}>
                <Shield size={16} color="#9155FD" />
                <Select
                  variant="standard"
                  disableUnderline
                  value={currentUserRole}
                  onChange={(e: SelectChangeEvent) => setCurrentUserRole(e.target.value)}
                  sx={{ fontSize: '0.8rem', fontWeight: 600 }}
                >
                  <MenuItem value="Super Admin">Super Admin</MenuItem>
                  <MenuItem value="Process Manager">Process Manager</MenuItem>
                  <MenuItem value="Editor">Editor</MenuItem>
                  <MenuItem value="Reviewer">Reviewer</MenuItem>
                  <MenuItem value="Approver">Approver</MenuItem>
                  <MenuItem value="Viewer">Viewer</MenuItem>
                </Select>
              </Box>
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <Clock size={16} />
                <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>UTC: {currentTime || "00:00:00"}</Typography>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>
        */}

          {/* MAIN VIEWPORT COMPONENT RENDER */}
          <main className="flex-1 p-6 w-full max-w-[1600px] mx-auto flex flex-col overflow-y-auto" id="tab-viewport">
          {activeTab === 'dashboard' && (
            <Dashboard 
              processes={processes} 
              onSelectProcess={handleSelectProcess} 
            />
          )}

          {activeTab === 'analytics' && <Analytics />}

          {activeTab === 'map' && (
            <ProcessMap 
              processes={processes} 
              onSelectProcess={handleSelectProcess} 
              onCreateProcess={handleCreateProcess}
            />
          )}

          {activeTab === 'tasks' && <MyTasks />}

          {activeTab === 'tracking' && <ProcessTracking />}

          {activeTab === 'process-dashboard' && (
            <ProcessDashboard 
              processes={processes}
              process={activeProcess} 
              forms={forms}
              onSaveProcess={handleSaveProcess}
              onUpdateProcessStatus={handleUpdateProcessStatus}
              onSaveForms={handleSaveForms}
              currentUserRole={currentUserRole}
              companyName={companyName}
            />
          )}

          {activeTab === 'training' && (
            <TrainingCenter 
              processes={processes} 
              currentUserRole={currentUserRole}
            />
          )}

          {activeTab === 'settings' && (
            <SystemSettings 
              companyName={companyName}
              setCompanyName={setCompanyName}
              departments={departments}
              setDepartments={setDepartments}
            />
          )}

          {activeTab === 'ai-search' && (
            <AIPortal 
              processes={processes} 
            />
          )}
          </main>

          {/* FOOTER */}
          <footer className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 py-3 px-6 text-center text-[10px] text-slate-400" id="main-footer">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 font-semibold">
              <p>© 2026 ProcessFlow Enterprise. Tất cả quyền được bảo lưu.</p>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-slate-500">
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Đạt Chuẩn ISO 9001:2015
                </span>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <span>V3.2.0</span>
              </div>
            </div>
          </footer>
        </Box>
      </Box>
    </Box>

      {/* Toast Notification System */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none" id="toast-container">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg border flex items-start gap-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm animate-toast-slide-in transition-all duration-300 ${
              toast.type === 'success' ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/10' :
              toast.type === 'warning' ? 'border-amber-200 dark:border-amber-800 bg-amber-50/10' :
              toast.type === 'error' ? 'border-rose-200 dark:border-rose-800 bg-rose-50/10' :
              'border-blue-200 dark:border-blue-800 bg-blue-50/10'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Clock className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs">
              <p className="font-bold text-slate-900 dark:text-white">
                {toast.type === 'success' ? 'Thành công' :
                 toast.type === 'warning' ? 'Cảnh báo' :
                 toast.type === 'error' ? 'Lỗi hệ thống' :
                 'Thông báo'}
              </p>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed font-semibold">{toast.message}</p>
            </div>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 transform rotate-45" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
