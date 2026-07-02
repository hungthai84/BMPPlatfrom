import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Process,
  WorkflowNode,
  WorkflowEdge,
  NodeType,
  DynamicForm,
} from "../types";
import {
  Play,
  StopCircle,
  CheckSquare,
  GitPullRequest,
  GitMerge,
  Link,
  Settings,
  User,
  Plus,
  Trash2,
  Shield,
  Calendar,
  RefreshCw,
  Sparkles,
  Save,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileSpreadsheet,
  Mail,
  MessageSquare,
  PhoneCall,
  Bot,
  Layout,
  ListChecks,
  ZoomIn,
  ZoomOut,
  Maximize,
  ChevronDown,
} from "lucide-react";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";

interface WorkflowBuilderProps {
  process: Process;
  forms: DynamicForm[];
  onSaveProcess: (updatedProc: Process) => void;
  currentUserRole: string;
}

const PALETTE_NODES: {
  type: NodeType;
  label: string;
  icon: any;
  color: string;
  bg: string;
  border: string;
}[] = [
  {
    type: "start",
    label: "Bắt đầu (Start)",
    icon: Play,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    border: "border-emerald-300 dark:border-emerald-800",
  },
  {
    type: "task",
    label: "Tác vụ (Task)",
    icon: CheckSquare,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-300 dark:border-blue-800",
  },
  {
    type: "decision",
    label: "Quyết định (Decision)",
    icon: GitPullRequest,
    color: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-950/40",
    border: "border-purple-300 dark:border-purple-800",
  },
  {
    type: "approval",
    label: "Phê duyệt (Approval)",
    icon: Shield,
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    border: "border-amber-300 dark:border-amber-800",
  },
  {
    type: "chatbot",
    label: "Chatbot AI",
    icon: Bot,
    color: "text-teal-600",
    bg: "bg-teal-50 dark:bg-teal-950/40",
    border: "border-teal-300 dark:border-teal-800",
  },
  {
    type: "email",
    label: "Gửi Email",
    icon: Mail,
    color: "text-pink-600",
    bg: "bg-pink-50 dark:bg-pink-950/40",
    border: "border-pink-300 dark:border-pink-800",
  },
  {
    type: "notification",
    label: "Thông báo",
    icon: MessageSquare,
    color: "text-cyan-600",
    bg: "bg-cyan-50 dark:bg-cyan-950/40",
    border: "border-cyan-300 dark:border-cyan-800",
  },
  {
    type: "end",
    label: "Kết thúc (End)",
    icon: StopCircle,
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-950/40",
    border: "border-red-300 dark:border-red-800",
  },
];

