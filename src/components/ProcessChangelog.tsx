import React, { useState, useEffect } from 'react';
import { Process, ChangelogItem, ProcessSnapshot, WorkflowNode, WorkflowEdge } from '../types';
import { 
  Plus, Trash2, Save, Camera, Eye, RotateCcw, Calendar, 
  User, Layers, CheckCircle2, Info, ArrowLeft, Play, 
  Clock, AlertTriangle, FileText, ChevronRight, Check, History, X 
} from 'lucide-react';

interface ProcessChangelogProps {
  process: Process;
  onSaveProcess: (p: Process) => void;
  currentUserRole: string;
}

export default function ProcessChangelog({ process, onSaveProcess, currentUserRole }: ProcessChangelogProps) {
  const [activeSubTab, setActiveSubTab] = useState<'changelog' | 'history'>('changelog');
  const [changelog, setChangelog] = useState<ChangelogItem[]>(process.changelog || []);
  const [snapshots, setSnapshots] = useState<ProcessSnapshot[]>([]);
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSnapVersion, setNewSnapVersion] = useState("");
  const [newSnapDesc, setNewSnapDesc] = useState("");
  
  const [previewSnapshot, setPreviewSnapshot] = useState<ProcessSnapshot | null>(null);
  
  const [restoreConfirmSnapshot, setRestoreConfirmSnapshot] = useState<ProcessSnapshot | null>(null);
  
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const isEditable = currentUserRole !== "Viewer";

  // Load changelog and snapshots when process changes
  useEffect(() => {
    setChangelog(process.changelog || []);
    
    // Set snapshots for the new process or generate default snapshots for realistic testing
    if (process.snapshots && process.snapshots.length > 0) {
      setSnapshots(process.snapshots);
    } else {
      const currentNodes = process.nodes || [];
      const currentEdges = process.edges || [];
      
      const initialSnapshots: ProcessSnapshot[] = [
        {
          id: `snap-1-${process.id}`,
          timestamp: "01/06/2026 09:30",
          description: "[v0.9] Dự thảo sơ bộ - Thiết lập khung sườn quy trình và phân vai trò ban đầu",
          nodes: currentNodes.slice(0, Math.max(3, Math.floor(currentNodes.length / 2))),
          edges: currentEdges.filter(edge => {
            const slicedIds = currentNodes.slice(0, Math.max(3, Math.floor(currentNodes.length / 2))).map(n => n.id);
            return slicedIds.includes(edge.source) && slicedIds.includes(edge.target);
          })
        },
        {
          id: `snap-2-${process.id}`,
          timestamp: "15/06/2026 14:45",
          description: "[v1.0] Bản ban hành chính thức chuẩn ISO - Được CEO phê duyệt chính thức áp dụng",
          nodes: JSON.parse(JSON.stringify(currentNodes)),
          edges: JSON.parse(JSON.stringify(currentEdges))
        }
      ];
      setSnapshots(initialSnapshots);
    }
  }, [process.id, process.changelog, process.snapshots, process.nodes, process.edges]);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Changelog handlers
  const handleAddLog = () => {
    setChangelog([
      ...changelog,
      { version: '1.0', date: new Date().toLocaleDateString('vi-VN'), author: process.creator || 'Process Owner', description: '' }
    ]);
  };

  const handleUpdateLog = (index: number, field: keyof ChangelogItem, value: string) => {
    const newLogs = [...changelog];
    newLogs[index] = { ...newLogs[index], [field]: value };
    setChangelog(newLogs);
  };

  const handleRemoveLog = (index: number) => {
    setChangelog(changelog.filter((_, i) => i !== index));
  };

  const handleSaveChangelog = () => {
    onSaveProcess({
      ...process,
      changelog,
    });
    triggerToast("Đã lưu nhật ký thay đổi quy trình thành công!");
  };

  // Snapshot handlers
  const handleOpenCreateSnapshot = () => {
    // Propose next version based on current
    const currentVer = process.version || "1.0";
    const parts = currentVer.split('.');
    if (parts.length === 2 && !isNaN(Number(parts[1]))) {
      setNewSnapVersion(`${parts[0]}.${Number(parts[1]) + 1}`);
    } else {
      setNewSnapVersion("1.1");
    }
    setNewSnapDesc("");
    setIsCreateModalOpen(true);
  };

  const handleCreateSnapshotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSnapVersion.trim() || !newSnapDesc.trim()) return;

    const currentNodes = process.nodes || [];
    const currentEdges = process.edges || [];

    const newSnap: ProcessSnapshot = {
      id: `snap-${Date.now()}`,
      timestamp: new Date().toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      description: `[v${newSnapVersion}] ${newSnapDesc}`,
      nodes: JSON.parse(JSON.stringify(currentNodes)),
      edges: JSON.parse(JSON.stringify(currentEdges)),
    };

    const updatedSnapshots = [newSnap, ...snapshots];
    setSnapshots(updatedSnapshots);

    // Auto append to manual changelog for consistency and compliance!
    const newLogItem: ChangelogItem = {
      version: newSnapVersion,
      date: new Date().toLocaleDateString('vi-VN'),
      author: currentUserRole || 'Process Admin',
      description: newSnapDesc
    };
    const updatedChangelog = [newLogItem, ...changelog];
    setChangelog(updatedChangelog);

    // Save to parent state
    onSaveProcess({
      ...process,
      version: newSnapVersion,
      snapshots: updatedSnapshots,
      changelog: updatedChangelog
    });

    setIsCreateModalOpen(false);
    triggerToast(`Đã chụp phiên bản ${newSnapVersion} thành công và đồng bộ nhật ký thay đổi!`);
  };

  const handleConfirmRestore = () => {
    if (!restoreConfirmSnapshot) return;

    const currentNodes = process.nodes || [];
    const currentEdges = process.edges || [];

    // Create a safety auto-backup of current active state first!
    const autoBackupSnap: ProcessSnapshot = {
      id: `snap-backup-${Date.now()}`,
      timestamp: new Date().toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      description: `[Tự động Sao lưu] Bản lưu trước khi khôi phục quy trình về bản chụp [${restoreConfirmSnapshot.description.split(']')[0]?.replace('[', '') || 'Past Version'}]`,
      nodes: JSON.parse(JSON.stringify(currentNodes)),
      edges: JSON.parse(JSON.stringify(currentEdges)),
    };

    const restoredNodes = JSON.parse(JSON.stringify(restoreConfirmSnapshot.nodes));
    const restoredEdges = JSON.parse(JSON.stringify(restoreConfirmSnapshot.edges));
    
    // Extract version number if matches e.g. "[v1.0] "
    let extractedVersion = process.version;
    const match = restoreConfirmSnapshot.description.match(/\[v([\d\.]+)\]/);
    if (match && match[1]) {
      extractedVersion = match[1];
    }

    const updatedSnapshots = [autoBackupSnap, ...snapshots];
    setSnapshots(updatedSnapshots);

    onSaveProcess({
      ...process,
      version: extractedVersion,
      nodes: restoredNodes,
      edges: restoredEdges,
      snapshots: updatedSnapshots
    });

    setRestoreConfirmSnapshot(null);
    triggerToast(`Đã khôi phục quy trình về phiên bản thành công! Tạo bản lưu dự phòng tự động.`);
  };

  const handleDeleteSnapshot = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = snapshots.filter(s => s.id !== id);
    setSnapshots(updated);
    
    onSaveProcess({
      ...process,
      snapshots: updated
    });
    triggerToast("Đã xóa bản chụp lịch sử.");
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-6xl mx-auto" id="process-changelog-root">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-500 font-medium text-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-500" />
            VIII. Quản lý Phiên Bản & Lịch Sử Sửa Đổi
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Lịch sử kiểm soát tài liệu chất lượng ISO 9001:2015, quản lý bản chụp lưu trữ và rollback thiết kế sơ đồ quy trình.
          </p>
        </div>

        {/* Sub-tab segmented control */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit self-start md:self-center">
          <button
            onClick={() => setActiveSubTab('changelog')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'changelog'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>Nhật ký ISO</span>
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'history'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <History className="w-4 h-4 shrink-0" />
            <span>Lịch sử & Khôi phục</span>
          </button>
        </div>
      </div>

      {/* 1. ISO CHANGELOG TAB */}
      {activeSubTab === 'changelog' && (
        <div className="space-y-4 animate-in fade-in duration-250">
          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-start gap-2.5 max-w-lg">
              <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Bảng nhật ký sửa đổi dùng để lưu trữ thông tin văn bản lịch sử phục vụ việc kiểm toán nội bộ và đánh giá cấp chứng nhận ISO. Hãy lưu lại mỗi khi ban hành phiên bản hiệu lực mới.
              </p>
            </div>
            {isEditable && (
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={handleAddLog}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Thêm dòng
                </button>
                <button
                  onClick={handleSaveChangelog}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Lưu nhật ký
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 font-bold">
                  <th className="p-3 text-center w-24 border-r border-slate-200 dark:border-slate-800">Phiên bản</th>
                  <th className="p-3 text-center w-36 border-r border-slate-200 dark:border-slate-800">Ngày hiệu lực</th>
                  <th className="p-3 text-left border-r border-slate-200 dark:border-slate-800">Nội dung thay đổi</th>
                  <th className="p-3 text-center w-48 border-r border-slate-200 dark:border-slate-800">Người thực hiện</th>
                  {isEditable && <th className="p-3 w-16 text-center">Xóa</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {changelog.map((log, index) => (
                  <tr key={index} className="bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-850/20">
                    <td className="p-2 border-r border-slate-200 dark:border-slate-800">
                      <input
                        type="text"
                        value={log.version}
                        onChange={(e) => handleUpdateLog(index, 'version', e.target.value)}
                        disabled={!isEditable}
                        className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50 dark:bg-slate-950/20 dark:text-white text-xs font-bold"
                      />
                    </td>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-800">
                      <input
                        type="text"
                        value={log.date}
                        onChange={(e) => handleUpdateLog(index, 'date', e.target.value)}
                        disabled={!isEditable}
                        className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50 dark:bg-slate-950/20 dark:text-white text-xs"
                        placeholder="dd/mm/yyyy"
                      />
                    </td>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-800">
                      <textarea
                        value={log.description}
                        onChange={(e) => handleUpdateLog(index, 'description', e.target.value)}
                        disabled={!isEditable}
                        rows={2}
                        className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50 dark:bg-slate-950/20 dark:text-white text-xs leading-relaxed"
                        placeholder="Mô tả nội dung cập nhật, ví dụ: 'Ban hành lần đầu' hoặc 'Sửa đổi bước 3 giảm SLA'..."
                      />
                    </td>
                    <td className="p-2 border-r border-slate-200 dark:border-slate-800">
                      <input
                        type="text"
                        value={log.author}
                        onChange={(e) => handleUpdateLog(index, 'author', e.target.value)}
                        disabled={!isEditable}
                        className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50 dark:bg-slate-950/20 dark:text-white text-xs"
                        placeholder="Phòng ban / Vai trò"
                      />
                    </td>
                    {isEditable && (
                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleRemoveLog(index)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                          title="Xóa dòng này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {changelog.length === 0 && (
                  <tr>
                    <td colSpan={isEditable ? 5 : 4} className="p-8 text-center text-slate-400 dark:text-slate-500">
                      Chưa có lịch sử nhật ký sửa đổi nào được ghi lại.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. SYSTEM SNAPSHOTS TAB */}
      {activeSubTab === 'history' && (
        <div className="space-y-6 animate-in fade-in duration-250" id="system-snapshots-panel">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-indigo-50/40 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30 gap-3">
            <div className="flex items-start gap-2.5 max-w-xl">
              <Clock className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200">Bản Chụp Lịch Sử & Tính Năng Phục Hồi Quy Trình</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Hệ thống ghi lại cấu trúc sơ đồ đầy đủ (gồm tất cả các nodes, liên kết, phân quyền, SLA và checklists). Bạn có thể <strong>xem lại cấu trúc chi tiết</strong> của từng bản chụp cũ và <strong>khôi phục lại</strong> thiết kế đó bất cứ lúc nào một cách an toàn.
                </p>
              </div>
            </div>
            {isEditable && (
              <button
                onClick={handleOpenCreateSnapshot}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all shrink-0 cursor-pointer hover:scale-[1.02]"
              >
                <Camera className="w-4 h-4" /> Chụp Bản Hiện Tại
              </button>
            )}
          </div>

          {/* Snapshots list */}
          <div className="grid grid-cols-1 gap-4" id="snapshots-list">
            {snapshots.map((snap) => {
              const isActive = process.version === snap.description.match(/\[v([\d\.]+)\]/)?.[1];
              const isAutoBackup = snap.description.includes("[Tự động Sao lưu]");
              
              return (
                <div 
                  key={snap.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isActive 
                      ? 'border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/10 shadow-sm shadow-indigo-500/10' 
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-850/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-lg shrink-0 ${
                      isActive 
                        ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'
                        : isAutoBackup
                          ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      <Layers className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                          {snap.description}
                        </span>
                        {isActive && (
                          <span className="px-2 py-0.5 text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 font-extrabold rounded-full flex items-center gap-1 border border-indigo-200 dark:border-indigo-800 animate-pulse">
                            <Check className="w-3 h-3" /> Đang áp dụng
                          </span>
                        )}
                        {isAutoBackup && (
                          <span className="px-2 py-0.5 text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-extrabold rounded-full border border-amber-200 dark:border-amber-900">
                            Hệ thống tự sao lưu
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 dark:text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Thời gian: {snap.timestamp}
                        </span>
                        <span>•</span>
                        <span className="font-medium">
                          Cấu trúc: <strong>{snap.nodes?.length || 0} bước</strong> • <strong>{snap.edges?.length || 0} liên kết</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => setPreviewSnapshot(snap)}
                      className="flex items-center gap-1.5 px-3 py-2 text-slate-700 hover:text-slate-900 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      title="Xem trước cấu trúc các bước của bản chụp này"
                    >
                      <Eye className="w-3.5 h-3.5" /> Xem trước
                    </button>
                    {isEditable && !isActive && (
                      <button
                        onClick={() => setRestoreConfirmSnapshot(snap)}
                        className="flex items-center gap-1.5 px-3 py-2 text-white bg-emerald-600 hover:bg-emerald-700 text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                        title="Khôi phục quy trình hiện tại về trạng thái bản chụp này"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Khôi phục
                      </button>
                    )}
                    {isEditable && !isActive && (
                      <button
                        onClick={(e) => handleDeleteSnapshot(snap.id, e)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                        title="Xóa bản chụp này khỏi lịch sử"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {snapshots.length === 0 && (
              <div className="p-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-transparent">
                <History className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-semibold">Chưa có bản chụp lịch sử nào cho quy trình này</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Vui lòng nhấp vào nút "Chụp Bản Hiện Tại" phía trên để lưu lại snapshot thiết kế của quy trình này.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. MODAL: CREATE SNAPSHOT */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in" id="modal-create-snapshot">
          <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Chụp Phiên Bản Hiện Tại</h3>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSnapshotSubmit} className="space-y-4 text-xs md:text-sm">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">Tag số hiệu phiên bản mới:</label>
                <input
                  type="text"
                  required
                  value={newSnapVersion}
                  onChange={(e) => setNewSnapVersion(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                  placeholder="Ví dụ: 1.1, 1.2, 2.0..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">Ghi chú lý do thay đổi & Nội dung:</label>
                <textarea
                  required
                  rows={4}
                  value={newSnapDesc}
                  onChange={(e) => setNewSnapDesc(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                  placeholder="Mô tả tóm tắt nội dung thay đổi so với bản trước đó để thuận tiện tra cứu..."
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-lg text-xs space-y-1">
                <span className="font-semibold text-slate-500 block">Thông tin cấu trúc sẽ chụp:</span>
                <span className="text-slate-600 dark:text-slate-400">
                  • Quy trình: <strong>{process.name}</strong>
                </span>
                <span className="text-slate-600 dark:text-slate-400 block">
                  • Số bước thiết kế: <strong>{process.nodes?.length || 0} bước</strong> • Số liên kết: <strong>{process.edges?.length || 0}</strong>
                </span>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
                >
                  Xác nhận chụp lưu trữ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MODAL: PREVIEW SNAPSHOT */}
      {previewSnapshot && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in" id="modal-preview-snapshot">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-slate-250 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 rounded">
                    <Layers className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Xem Trước Chi Tiết Cấu Trúc Bản Chụp</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {previewSnapshot.description}
                </p>
              </div>
              <button 
                onClick={() => setPreviewSnapshot(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-grow bg-slate-50/50 dark:bg-slate-950/20 text-xs md:text-sm">
              
              {/* Process sequential boxes */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Sơ đồ trình tự bước quy trình:</span>
                <div className="flex flex-wrap gap-3 items-center p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl overflow-x-auto shadow-inner">
                  {previewSnapshot.nodes.map((node, idx) => (
                    <React.Fragment key={node.id}>
                      <div className="flex flex-col p-3 bg-slate-50/50 dark:bg-slate-850/30 border border-slate-200 dark:border-slate-850 rounded-lg shadow-sm min-w-[140px] max-w-[180px] shrink-0">
                        <span className="text-[9px] font-bold text-indigo-500">BƯỚC {idx + 1} • {node.code || `B.${idx + 1}`}</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate mt-0.5" title={node.label}>{node.label}</span>
                        <span className="text-[10px] text-slate-500 mt-1 truncate">{node.assigneeDept || "Không chỉ định"}</span>
                        <span className="text-[9px] text-slate-400 truncate">{node.assigneeRole || "Không phân quyền"}</span>
                      </div>
                      {idx < previewSnapshot.nodes.length - 1 && (
                        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-700 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Timeline Steps Details */}
              <div className="space-y-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Chi tiết các bước quy chuẩn trong phiên bản này:</span>
                <div className="space-y-4">
                  {previewSnapshot.nodes.map((node, index) => (
                    <div 
                      key={node.id} 
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl p-4 shadow-sm space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-indigo-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-lg">
                            Bước {index + 1}
                          </span>
                          <span className="text-slate-400 dark:text-slate-600">|</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200">
                            {node.code || `B.${index+1}`} - {node.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold rounded">
                            {node.assigneeDept} • {node.assigneeRole}
                          </span>
                          {node.sla && (
                            <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 font-bold rounded">
                              SLA: {node.sla}
                            </span>
                          )}
                        </div>
                      </div>

                      {node.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850">
                          <strong>Mô tả chi tiết:</strong> {node.description}
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                        <div>
                          <span className="text-slate-400 font-bold block">Mục tiêu bước (KPI/Objective):</span>
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{node.objective || "Chưa thiết lập"}</span>
                        </div>
                        {node.checklist && node.checklist.length > 0 && (
                          <div>
                            <span className="text-slate-400 font-bold block mb-1">Checklist kiểm soát chất lượng (SOP):</span>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                              {node.checklist.map((item, cIdx) => (
                                <li key={cIdx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <span className="text-xs text-slate-400">
                Lưu giữ bảo mật hệ thống nội bộ chuẩn ISO
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewSnapshot(null)}
                  className="px-4 py-2 text-slate-700 bg-slate-150 hover:bg-slate-200 dark:text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Đóng bản xem
                </button>
                {isEditable && (
                  <button
                    type="button"
                    onClick={() => {
                      setRestoreConfirmSnapshot(previewSnapshot);
                      setPreviewSnapshot(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" /> Khôi phục phiên bản này
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MODAL: RESTORE CONFIRM */}
      {restoreConfirmSnapshot && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in" id="modal-restore-confirm">
          <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-850 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-amber-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Xác Nhận Khôi Phục Sơ Đồ</h3>
            </div>

            <div className="space-y-3 text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              <p>
                Bạn có chắc chắn muốn khôi phục toàn bộ thiết kế quy trình hiện tại về phiên bản:
              </p>
              <p className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 rounded-lg text-slate-800 dark:text-slate-200 font-bold">
                {restoreConfirmSnapshot.description}
              </p>
              <p className="text-rose-500 font-bold flex items-start gap-1">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Cảnh báo: Toàn bộ cấu trúc các bước, liên kết, phân vai trò, checklists trong Workflow Builder hiện tại sẽ bị ghi đè hoàn toàn bởi bản chụp này.</span>
              </p>
              <p className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                ✓ Để bảo vệ tuyệt đối dữ liệu của bạn, hệ thống sẽ <strong>tự động tạo thêm một bản sao lưu dự phòng</strong> của trạng thái sơ đồ hiện tại ngay trước khi khôi phục.
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setRestoreConfirmSnapshot(null)}
                className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm cursor-pointer"
              >
                Đồng ý khôi phục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
