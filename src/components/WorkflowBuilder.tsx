import React, { useState, useEffect, useRef } from "react";
import {
  Process,
  WorkflowNode,
  WorkflowEdge,
  NodeType,
  DynamicForm,
} from "../types";
import {
  Plus,
  Trash2,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  GripVertical,
  ChevronsDown,
  ChevronsUp,
} from "lucide-react";
import mermaid from "mermaid";
import SwimlaneFlowchart from "./SwimlaneFlowchart";

// Initialize Mermaid outside or on mount
mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
  themeVariables: {
    primaryColor: '#eff6ff', // light blue
    primaryTextColor: '#1e3a8a',
    primaryBorderColor: '#3b82f6',
    lineColor: '#64748b',
    secondaryColor: '#f0fdf4', // light green
    tertiaryColor: '#fffbeb', // light amber
  }
});

interface WorkflowBuilderProps {
  process: Process;
  forms: DynamicForm[];
  onSaveProcess: (updatedProc: Process) => void;
  currentUserRole: string;
}

// Mermaid Component to render dynamically with proper React lifecycle
function MermaidChart({ chart }: { chart: string }) {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const elementId = useRef(`mermaid-${Math.floor(Math.random() * 100000)}`);

  useEffect(() => {
    let isMounted = true;
    
    const renderChart = async () => {
      if (!chart.trim()) return;
      try {
        setError(null);
        const { svg: renderedSvg } = await mermaid.render(elementId.current, chart);
        if (isMounted) {
          setSvg(renderedSvg);
        }
      } catch (err: any) {
        console.error("Mermaid parsing error:", err);
        if (isMounted) {
          setError("Sơ đồ đang được cập nhật hoặc có lỗi cú pháp liên kết...");
        }
        // Cleanup bad elements that mermaid might leave behind
        const badElement = document.getElementById(elementId.current);
        if (badElement) {
          badElement.remove();
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (error) {
    return (
      <div className="p-4 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 rounded-xl flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div 
      className="flex justify-center items-center w-full min-h-[300px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 overflow-auto shadow-inner"
      dangerouslySetInnerHTML={{ __html: svg || '<div class="text-slate-400 text-xs">Đang vẽ sơ đồ...</div>' }}
    />
  );
}

export default function WorkflowBuilder({
  process,
  forms,
  onSaveProcess,
  currentUserRole,
}: WorkflowBuilderProps) {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [mermaidRefreshKey, setMermaidRefreshKey] = useState(0);
  const [chartView, setChartView] = useState<"swimlane" | "mermaid">("swimlane");

  // Load initial process data
  useEffect(() => {
    if (process) {
      setNodes(process.nodes || []);
      setEdges(process.edges || []);
      
      // Expand all by default initially
      const initExpanded: Record<string, boolean> = {};
      (process.nodes || []).forEach(n => {
        initExpanded[n.id] = true;
      });
      setExpandedNodes(initExpanded);
    }
  }, [process.id]);

  const canEdit =
    currentUserRole !== "Viewer" &&
    currentUserRole !== "Approver";

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Expand / collapse all state logic
  const isAllCollapsed = nodes.length > 0 && nodes.every(n => expandedNodes[n.id] === false);

  const handleToggleExpandAll = () => {
    const newExpanded: Record<string, boolean> = {};
    const targetState = isAllCollapsed; // if all are collapsed, we expand them all. Otherwise, we collapse them all.
    nodes.forEach(n => {
      newExpanded[n.id] = targetState;
    });
    setExpandedNodes(newExpanded);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reorderedNodes = [...nodes];
    const [draggedNode] = reorderedNodes.splice(draggedIndex, 1);
    reorderedNodes.splice(targetIndex, 0, draggedNode);

    // Re-index codes if they start with B. or match the pattern
    const updatedNodes = reorderedNodes.map((node, index) => {
      if (node.code && (node.code.startsWith("B.") || /^B\d+$/.test(node.code))) {
        return { ...node, code: `B.${index + 1}` };
      }
      return node;
    });

    setNodes(updatedNodes);
    saveWorkflow(updatedNodes, edges);
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Compute targets helper
  const getNextNodeId = (nodeId: string): string => {
    return edges.find(e => e.source === nodeId)?.target || "none";
  };

  const getYesNodeId = (nodeId: string): string => {
    return edges.find(e => e.source === nodeId && (e.label === "Đồng ý" || e.label === "Yes"))?.target || "none";
  };

  const getNoNodeId = (nodeId: string): string => {
    return edges.find(e => e.source === nodeId && (e.label === "Không đồng ý" || e.label === "No"))?.target || "none";
  };

  // Auto-generate Mermaid chart code
  const mermaidChartCode = React.useMemo(() => {
    if (nodes.length === 0) {
      return "graph TD\n  Start([Bắt đầu])";
    }

    let lines = ["graph TD"];
    
    // Style classes
    lines.push("  classDef startEnd fill:#f0fdf4,stroke:#16a34a,stroke-width:2px,color:#14532d,font-weight:bold;");
    lines.push("  classDef task fill:#eff6ff,stroke:#2563eb,stroke-width:2px,color:#1e3a8a,font-weight:bold;");
    lines.push("  classDef decision fill:#fffbeb,stroke:#d97706,stroke-width:2px,color:#78350f,font-weight:bold;");
    lines.push("  classDef approval fill:#faf5ff,stroke:#9333ea,stroke-width:2px,color:#581c87,font-weight:bold;");
    lines.push("  classDef endNode fill:#fef2f2,stroke:#dc2626,stroke-width:2px,color:#7f1d1d,font-weight:bold;");

    // Define nodes
    nodes.forEach((node, index) => {
      const displayCode = node.code || `B.${index + 1}`;
      const escapedLabel = `"${displayCode}<br/>${(node.label || `Bước ${index + 1}`).replace(/"/g, '\\"')}"`;
      
      if (node.type === "start") {
        lines.push(`  ${node.id}([${escapedLabel}]):::startEnd`);
      } else if (node.type === "end") {
        lines.push(`  ${node.id}([${escapedLabel}]):::endNode`);
      } else if (node.type === "decision") {
        lines.push(`  ${node.id}{${escapedLabel}}:::decision`);
      } else if (node.type === "approval") {
        lines.push(`  ${node.id}[/${escapedLabel}/]:::approval`);
      } else {
        lines.push(`  ${node.id}[${escapedLabel}]:::task`);
      }
    });

    // Define edges
    edges.forEach((edge) => {
      const sourceExists = nodes.some(n => n.id === edge.source);
      const targetExists = nodes.some(n => n.id === edge.target);
      
      if (sourceExists && targetExists) {
        if (edge.label) {
          lines.push(`  ${edge.source} -->|"${edge.label}"| ${edge.target}`);
        } else {
          lines.push(`  ${edge.source} --> ${edge.target}`);
        }
      }
    });

    return lines.join("\n");
  }, [nodes, edges, mermaidRefreshKey]);

  // Handle saving the state to parent
  const saveWorkflow = (updatedNodes: WorkflowNode[], updatedEdges: WorkflowEdge[]) => {
    const updatedProc: Process = {
      ...process,
      nodes: updatedNodes,
      edges: updatedEdges,
    };
    onSaveProcess(updatedProc);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Update specific node property
  const handleUpdateNodeProp = (nodeId: string, field: keyof WorkflowNode, value: any) => {
    const updatedNodes = nodes.map(node => {
      if (node.id === nodeId) {
        return { ...node, [field]: value };
      }
      return node;
    });
    setNodes(updatedNodes);
    saveWorkflow(updatedNodes, edges);
  };

  // Update generic connection
  const handleUpdateConnection = (sourceId: string, targetId: string) => {
    let updatedEdges = edges.filter(e => e.source !== sourceId);
    if (targetId && targetId !== "none") {
      updatedEdges.push({
        id: `edge-${sourceId}-${targetId}-${Date.now()}`,
        source: sourceId,
        target: targetId,
      });
    }
    setEdges(updatedEdges);
    saveWorkflow(nodes, updatedEdges);
  };

  // Update decision connection (yes/no)
  const handleUpdateDecisionConnection = (sourceId: string, targetId: string, label: "Đồng ý" | "Không đồng ý") => {
    let updatedEdges = edges.filter(e => !(e.source === sourceId && e.label === label));
    if (targetId && targetId !== "none") {
      updatedEdges.push({
        id: `edge-${sourceId}-${targetId}-${Date.now()}`,
        source: sourceId,
        target: targetId,
        label,
      });
    }
    setEdges(updatedEdges);
    saveWorkflow(nodes, updatedEdges);
  };

  // Add a new step
  const handleAddNode = () => {
    const newIndex = nodes.length + 1;
    const newId = `node-${Date.now()}`;
    const defaultSop = {
      purpose: "",
      scope: "",
      definitions: "",
      responsibility: "",
      steps: [`Bước 1: Quy trình thực hiện công việc Bước ${newIndex}`],
      forms: [],
      kpi: "",
      sla: "",
      risks: "",
      controls: "",
      version: "V1.0"
    };

    const newNode: WorkflowNode = {
      id: newId,
      type: "task",
      label: `Bước mới ${newIndex}`,
      code: `B.${newIndex}`,
      assigneeRole: "",
      assigneeDept: "",
      assigneePerson: "",
      sla: "Trong ngày",
      description: "1. Khi nào thực hiện?\n2. Ở đâu?\n3. Ai làm?\n4. Làm bằng cách nào?\n5. Cái gì được tạo ra?",
      objective: "",
      startCondition: "",
      endCondition: "",
      checklist: [],
      sop: defaultSop,
      formId: null,
      x: 100,
      y: 100 * newIndex,
    };

    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    
    // Expand the new node
    setExpandedNodes(prev => ({ ...prev, [newId]: true }));
    
    saveWorkflow(updatedNodes, edges);
  };

  // Delete a step
  const handleDeleteNode = (nodeId: string) => {
    const updatedNodes = nodes.filter(node => node.id !== nodeId);
    // Auto re-index code
    const reindexedNodes = updatedNodes.map((node, index) => {
      if (node.code && node.code.startsWith("B.")) {
        return { ...node, code: `B.${index + 1}` };
      }
      return node;
    });

    const updatedEdges = edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId);
    
    setNodes(reindexedNodes);
    setEdges(updatedEdges);
    saveWorkflow(reindexedNodes, updatedEdges);
  };

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  return (
    <div className="space-y-6" id="workflow-builder-container">
      {/* Title Header Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2" id="workflow-title-h2">
          V. NỘI DUNG QUY TRÌNH (LƯU ĐỒ & DIỄN GIẢI)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-4xl" id="workflow-description-p">
          Hệ thống sẽ dựa vào dữ liệu này để xuất thành 2 bảng riêng biệt (Bảng Lưu đồ và Bảng Diễn giải 5W1H) trên bản in A4, đồng thời vẽ tự động sơ đồ Mermaid.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" id="workflow-grid-layout">
        {/* Left Side: Visual Diagram (Sơ đồ trực quan) */}
        <div className={`${chartView === "swimlane" ? "lg:col-span-12" : "lg:col-span-5 lg:sticky lg:top-6"} space-y-6`} id="workflow-left-mermaid-section">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4 gap-3">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl w-fit">
                <button
                  onClick={() => setChartView("swimlane")}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    chartView === "swimlane"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  Sơ đồ Swimlane (Phân vai)
                </button>
                <button
                  onClick={() => setChartView("mermaid")}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    chartView === "mermaid"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  Sơ đồ Mermaid (Tiêu chuẩn)
                </button>
              </div>
              
              {chartView === "mermaid" && (
                <button
                  onClick={() => setMermaidRefreshKey(prev => prev + 1)}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-semibold flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Làm mới
                </button>
              )}
            </div>
            
            {/* Rendered Diagram */}
            {chartView === "swimlane" ? (
              <SwimlaneFlowchart nodes={nodes} edges={edges} processId={process.id} />
            ) : (
              <MermaidChart chart={mermaidChartCode} />
            )}
          </div>
        </div>

        {/* Right Side: Editor & Configuration (Cấu hình các bước - Nodes) */}
        <div className={`${chartView === "swimlane" ? "lg:col-span-12" : "lg:col-span-7"} space-y-6`} id="workflow-right-config-section">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6 gap-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500" />
                Cấu hình các bước (Nodes)
              </h3>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {nodes.length > 0 && (
                  <button
                    onClick={handleToggleExpandAll}
                    className="text-[11px] text-slate-600 hover:text-slate-850 dark:text-slate-300 dark:hover:text-white font-bold flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-lg transition-colors cursor-pointer"
                    title={isAllCollapsed ? "Mở rộng tất cả các bước" : "Thu gọn tất cả các bước"}
                  >
                    {isAllCollapsed ? (
                      <>
                        <ChevronsDown className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>Mở rộng tất cả</span>
                      </>
                    ) : (
                      <>
                        <ChevronsUp className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span>Thu gọn tất cả</span>
                      </>
                    )}
                  </button>
                )}
                {saveSuccess && (
                  <span className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium animate-fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đã lưu
                  </span>
                )}
                {canEdit && (
                  <button
                    onClick={handleAddNode}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    id="btn-add-step"
                  >
                    <Plus className="w-4 h-4" /> Thêm bước
                  </button>
                )}
              </div>
            </div>

            {/* Steps Stack */}
            <div className="space-y-4 max-h-[750px] overflow-y-auto pr-2">
              {nodes.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-400 font-medium">Chưa có bước nghiệp vụ nào. Hãy nhấn "+ Thêm bước" để bắt đầu thiết kế.</p>
                </div>
              ) : (
                nodes.map((node, index) => {
                  const isExpanded = expandedNodes[node.id] !== false;
                  return (
                    <div 
                      key={node.id}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`border rounded-xl overflow-hidden shadow-sm transition-all bg-slate-50/30 dark:bg-slate-950/10 ${
                        draggedIndex === index ? "opacity-40 border-dashed border-slate-300 dark:border-slate-700" : ""
                      } ${
                        dragOverIndex === index ? "border-indigo-500 ring-2 ring-indigo-500/20 scale-[1.01]" : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      {/* Step Card Header */}
                      <div 
                        className="flex items-center justify-between p-3.5 bg-slate-100/70 dark:bg-slate-900/60 border-b border-slate-200/60 dark:border-slate-800/60 cursor-pointer select-none"
                        onClick={() => toggleExpand(node.id)}
                      >
                        <div className="flex items-center gap-3">
                          {canEdit && (
                            <div 
                              draggable={canEdit}
                              onDragStart={(e) => handleDragStart(e, index)}
                              onDragEnd={handleDragEnd}
                              className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded shrink-0 transition-colors"
                              title="Kéo thả để thay đổi thứ tự bước"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <GripVertical className="w-4.5 h-4.5" />
                            </div>
                          )}
                          <span className="bg-rose-500 text-white px-2.5 py-0.5 text-xs font-bold rounded-lg shrink-0">
                            Bước {index + 1}
                          </span>
                          <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {node.code || `B.${index + 1}`}
                          </span>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-xs md:max-w-md">
                            {node.label || "Tên công việc..."}
                          </h4>
                        </div>

                        <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                          {canEdit && (
                            <button
                              onClick={() => handleDeleteNode(node.id)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                              title="Xóa bước này"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => toggleExpand(node.id)}
                            className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 rounded-lg cursor-pointer"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Step Card Body */}
                      {isExpanded && (
                        <div className="p-4 bg-white dark:bg-slate-900 space-y-4">
                          {/* Grid 1: Dropdowns and Connections */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                                Khối Đồ Thị
                              </label>
                              <select
                                value={node.type}
                                disabled={!canEdit}
                                onChange={(e) => handleUpdateNodeProp(node.id, "type", e.target.value as NodeType)}
                                className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              >
                                <option value="task">Hình Chữ Nhật (Công việc/Tác vụ)</option>
                                <option value="decision">Hình Thoi (Kiểm tra/Duyệt)</option>
                                <option value="start">Hình Tròn (Bắt đầu)</option>
                                <option value="end">Hình Tròn (Kết thúc)</option>
                                <option value="approval">Hình Bo Góc (Phê duyệt)</option>
                              </select>
                            </div>

                            {/* Connection fields */}
                            {node.type === "decision" ? (
                              <div className="p-3 bg-amber-50/50 border border-amber-200 dark:bg-amber-950/10 dark:border-amber-900 rounded-xl space-y-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-amber-700 dark:text-amber-400 block">
                                    Hướng 'Đồng ý' đến Bước:
                                  </label>
                                  <select
                                    value={getYesNodeId(node.id)}
                                    disabled={!canEdit}
                                    onChange={(e) => handleUpdateDecisionConnection(node.id, e.target.value, "Đồng ý")}
                                    className="w-full text-xs p-2 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-900 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                                  >
                                    <option value="none">Mặc định: Không liên kết</option>
                                    {nodes.filter(n => n.id !== node.id).map((otherNode, oIdx) => (
                                      <option key={otherNode.id} value={otherNode.id}>
                                        {otherNode.code || `B.${oIdx + 1}`}: {otherNode.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-amber-700 dark:text-amber-400 block">
                                    Hướng 'Không đồng ý' đến Bước:
                                  </label>
                                  <select
                                    value={getNoNodeId(node.id)}
                                    disabled={!canEdit}
                                    onChange={(e) => handleUpdateDecisionConnection(node.id, e.target.value, "Không đồng ý")}
                                    className="w-full text-xs p-2 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-900 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                                  >
                                    <option value="none">Nhập số Bước (Mặc định: Không liên kết)</option>
                                    {nodes.filter(n => n.id !== node.id).map((otherNode, oIdx) => (
                                      <option key={otherNode.id} value={otherNode.id}>
                                        {otherNode.code || `B.${oIdx + 1}`}: {otherNode.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                                  Liên kết đến bước tiếp theo
                                </label>
                                <select
                                  value={getNextNodeId(node.id)}
                                  disabled={!canEdit}
                                  onChange={(e) => handleUpdateConnection(node.id, e.target.value)}
                                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                >
                                  <option value="none">Không liên kết (Kết thúc quy trình)</option>
                                  {nodes.filter(n => n.id !== node.id).map((otherNode, oIdx) => (
                                    <option key={otherNode.id} value={otherNode.id}>
                                      {otherNode.code || `B.${oIdx + 1}`}: {otherNode.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>

                          {/* Row 2: Tên công việc */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                              TÊN CÔNG VIỆC (Hiển thị Lưu đồ)
                            </label>
                            <input
                              type="text"
                              value={node.label}
                              disabled={!canEdit}
                              onChange={(e) => handleUpdateNodeProp(node.id, "label", e.target.value)}
                              placeholder="VD: Tiếp nhận yêu cầu đổi trả hàng của khách hàng"
                              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                            />
                          </div>

                          {/* Row 3: Đơn vị trách nhiệm & Thời hạn */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                                ĐƠN VỊ TRÁCH NHIỆM
                              </label>
                              <input
                                type="text"
                                value={node.assigneeRole}
                                disabled={!canEdit}
                                onChange={(e) => handleUpdateNodeProp(node.id, "assigneeRole", e.target.value)}
                                placeholder="VD: CSKH / Nhân viên Kỹ thuật"
                                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                                THỜI HẠN
                              </label>
                              <input
                                type="text"
                                value={node.sla}
                                disabled={!canEdit}
                                onChange={(e) => handleUpdateNodeProp(node.id, "sla", e.target.value)}
                                placeholder="VD: Trong 30 phút / 2 ngày làm việc"
                                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                              />
                            </div>
                          </div>

                          {/* Row 4: Diễn giải chi tiết 5W1H */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                              DIỄN GIẢI CHI TIẾT (5W1H)
                              <span title="1. Khi nào thực hiện? 2. Ở đâu? 3. Ai làm? 4. Làm bằng cách nào? 5. Cái gì được tạo ra?">
                                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                              </span>
                            </label>
                            <textarea
                              value={node.description}
                              disabled={!canEdit}
                              onChange={(e) => handleUpdateNodeProp(node.id, "description", e.target.value)}
                              rows={4}
                              placeholder={`1. Khi nào thực hiện?\n2. Ở đâu?\n3. Ai làm?\n4. Làm bằng cách nào?\n5. Cái gì được tạo ra?`}
                              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium leading-relaxed"
                            />
                          </div>

                          {/* Row 5: Biểu mẫu đi kèm */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                              BIỂU MẪU ĐI KÈM
                            </label>
                            <input
                              type="text"
                              value={node.formId || ""}
                              disabled={!canEdit}
                              onChange={(e) => handleUpdateNodeProp(node.id, "formId", e.target.value || null)}
                              placeholder="VD: BM-01 (Phiếu yêu cầu đổi trả hàng)"
                              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