export default function WorkflowBuilder({
  process,
  forms,
  onSaveProcess,
  currentUserRole,
}: WorkflowBuilderProps) {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);

  // History for Undo (Ctrl+Z)
  const [history, setHistory] = useState<
    { nodes: WorkflowNode[]; edges: WorkflowEdge[] }[]
  >([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isUndoAction, setIsUndoAction] = useState(false);
  const [showSwimlanes, setShowSwimlanes] = useState(true);
  const [swimlaneOrientation, setSwimlaneOrientation] = useState<'vertical' | 'horizontal'>('vertical');

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Multi-step connection flow states
  const [isConnecting, setIsConnecting] = useState(false);
  const [connSource, setConnSource] = useState<string | null>(null);
  const [edgeLabelInput, setEdgeLabelInput] = useState("");

  // Dragging node state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // AI Optimization modal state
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Sync state with prop process changes
  useEffect(() => {
    if (process && history.length === 0) {
      const initialNodes = process.nodes || [];
      const initialEdges = process.edges || [];
      setNodes(initialNodes);
      setEdges(initialEdges);
      setHistory([{ nodes: initialNodes, edges: initialEdges }]);
      setHistoryIndex(0);
      setSelectedNodeId(initialNodes.length > 0 ? initialNodes[0].id : null);
    }
  }, [process]);

  // Handle Ctrl+Z for Undo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [history, historyIndex]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const pastState = history[newIndex];
      setNodes(pastState.nodes);
      setEdges(pastState.edges);

      setIsUndoAction(true); // Prevent pushing to history in triggerSave

      const updatedProc: Process = {
        ...process,
        nodes: pastState.nodes,
        edges: pastState.edges,
        completionRate: calculateCompletion(pastState.nodes),
      };
      onSaveProcess(updatedProc);

      // reset the undo action flag next tick
      setTimeout(() => setIsUndoAction(false), 0);
    }
  };

  const canEdit =
    currentUserRole !== "Viewer" &&
    currentUserRole !== "Approver" &&
    currentUserRole !== "Reviewer";

  const swimlanes = useMemo(() => {
    const roleXMap = new Map<string, number[]>();
    nodes.forEach((n) => {
      const role = n.assigneeRole || "Chưa phân công";
      if (!roleXMap.has(role)) roleXMap.set(role, []);
      roleXMap.get(role)!.push(n.x);
    });

    const roleAvgX = Array.from(roleXMap.entries()).map(([role, xs]) => {
      const avgX = xs.reduce((sum, val) => sum + val, 0) / xs.length;
      return { role, avgX };
    });

    roleAvgX.sort((a, b) => a.avgX - b.avgX);
    return roleAvgX.map((r) => r.role);
  }, [nodes]);

  const LANE_WIDTH = 300;

  // Find currently selected node details
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // Auto Layout / Tự căn chỉnh sơ đồ
  const handleAutoLayout = () => {
    if (nodes.length === 0) return;

    // Sort nodes roughly based on connections if possible, or simple sequence
    const sortedNodes = [...nodes];
    const horizontalSpacing = 260;
    const verticalSpacing = 140;

    const updated = sortedNodes.map((node, index) => {
      // Create a nice zigzag or grid arrangement
      const col = index % 4;
      const row = Math.floor(index / 4);
      return {
        ...node,
        x: 100 + col * horizontalSpacing,
        y: 120 + row * verticalSpacing,
      };
    });

    setNodes(updated);
    triggerSave(updated, edges);
  };

  const triggerSave = (
    updatedNodes: WorkflowNode[],
    updatedEdges: WorkflowEdge[],
  ) => {
    if (!isUndoAction) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ nodes: updatedNodes, edges: updatedEdges });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }

    const updatedProc: Process = {
      ...process,
      nodes: updatedNodes,
      edges: updatedEdges,
      completionRate: calculateCompletion(updatedNodes),
    };
    onSaveProcess(updatedProc);
  };

  const calculateCompletion = (pNodes: WorkflowNode[]): number => {
    if (pNodes.length === 0) return 0;
    // Calculation based on how complete descriptions and checklists are
    let score = 0;
    pNodes.forEach((n) => {
      if (n.description && n.description.length > 5) score += 20;
      if (n.sop && n.sop.purpose && n.sop.purpose.length > 5) score += 40;
      if (n.checklist && n.checklist.length > 0) score += 20;
      if (n.formId) score += 20;
    });
    return Math.min(
      Math.round((score / (pNodes.length * 100)) * 100) || 10,
      100,
    );
  };

  // Dragging logic
  const handleNodeDragStart = (e: React.MouseEvent, nodeId: string) => {
    if (!canEdit) return;
    e.stopPropagation();
    setDraggingNodeId(nodeId);
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      // Calculate offset between mouse click and node top-left x, y
      setDragOffset({
        x: e.clientX / zoom - node.x,
        y: e.clientY / zoom - node.y,
      });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId) {
      // Update dragging node position
      const mouseX = e.clientX / zoom;
      const mouseY = e.clientY / zoom;
      const newX = Math.round(mouseX - dragOffset.x);
      const newY = Math.round(mouseY - dragOffset.y);

      setNodes((prev) =>
        prev.map((n) =>
          n.id === draggingNodeId
            ? { ...n, x: Math.max(0, newX), y: Math.max(0, newY) }
            : n,
        ),
      );
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleCanvasMouseUp = () => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
      triggerSave(nodes, edges);
    }
    setIsPanning(false);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (
      e.target === canvasRef.current ||
      (e.target as HTMLElement).id === "flowchart-svg"
    ) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  // Node Lifecycle: Add Node
  const handleAddNode = (type: NodeType) => {
    if (!canEdit) return;
    const codeSuffix = Math.floor(Math.random() * 900) + 100;

    // Spawn near center or offset from current nodes
    const spawnedX = 200 + (nodes.length % 3) * 60;
    const spawnedY = 150 + (nodes.length % 3) * 40;

    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type,
      label: `Bước ${nodes.length + 1}: ${PALETTE_NODES.find((p) => p.type === type)?.label.split(" ")[0]}`,
      code: `STEP-${process.code.replace("QT-", "")}-${codeSuffix}`,
      assigneeRole: "Chuyên viên nghiệp vụ",
      assigneeDept: process.department,
      assigneePerson: "Chưa phân công",
      sla: 2,
      description:
        "Mô tả chi tiết các hành động thao tác cần thực hiện tại bước này.",
      objective: "Đạt chuẩn đầu ra của bước nghiệp vụ.",
      startCondition: "Có kết quả hoặc dữ liệu bàn giao từ bước trước.",
      endCondition: "Hoàn tất bàn giao hoặc cập nhật trạng thái.",
      checklist: [
        "Kiểm tra thông tin đầu vào",
        "Thực hiện nghiệp vụ chính",
        "Xác nhận kết quả lưu hệ thống",
      ],
      sop: {
        purpose: "Mục đích thao tác chuẩn.",
        scope: `Áp dụng trong bộ phận ${process.department}.`,
        definitions: "N/A",
        responsibility: "Người phụ trách thực hiện.",
        steps: [
          "Tiếp nhận công việc.",
          "Xử lý nghiệp vụ.",
          "Ghi nhận kết quả.",
        ],
        forms: [],
        kpi: "Đạt chuẩn thời gian & chất lượng",
        sla: "Trong vòng 2 giờ",
        risks: "Nhập liệu sai hoặc chậm trễ",
        controls: "Kiểm tra chéo kết quả",
        version: "V1.0",
      },
      formId: null,
      linkedNodeIds: [],
      x: spawnedX,
      y: spawnedY,
    };

    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    setSelectedNodeId(newNode.id);
    triggerSave(updatedNodes, edges);
  };

  // Node Lifecycle: Delete Node
  const handleDeleteNode = (nodeId: string) => {
    if (!canEdit) return;
    const updatedNodes = nodes.filter((n) => n.id !== nodeId);
    const updatedEdges = edges.filter(
      (e) => e.source !== nodeId && e.target !== nodeId,
    );
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    setSelectedNodeId(updatedNodes.length > 0 ? updatedNodes[0].id : null);
    triggerSave(updatedNodes, updatedEdges);
  };

  // Edge Lifecycle: Create Connection
  const handleStartConnection = (sourceId: string) => {
    if (!canEdit) return;
    setIsConnecting(true);
    setConnSource(sourceId);
  };

  const handleCompleteConnection = (targetId: string) => {
    if (!canEdit || !connSource || connSource === targetId) {
      setIsConnecting(false);
      setConnSource(null);
      return;
    }

    // Check if edge already exists
    const exists = edges.some(
      (e) => e.source === connSource && e.target === targetId,
    );
    if (!exists) {
      const label = edgeLabelInput.trim();
      const newEdge: WorkflowEdge = {
        id: `edge-${connSource}-${targetId}-${Date.now()}`,
        source: connSource,
        target: targetId,
        ...(label ? { label } : {}),
      };
      const updatedEdges = [...edges, newEdge];
      setEdges(updatedEdges);
      triggerSave(nodes, updatedEdges);
    }

    setIsConnecting(false);
    setConnSource(null);
    setEdgeLabelInput("");
  };

  const handleDeleteEdge = (edgeId: string) => {
    if (!canEdit) return;
    const updatedEdges = edges.filter((e) => e.id !== edgeId);
    setEdges(updatedEdges);
    triggerSave(nodes, updatedEdges);
  };

  // Property Editors
  const handleUpdateNodeProperty = (field: keyof WorkflowNode, value: any) => {
    if (!canEdit || !selectedNodeId) return;
    const updatedNodes = nodes.map((n) =>
      n.id === selectedNodeId ? { ...n, [field]: value } : n,
    );
    setNodes(updatedNodes);
    triggerSave(updatedNodes, edges);
  };

  const handleUpdateSOPProperty = (
    field: keyof WorkflowNode["sop"],
    value: any,
  ) => {
    if (!canEdit || !selectedNode) return;
    const updatedNodes = nodes.map((n) =>
      n.id === selectedNode.id
        ? {
            ...n,
            sop: { ...n.sop, [field]: value },
          }
        : n,
    );
    setNodes(updatedNodes);
    triggerSave(updatedNodes, edges);
  };

  // Checklist management
  const handleAddChecklistItem = (text: string) => {
    if (!canEdit || !selectedNode || !text.trim()) return;
    const updatedChecklist = [...(selectedNode.checklist || []), text.trim()];
    handleUpdateNodeProperty("checklist", updatedChecklist);
  };

  const handleRemoveChecklistItem = (idx: number) => {
    if (!canEdit || !selectedNode) return;
    const updatedChecklist = (selectedNode.checklist || []).filter(
      (_, i) => i !== idx,
    );
    handleUpdateNodeProperty("checklist", updatedChecklist);
  };

  // AI assistant: Optimize Process
  const handleAiOptimize = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const response = await fetch("/api/ai/optimize-process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          processName: process.name,
          steps: nodes.map((n) => ({
            code: n.code,
            name: n.label,
            role: n.assigneeRole,
            dept: n.assigneeDept,
            sla: n.sla,
            description: n.description,
          })),
        }),
      });
      const data = await response.json();
      setAiAnalysis(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // AI assistant: Generate SOP automatically for selected node
  const handleAiGenerateSOP = async () => {
    if (!selectedNode) return;
    setIsAnalyzing(true);
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
          role: selectedNode.assigneeRole,
        }),
      });
      const data = await response.json();

      // Update selected node's SOP with AI response
      const updatedNodes = nodes.map((n) =>
        n.id === selectedNode.id
          ? {
              ...n,
              sop: {
                ...n.sop,
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
                version: `V${parseFloat(n.sop.version.replace("V", "")) + 0.1 || 1.1}`,
              },
            }
          : n,
      );

      setNodes(updatedNodes);
      triggerSave(updatedNodes, edges);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[720px]"
      id="workflow-builder-container"
    >
      {/* 1. NODE PALETTE & AI CORNER */}
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between"
        id="palette-panel"
      >
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">
              Màu sắc & Loại bước
            </h3>
            <p className="text-[11px] text-slate-500">
              Nhấp chọn loại bước để thêm vào bản vẽ thiết kế quy trình:
            </p>
          </div>

          <div className="space-y-2" id="palette-buttons">
            {[
              { title: "Bắt đầu/Kết thúc", types: ["start", "end"] },
              { title: "Nghiệp vụ", types: ["task", "decision", "approval"] },
              { title: "Tương tác", types: ["chatbot", "email", "notification"] }
            ].map((cat, idx) => (
              <Accordion key={idx} defaultExpanded>
                <AccordionSummary expandIcon={<ChevronDown />}>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">{cat.title}</h4>
                </AccordionSummary>
                <AccordionDetails>
                  <div className="space-y-2">
                    {cat.types.map(t => {
                       const p = PALETTE_NODES.find(n => n.type === t);
                       if (!p) return null;
                       const Icon = p.icon;
                       return (
                         <button
                           key={p.type}
                           disabled={!canEdit}
                           onClick={() => handleAddNode(p.type)}
                           className={`w-full flex items-center gap-3 p-2 rounded-lg border text-[10px] font-semibold text-left transition-all ${p.bg} ${p.border} ${canEdit ? "hover:scale-[1.02] active:scale-[0.98] cursor-pointer" : "opacity-60 cursor-not-allowed"}`}
                         >
                           <div className={`p-1 rounded ${p.color}`}><Icon className="w-3 h-3" /></div>
                           <span className="text-slate-800 dark:text-slate-200">{p.label}</span>
                         </button>
                       );
                    })}
                  </div>
                </AccordionDetails>
              </Accordion>
            ))}
          </div>
        </div>

        {/* AI Action trigger */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-4 text-white space-y-3 shadow-md mt-4 border border-indigo-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] font-bold tracking-widest text-indigo-300 uppercase">
              AI PROCESS ANALYST
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            AI có thể rà soát toàn bộ chuỗi bước này để phát hiện thắt nút cổ
            chai và tối ưu SLA/KPI chuẩn ISO.
          </p>
          <button
            onClick={handleAiOptimize}
            disabled={isAnalyzing}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                Tối ưu quy trình bằng AI{" "}
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. INTERACTIVE DRAWING CANVAS */}
      <div
        className="col-span-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col relative"
        id="canvas-panel"
      >
        {/* Canvas Toolbar */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-800 dark:text-white truncate max-w-[180px]">
              Sơ đồ: {process.name}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-mono text-[10px]">
              {process.code}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Swimlane Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={showSwimlanes}
                onChange={(e) => setShowSwimlanes(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Giao diện Làn bơi
              </span>
            </label>

            <button
              onClick={() => setSwimlaneOrientation(swimlaneOrientation === 'vertical' ? 'horizontal' : 'vertical')}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1"
              title="Chuyển hướng làn bơi"
            >
              {swimlaneOrientation === 'vertical' ? 'Dọc' : 'Ngang'}
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleAutoLayout}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1"
                title="Tự động sắp xếp các node ngăn nắp"
              >
                <Layout className="w-3.5 h-3.5" /> Auto Align
              </button>

              {/* Connection mode state indicator */}
              {canEdit && (
                <button
                  onClick={() => {
                    if (isConnecting) {
                      setIsConnecting(false);
                      setConnSource(null);
                    } else {
                      if (selectedNodeId) {
                        handleStartConnection(selectedNodeId);
                      } else {
                        alert("Hãy nhấp chọn một Node nguồn trước!");
                      }
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${isConnecting ? "bg-amber-500 text-white animate-pulse" : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400"}`}
                >
                  <Link className="w-3.5 h-3.5" />
                  {isConnecting ? "Đang liên kết..." : "Nối Node"}
                </button>
              )}

              {canEdit && (
                <button
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${historyIndex <= 0 ? "bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800" : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"}`}
                  title="Quay lại (Ctrl+Z)"
                >
                  ⟲ Undo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div
          ref={canvasRef}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseDown={handleCanvasMouseDown}
          className={`flex-1 relative overflow-hidden select-none ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
          id="canvas-draw-area"
        >
          {/* SVG Connector layer */}
          <svg
            id="flowchart-svg"
            className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
          >
            <defs>
              <marker
                id="arrowhead"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#3b82f6" />
              </marker>
              <marker
                id="arrowhead-selected"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#818cf8" />
              </marker>
            </defs>

            {/* Render actual edges as beautiful curve paths */}
            {edges.map((edge) => {
              const src = nodes.find((n) => n.id === edge.source);
              const tgt = nodes.find((n) => n.id === edge.target);
              if (!src || !tgt) return null;

              // Compute ports coordinates (right of source node, left of target node)
              const nodeWidth = 180;
              const nodeHeight = 70;

              const x1 = src.x + nodeWidth;
              const y1 = src.y + nodeHeight / 2;
              const x2 = tgt.x;
              const y2 = tgt.y + nodeHeight / 2;

              // Curved bezier flow path
              const dx = Math.abs(x2 - x1) * 0.5;
              const dPath = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

              // Text label placement midpoint
              const mx = (x1 + x2) / 2;
              const my = (y1 + y2) / 2;

              return (
                <g key={edge.id} className="pointer-events-auto">
                  <title>Click để xóa liên kết này</title>
                  <path
                    d={dPath}
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    className="hover:stroke-indigo-500 cursor-pointer transition-all animate-flow-dash"
                    style={{ strokeDasharray: "6, 4" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        canEdit &&
                        window.confirm(
                          "Bạn có chắc chắn muốn xóa đường liên kết này?",
                        )
                      ) {
                        handleDeleteEdge(edge.id);
                      }
                    }}
                  />
                  {edge.label && (
                    <foreignObject
                      x={mx - 60}
                      y={my - 12}
                      width="120"
                      height="24"
                      className="text-center overflow-visible"
                    >
                      <span className="inline-block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-2 py-0.5 text-[9px] font-bold text-slate-600 dark:text-slate-300 shadow-sm truncate max-w-full">
                        {edge.label}
                      </span>
                    </foreignObject>
                  )}
                </g>
              );
            })}
          </svg>

          {/* HTML node elements mapping */}
          <div
            className="absolute origin-top-left"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              width: "100%",
              height: "100%",
            }}
          >
            {/* SWIMLANES BACKGROUND */}
            {showSwimlanes && swimlanes.length > 0 && (
              <div className={`absolute top-0 left-0 flex ${swimlaneOrientation === 'vertical' ? 'flex-row' : 'flex-col'} h-[4000px] w-[4000px] pointer-events-none z-0`}>
                {swimlanes.map((role, idx) => (
                  <div
                    key={idx}
                    className={`${swimlaneOrientation === 'vertical' ? 'border-r-2' : 'border-b-2'} border-dashed border-slate-300 dark:border-slate-700/60 relative bg-slate-200/20 dark:bg-slate-800/20`}
                    style={{ width: swimlaneOrientation === 'vertical' ? LANE_WIDTH : '100%', height: swimlaneOrientation === 'vertical' ? '100%' : LANE_WIDTH }}
                  >
                    <div className={`sticky ${swimlaneOrientation === 'vertical' ? 'top-0' : 'left-0'} bg-slate-100/95 dark:bg-slate-800/95 backdrop-blur-md text-center py-3 font-extrabold text-slate-700 dark:text-slate-200 ${swimlaneOrientation === 'vertical' ? 'border-b-2' : 'border-r-2'} border-slate-300 dark:border-slate-700 shadow-sm z-10 text-xs tracking-wider`}>
                      {role}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {nodes.map((node) => {
              const isSelected = node.id === selectedNodeId;
              const paletteDetail =
                PALETTE_NODES.find((p) => p.type === node.type) ||
                PALETTE_NODES[1];
              const NodeIcon = paletteDetail.icon;

              return (
                <div
                  key={node.id}
                  style={{
                    left: `${swimlaneOrientation === 'vertical' ? node.x : node.y}px`,
                    top: `${swimlaneOrientation === 'vertical' ? node.y : node.x}px`,
                    width: "180px",
                    height: "70px",
                    position: "absolute",
                  }}
                  onMouseDown={(e) => handleNodeDragStart(e, node.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isConnecting && connSource && connSource !== node.id) {
                      handleCompleteConnection(node.id);
                    } else {
                      setSelectedNodeId(node.id);
                      if (canEdit) setIsNodeModalOpen(true);
                    }
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                  }}
                  className={`bg-white dark:bg-slate-900 border-2 rounded-xl p-2.5 flex items-center gap-2 shadow-sm transition-all select-none cursor-grab ${isSelected ? "border-indigo-500 ring-4 ring-indigo-100 dark:ring-indigo-950/40 z-30 scale-105" : "border-slate-200 dark:border-slate-800 hover:border-slate-400"} ${isConnecting && connSource && connSource !== node.id ? "hover:border-emerald-500 border-dashed animate-pulse ring-2 ring-emerald-100" : ""}`}
                >
                  <div
                    className={`p-1.5 rounded-lg ${paletteDetail.bg} ${paletteDetail.color} shrink-0 shadow-sm`}
                  >
                    <NodeIcon className="w-4 h-4" />
                  </div>

                  <div className="overflow-hidden flex-1 leading-tight">
                    <span className="text-[8px] font-mono font-bold text-slate-400 dark:text-slate-500 block truncate">
                      {node.code}
                    </span>
                    <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                      {node.label}
                    </h4>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-0.5">
                      <User className="w-2.5 h-2.5" />{" "}
                      {node.assigneeRole || "N/A"}
                    </p>
                  </div>

                  {/* Quick Connect trigger handle */}
                  {canEdit && (
                    <div
                      className={`absolute -right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-10 transition-opacity ${isSelected ? "opacity-100" : "opacity-0 hover:opacity-100"}`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartConnection(node.id);
                        }}
                        className="p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md flex items-center justify-center w-6 h-6 border-2 border-white dark:border-slate-900"
                        title="Tạo liên kết từ node này"
                      >
                        <Link className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Settings quick access */}
                  {isSelected && canEdit && (
                    <div className="absolute -top-3 right-2 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsNodeModalOpen(true);
                        }}
                        className="bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded-full shadow-md hover:bg-indigo-700 font-bold flex items-center gap-1"
                        title="Click đúp hoặc bấm để sửa"
                      >
                        <Settings className="w-3 h-3" /> Sửa
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Zoom controls & Fullscreen float */}
        <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-1.5 rounded-lg flex items-center gap-1.5 shadow-md z-10">
          <button
            onClick={() => setZoom((prev) => Math.max(prev - 0.1, 0.5))}
            className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((prev) => Math.min(prev + 0.1, 1.8))}
            className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>
          <button
                onClick={() => {
                  const elem = document.getElementById("canvas-panel");
                  if (!document.fullscreenElement) {
                    elem?.requestFullscreen().catch((err) =>
                      alert(`Error: ${err.message}`),
                    );
                  } else {
                    document.exitFullscreen();
                  }
                }}
                className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                title="Mở rộng toàn màn hình"
              >
                <Maximize className="w-3.5 h-3.5" />
              </button>
        </div>

        {/* Connection flow intermediate configuration tooltip */}
        {isConnecting && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg flex items-center gap-3 z-20">
            <span>
              Chọn Node đích để tạo liên kết. Nhập nhãn điều kiện (tùy chọn):
            </span>
            <input
              type="text"
              placeholder="VD: Có bồi hoàn..."
              value={edgeLabelInput}
              onChange={(e) => setEdgeLabelInput(e.target.value)}
              className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white outline-none w-32 font-bold"
            />
            <button
              onClick={() => {
                setIsConnecting(false);
                setConnSource(null);
              }}
              className="text-red-400 hover:underline font-bold"
            >
              Hủy
            </button>
          </div>
        )}
      </div>

      {/* NODE SETTINGS MODAL POPUP */}
      {isNodeModalOpen && selectedNode && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 sm:p-6 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center rounded-t-2xl">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  CẤU HÌNH THÔNG TIN BƯỚC
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 mt-1">
                  <Settings className="w-5 h-5 text-indigo-500" />{" "}
                  {selectedNode.code}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                {canEdit && (
                  <button
                    onClick={() => {
                      handleDeleteNode(selectedNode.id);
                      setIsNodeModalOpen(false);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg flex items-center gap-1.5 text-sm font-semibold"
                    title="Xóa bước này khỏi quy trình"
                  >
                    <Trash2 className="w-4 h-4" /> Xóa bước
                  </button>
                )}
                <button
                  onClick={() => setIsNodeModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Đóng ✕
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-slate-900">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ChevronDown />}>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Thông tin cơ bản</h4>
                    </AccordionSummary>
                    <AccordionDetails>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase">
                            Tên bước thực hiện
                          </label>
                          <input
                            type="text"
                            value={selectedNode.label}
                            disabled={!canEdit}
                            onChange={(e) =>
                              handleUpdateNodeProperty("label", e.target.value)
                            }
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase">
                            Mô tả hành động nghiệp vụ
                          </label>
                          <textarea
                            value={selectedNode.description}
                            disabled={!canEdit}
                            onChange={(e) =>
                              handleUpdateNodeProperty(
                                "description",
                                e.target.value,
                              )
                            }
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase">
                              Mục tiêu bước
                            </label>
                            <input
                              type="text"
                              value={selectedNode.objective}
                              disabled={!canEdit}
                              onChange={(e) =>
                                handleUpdateNodeProperty(
                                  "objective",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase">
                              Thời gian SLA (Giờ)
                            </label>
                            <input
                              type="number"
                              value={selectedNode.sla}
                              disabled={!canEdit}
                              onChange={(e) =>
                                handleUpdateNodeProperty(
                                  "sla",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-800 dark:text-white font-bold text-indigo-600"
                            />
                          </div>
                        </div>
                      </div>
                    </AccordionDetails>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary expandIcon={<ChevronDown />}>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">👥 Nhân sự chịu trách nhiệm (RACI)</h4>
                    </AccordionSummary>
                    <AccordionDetails>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs text-slate-500 font-bold uppercase">
                              Phòng ban
                            </label>
                            <input
                              type="text"
                              value={selectedNode.assigneeDept}
                              disabled={!canEdit}
                              onChange={(e) =>
                                handleUpdateNodeProperty(
                                  "assigneeDept",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg dark:bg-slate-800 dark:text-white text-sm"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs text-slate-500 font-bold uppercase">
                              Chức danh (Role)
                            </label>
                            <input
                              type="text"
                              value={selectedNode.assigneeRole}
                              disabled={!canEdit}
                              onChange={(e) =>
                                handleUpdateNodeProperty(
                                  "assigneeRole",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg dark:bg-slate-800 dark:text-white text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-slate-500 font-bold uppercase">
                            Người thực hiện chuyên trách
                          </label>
                          <input
                            type="text"
                            value={selectedNode.assigneePerson}
                            disabled={!canEdit}
                            onChange={(e) =>
                              handleUpdateNodeProperty(
                                "assigneePerson",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg dark:bg-slate-800 dark:text-white text-sm font-semibold"
                          />
                        </div>
                      </div>
                    </AccordionDetails>
                  </Accordion>
                </div>

                {/* Right Column: Checklist & Actions */}
                <div className="space-y-6">
                  <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ChevronDown />}>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">📋 Checklist thực hiện</h4>
                    </AccordionSummary>
                    <AccordionDetails>
                      <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-2">
                        {(selectedNode.checklist || []).map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-sm border border-slate-100 dark:border-slate-800"
                          >
                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                              {item}
                            </span>
                            {canEdit && (
                              <button
                                onClick={() => handleRemoveChecklistItem(idx)}
                                className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}

                        {canEdit && (
                          <div className="flex gap-2 pt-1">
                            <input
                              type="text"
                              placeholder="Thêm checklist mới..."
                              id="modal-new-checklist-input"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const val = (e.target as HTMLInputElement)
                                    .value;
                                  handleAddChecklistItem(val);
                                  (e.target as HTMLInputElement).value = "";
                                }
                              }}
                              className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                              onClick={() => {
                                const input = document.getElementById(
                                  "modal-new-checklist-input",
                                ) as HTMLInputElement;
                                if (input) {
                                  handleAddChecklistItem(input.value);
                                  input.value = "";
                                }
                              }}
                              className="px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-xl font-bold text-sm transition-colors"
                            >
                              Thêm
                            </button>
                          </div>
                        )}
                      </div>
                    </AccordionDetails>
                  </Accordion>

                  <Accordion>
                    <AccordionSummary expandIcon={<ChevronDown />}>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">🔗 Liên kết & Biểu mẫu</h4>
                    </AccordionSummary>
                    <AccordionDetails>
                      <div className="space-y-6 pt-2">
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-slate-500 uppercase block">
                            📄 Biểu mẫu nghiệp vụ liên kết
                          </label>
                          <select
                            value={selectedNode.formId || ""}
                            disabled={!canEdit}
                            onChange={(e) =>
                              handleUpdateNodeProperty(
                                "formId",
                                e.target.value || null,
                              )
                            }
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">-- Không sử dụng biểu mẫu --</option>
                            {forms.map((f) => (
                              <option key={f.id} value={f.id}>
                                {f.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-3">
                          <label className="text-xs font-bold text-slate-500 uppercase block">
                            🔗 Nodes liên kết
                          </label>
                          <div className="space-y-2">
                            {nodes.filter(n => n.id !== selectedNode.id).map(node => (
                              <div key={node.id} className="flex items-center gap-2 text-sm">
                                <input 
                                  type="checkbox"
                                  checked={(selectedNode.linkedNodeIds || []).includes(node.id)}
                                  onChange={(e) => {
                                    const currentLinkedIds = selectedNode.linkedNodeIds || [];
                                    const newLinkedIds = e.target.checked 
                                      ? [...currentLinkedIds, node.id]
                                      : currentLinkedIds.filter(id => id !== node.id);
                                    handleUpdateNodeProperty("linkedNodeIds", newLinkedIds);
                                  }}
                                />
                                {node.label}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </AccordionDetails>
                  </Accordion>
                  
                  <Accordion>
                    <AccordionSummary expandIcon={<ChevronDown />}>
                       <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">AI SOP Generator</h4>
                    </AccordionSummary>
                    <AccordionDetails>
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 p-4 rounded-xl space-y-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-indigo-500" />
                          <h5 className="text-sm font-bold text-slate-800 dark:text-white">
                            Sinh tài liệu SOP bằng AI
                          </h5>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                          Hệ thống sẽ dựa trên tiêu đề và hành động của bước này
                          để tự động thiết kế một tài liệu SOP ISO 9001 hoàn chỉnh
                          gồm 10 phần.
                        </p>
                        <button
                          onClick={handleAiGenerateSOP}
                          disabled={isAnalyzing || !canEdit}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-sm"
                        >
                          {isAnalyzing ? (
                            <>
                              Đang xử lý{" "}
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            </>
                          ) : (
                            <>
                              Tự động tạo SOP bằng AI{" "}
                              <Sparkles className="w-4 h-4 text-indigo-200" />
                            </>
                          )}
                        </button>
                      </div>
                    </AccordionDetails>
                  </Accordion>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end rounded-b-2xl">
              <button
                onClick={() => setIsNodeModalOpen(false)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white font-bold rounded-xl text-sm transition-colors shadow-sm"
              >
                Xong & Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI ANALYSIS FLOATING RESPONSE POPUP */}
      {aiAnalysis && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-6 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex justify-between items-center rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-sm">
                  Chẩn Đoán & Tối Ưu Quy Trình [ISO / LEAN]
                </h4>
              </div>
              <button
                onClick={() => setAiAnalysis(null)}
                className="text-slate-300 hover:text-white font-bold"
              >
                Đóng ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300">
              {aiAnalysis.fallback && (
                <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-lg border border-amber-200 text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-[11px]">
                    Sử dụng dữ liệu phân tích ngoại tuyến từ Chuyên gia Vận hành
                    của hệ thống do thiếu hoặc chưa cấu hình API Key.
                  </p>
                </div>
              )}

              {/* KPI suggestions */}
              <div className="space-y-1.5">
                <h5 className="font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide">
                  1. Đề xuất chỉ số KPI đánh giá hiệu quả:
                </h5>
                <p className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg whitespace-pre-line border border-slate-100 dark:border-slate-800 leading-relaxed">
                  {aiAnalysis.kpiSuggestions}
                </p>
              </div>

              {/* SLA suggestions */}
              <div className="space-y-1.5">
                <h5 className="font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wide">
                  2. Thiết lập cam kết chất lượng dịch vụ (SLA):
                </h5>
                <p className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg whitespace-pre-line border border-slate-100 dark:border-slate-800 leading-relaxed">
                  {aiAnalysis.slaSuggestions}
                </p>
              </div>

              {/* Duplicate Detections */}
              <div className="space-y-1.5">
                <h5 className="font-bold text-red-700 dark:text-red-400 uppercase tracking-wide">
                  3. Rà soát trùng lặp & Điểm thắt cổ chai:
                </h5>
                <p className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg whitespace-pre-line border border-slate-100 dark:border-slate-800 leading-relaxed text-red-800 dark:text-red-300">
                  {aiAnalysis.duplicateDetections}
                </p>
              </div>

              {/* Optimization proposal */}
              <div className="space-y-1.5">
                <h5 className="font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                  4. Giải pháp cải tiến quy trình (Lean Six Sigma):
                </h5>
                <p className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg whitespace-pre-line border border-slate-100 dark:border-slate-800 leading-relaxed">
                  {aiAnalysis.optimizationProposals}
                </p>
              </div>

              {/* RACI Matrix */}
              <div className="space-y-1.5">
                <h5 className="font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wide">
                  5. Gợi ý Ma trận phân bổ trách nhiệm RACI:
                </h5>
                <p className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg whitespace-pre-line border border-slate-100 dark:border-slate-800 leading-relaxed font-mono">
                  {aiAnalysis.raciMatrix}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setAiAnalysis(null)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow"
              >
                Đồng ý & Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
