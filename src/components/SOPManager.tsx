import React, { useState } from "react";
import { Process, WorkflowNode, SOP } from "../types";
import { 
  BookOpen, Sparkles, AlertCircle, Save, RefreshCw, FileText, 
  Layers, HelpCircle, History, FileCheck, ShieldAlert, CheckCircle2 
} from "lucide-react";

interface SOPManagerProps {
  process: Process;
  onSaveProcess: (updatedProc: Process) => void;
  currentUserRole: string;
}

export default function SOPManager({ process, onSaveProcess, currentUserRole }: SOPManagerProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    process.nodes && process.nodes.length > 0 ? process.nodes[0].id : ""
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSection, setActiveSection] = useState<number>(0);

  const canEdit = currentUserRole !== 'Viewer' && currentUserRole !== 'Approver' && currentUserRole !== 'Reviewer';

  const nodes = process.nodes || [];
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  const handleUpdateSOP = (field: keyof SOP, value: any) => {
    if (!canEdit || !selectedNode) return;
    
    const updatedNodes = nodes.map(n => {
      if (n.id === selectedNode.id) {
        return {
          ...n,
          sop: {
            ...n.sop,
            [field]: value
          }
        };
      }
      return n;
    });

    const updatedProc: Process = {
      ...process,
      nodes: updatedNodes
    };
    onSaveProcess(updatedProc);
  };

  const handleIncrementVersion = () => {
    if (!canEdit || !selectedNode) return;
    const currentVer = selectedNode.sop.version || "V1.0";
    const num = parseFloat(currentVer.replace("V", "")) || 1.0;
    const nextVer = `V${(num + 0.1).toFixed(1)}`;
    handleUpdateSOP("version", nextVer);
  };

  const handleAiAutoGenerate = async () => {
    if (!selectedNode) return;
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/generate-sop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepCode: selectedNode.code,
          stepName: selectedNode.label,
          description: selectedNode.description,
          objective: selectedNode.objective,
          department: selectedNode.assigneeDept,
          role: selectedNode.assigneeRole
        })
      });
      const data = await response.json();
      
      // Update with AI generated values or fallback mock data from server
      const updatedNodes = nodes.map(n => {
        if (n.id === selectedNode.id) {
          return {
            ...n,
            sop: {
              purpose: data.purpose || n.sop.purpose,
              scope: data.scope || n.sop.scope,
              definitions: data.definitions || n.sop.definitions,
              responsibility: data.responsibility || n.sop.responsibility,
              steps: Array.isArray(data.steps) ? data.steps : n.sop.steps,
              forms: Array.isArray(data.forms) ? data.forms : n.sop.forms,
              kpi: data.kpi || n.sop.kpi,
              sla: data.sla || n.sop.sla,
              risks: data.risks || n.sop.risks,
              controls: data.controls || n.sop.controls,
              version: `V${(parseFloat(n.sop.version.replace('V', '')) + 0.1 || 1.1).toFixed(1)}`
            }
          };
        }
        return n;
      });

      onSaveProcess({
        ...process,
        nodes: updatedNodes
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const sections = [
    { label: "1. Mục đích", field: "purpose", placeholder: "Nêu rõ mục đích xây dựng SOP này để đạt chuẩn gì..." },
    { label: "2. Phạm vi", field: "scope", placeholder: "Những bộ phận, chức danh hay trường hợp nào áp dụng..." },
    { label: "3. Định nghĩa", field: "definitions", placeholder: "Định nghĩa, các thuật ngữ viết tắt của nghiệp vụ..." },
    { label: "4. Trách nhiệm (RACI)", field: "responsibility", placeholder: "Chi tiết ma trận trách nhiệm RACI..." },
    { label: "5. Quy trình thực hiện", field: "steps", placeholder: "Các bước nhỏ thực hiện trực tiếp...", type: "list" },
    { label: "6. Biểu mẫu liên quan", field: "forms", placeholder: "Các hồ sơ, tài liệu, biểu mẫu đầu vào/đầu ra...", type: "list" },
    { label: "7. Chỉ số đánh giá (KPI)", field: "kpi", placeholder: "Chỉ số đo lường hiệu suất thực tế..." },
    { label: "8. Cam kết chất lượng (SLA)", field: "sla", placeholder: "Thời gian xử lý cam kết..." },
    { label: "9. Rủi ro tiềm ẩn", field: "risks", placeholder: "Các rủi ro vận hành có thể phát sinh..." },
    { label: "10. Biện pháp kiểm soát", field: "controls", placeholder: "Biện pháp khắc phục và phòng ngừa tương ứng..." }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[720px]" id="sop-manager-container">
      {/* LEFT COLUMN: STEP LIST SELECTION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4" id="sop-step-selector">
        <div>
          <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Danh Sách Bước Nghiệp Vụ</h3>
          <p className="text-[11px] text-slate-500">Mỗi bước trong sơ đồ đều tương ứng với một tài liệu hướng dẫn SOP riêng biệt chuẩn ISO 9001:</p>
        </div>

        <div className="space-y-2 overflow-y-auto max-h-[460px]">
          {nodes.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Chưa có bước nào trong quy trình này. Hãy thiết kế sơ đồ trước.</p>
          ) : (
            nodes.map(n => {
              const isSelected = n.id === selectedNodeId;
              return (
                <div 
                  key={n.id}
                  onClick={() => setSelectedNodeId(n.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${isSelected ? 'bg-indigo-50 border-indigo-500 text-indigo-900 dark:bg-indigo-950/40 dark:border-indigo-500 dark:text-white' : 'bg-slate-50 border-slate-200 hover:border-slate-400 dark:bg-slate-800/40 dark:border-slate-800 text-slate-700 dark:text-slate-300'}`}
                >
                  <div className="flex justify-between items-center text-[10px] mb-1.5 font-mono">
                    <span className="font-bold text-slate-400">{n.code}</span>
                    <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300 px-1.5 py-0.2 rounded font-bold">{n.sop?.version || "V1.0"}</span>
                  </div>
                  <h4 className="text-xs font-bold truncate">{n.label}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-1">Vai trò: {n.assigneeRole}</p>
                </div>
              );
            })
          )}
        </div>

        {/* Selected step details card */}
        {selectedNode && (
          <div className="bg-indigo-950 text-white rounded-xl p-4 space-y-2.5 shadow-md border border-indigo-800">
            <div className="flex items-center gap-2 text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-bold tracking-widest uppercase">AI ISO ASSISTANT</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              AI có thể tự động soạn nháp 10 chương SOP ISO cho bước này cực kỳ chi tiết từ dữ liệu sơ đồ.
            </p>
            <button
              onClick={handleAiAutoGenerate}
              disabled={isGenerating || !canEdit}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isGenerating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>Tự viết SOP bằng AI <Sparkles className="w-3.5 h-3.5 text-amber-400" /></>
              )}
            </button>
          </div>
        )}
      </div>

      {/* RIGHT TWO COLUMNS: SOP EDITING PANEL */}
      <div className="col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between" id="sop-editor-panel">
        {selectedNode ? (
          <div className="flex-1 flex flex-col justify-between h-full space-y-4">
            {/* Header of selected SOP */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold px-2 py-0.5 rounded">ISO 9001:2015</span>
                  <span className="text-[10px] font-mono text-indigo-600 font-bold">SOP-{selectedNode.code}</span>
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" /> SOP: {selectedNode.label}
                </h2>
              </div>

              {/* Version control actions */}
              <div className="flex items-center gap-2">
                <div className="text-right text-xs">
                  <p className="text-[9px] text-slate-400 font-bold uppercase">Mã số phiên bản</p>
                  <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedNode.sop?.version || "V1.0"}</p>
                </div>
                {canEdit && (
                  <button
                    onClick={handleIncrementVersion}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white text-[10px] font-bold rounded-lg flex items-center gap-1 transition-colors"
                    title="Nâng cấp phiên bản lên +0.1"
                  >
                    <History className="w-3.5 h-3.5" /> Nâng ver (+0.1)
                  </button>
                )}
              </div>
            </div>

            {/* SOP Content Layout (Section Tabs & Editor) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 items-start min-h-[360px]">
              {/* Vertical section list */}
              <div className="space-y-1 border-r border-slate-150 dark:border-slate-800 pr-2">
                {sections.map((sect, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSection(idx)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${activeSection === idx ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    <span className="truncate">{sect.label}</span>
                  </button>
                ))}
              </div>

              {/* Active Section Text Editor */}
              <div className="md:col-span-3 space-y-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-white">{sections[activeSection].label}</h4>
                  <p className="text-[10px] text-slate-400">{sections[activeSection].placeholder}</p>
                </div>

                {/* Conditional rendering based on section data type (Text or List of lines) */}
                {sections[activeSection].type === 'list' ? (
                  <div className="space-y-2">
                    {/* Render SOP list lines */}
                    {Array.isArray(selectedNode.sop?.[sections[activeSection].field as keyof SOP]) ? (
                      (selectedNode.sop[sections[activeSection].field as keyof SOP] as string[]).map((stepLine, sIdx) => (
                        <div key={sIdx} className="flex gap-2 items-center">
                          <span className="text-xs font-mono font-bold text-slate-400">{sIdx + 1}.</span>
                          <input 
                            type="text"
                            value={stepLine}
                            disabled={!canEdit}
                            onChange={(e) => {
                              const currList = [...(selectedNode.sop[sections[activeSection].field as keyof SOP] as string[])];
                              currList[sIdx] = e.target.value;
                              handleUpdateSOP(sections[activeSection].field as keyof SOP, currList);
                            }}
                            className="flex-1 p-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs rounded-lg dark:text-white"
                          />
                          {canEdit && (
                            <button
                              onClick={() => {
                                const currList = (selectedNode.sop[sections[activeSection].field as keyof SOP] as string[]).filter((_, i) => i !== sIdx);
                                handleUpdateSOP(sections[activeSection].field as keyof SOP, currList);
                              }}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">Dữ liệu không đúng định dạng danh sách.</p>
                    )}

                    {canEdit && (
                      <button
                        onClick={() => {
                          const currList = [...((selectedNode.sop?.[sections[activeSection].field as keyof SOP] as string[]) || [])];
                          currList.push("Bước mới...");
                          handleUpdateSOP(sections[activeSection].field as keyof SOP, currList);
                        }}
                        className="mt-2 text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        + Thêm dòng quy trình
                      </button>
                    )}
                  </div>
                ) : (
                  <textarea
                    value={(selectedNode.sop?.[sections[activeSection].field as keyof SOP] as string) || ""}
                    disabled={!canEdit}
                    onChange={(e) => handleUpdateSOP(sections[activeSection].field as keyof SOP, e.target.value)}
                    rows={8}
                    placeholder={sections[activeSection].placeholder}
                    className="w-full p-4 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white leading-relaxed font-medium"
                  />
                )}
              </div>
            </div>

            {/* Footer with security and status info */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <p className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Mọi thay đổi SOP sẽ được tự động lưu vào sơ đồ và cập nhật bản in ISO.</span>
              </p>
              <div className="flex gap-2">
                <span className="font-bold">Đồng bộ: 100% OK</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-24">
            <BookOpen className="w-12 h-12 mb-3" />
            <p className="text-sm font-bold">Hãy chọn một bước nghiệp vụ ở cột bên trái để bắt đầu lập tài liệu SOP chuẩn ISO 9001.</p>
          </div>
        )}
      </div>
    </div>
  );
}
