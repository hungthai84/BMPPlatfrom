import React, { useState, useMemo, useRef } from "react";
import { WorkflowNode, WorkflowEdge } from "../types";
import { 
  Maximize2, Minimize2, ZoomIn, ZoomOut, RefreshCw, 
  Layers, UserCheck, Play, HelpCircle, FileText
} from "lucide-react";

interface SwimlaneFlowchartProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  processId: string;
}

// Fixed Swimlane configuration for the Software Development process (proc-swimlane-software or DEV-SW-001)
const FIXED_SWIMLANES = {
  columns: [
    { id: "Product", label: "Product", color: "bg-slate-50 text-slate-800" },
    { id: "Design", label: "Design", color: "bg-slate-50 text-slate-800" },
    { id: "Development", label: "Development", color: "bg-slate-50 text-slate-800" },
    { id: "Testing", label: "Testing", color: "bg-slate-50 text-slate-800" },
  ],
  rows: [
    { id: "Requirement", label: "Requirement\nphase", slots: [0, 1, 2, 3, 4, 5], color: "text-slate-800" },
    { id: "Development", label: "Development\nphase", slots: [6, 7, 8, 9, 10, 11, 12, 13], color: "text-slate-800" },
    { id: "Testing", label: "Testing\nphase", slots: [14, 15, 16, 17], color: "text-slate-800" },
    { id: "Release", label: "Release\nphase", slots: [18, 19, 20], color: "text-slate-800" },
  ]
};

export default function SwimlaneFlowchart({ nodes, edges, processId }: SwimlaneFlowchartProps) {
  const [scale, setScale] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine if this is the target swimlane process (Software / Product Development)
  const isSoftwareProcess = useMemo(() => {
    return processId.includes("swimlane") || processId.includes("software") || nodes.some(n => n.code?.startsWith("REQ-") || n.code?.startsWith("DEV-") || n.code?.startsWith("REL-"));
  }, [processId, nodes]);

  // Layout Parameters
  const verticalHeaderWidth = 140;
  const colWidth = 250;
  const slotHeight = 110;
  const topHeaderHeight = 50;

  // 1. Get grid configuration (Columns & Slots)
  const layoutData = useMemo(() => {
    if (isSoftwareProcess) {
      // Map node keys or labels to correct column and slot index
      const mappedNodes = nodes.map(node => {
        let col = 0; // Product default
        const dept = (node.assigneeDept || "").toLowerCase();
        if (dept.includes("design")) col = 1;
        else if (dept.includes("development") || dept.includes("dev")) col = 2;
        else if (dept.includes("testing") || dept.includes("qa") || dept.includes("test")) col = 3;

        let slot = 0;
        const code = node.code || "";
        const label = (node.label || "").toLowerCase();

        // Map based on Node Code/Label
        if (code === "REQ-01" || label.includes("analyze requirements")) slot = 0;
        else if (code === "REQ-02" || label.includes("initial review")) {
          if (label.includes("passed")) slot = 2;
          else slot = 1;
        }
        else if (code === "REQ-03" || label.includes("initial review passed")) slot = 2;
        else if (code === "REQ-04" || label.includes("design a solution")) slot = 3;
        else if (code === "REQ-05" || label.includes("participate in solution design")) slot = 3;
        else if (code === "REQ-06" || label.includes("conduct a requirement review")) slot = 4;
        else if (label.includes("participate in the requirement review")) {
          slot = 4;
          if (col === 1) col = 1;
          else if (col === 2) col = 2;
          else if (col === 3) col = 3;
        }
        else if (code === "REQ-10" || (label.includes("review passed") && node.theme?.includes("Requirement"))) slot = 5;
        
        else if (code === "DEV-01" || label.includes("product requirement documents")) slot = 6;
        else if (code === "DEV-02" || label.includes("conduct ui design")) slot = 7;
        else if (code === "DEV-06" || label.includes("design a technical solution")) slot = 7;
        else if (code === "DEV-13" || label.includes("design test cases")) slot = 7;
        
        else if (code === "DEV-03" || label.includes("review the design")) slot = 8;
        else if (code === "DEV-07" || label.includes("review the technical solution")) slot = 8;
        else if (code === "DEV-14" || label.includes("review test cases")) slot = 8;
        
        else if (code === "DEV-04" || (label.includes("review passed") && col === 1)) slot = 9;
        else if (code === "DEV-08" || (label.includes("review passed") && col === 2)) slot = 9;
        else if (code === "DEV-15" || (label.includes("review passed") && col === 3)) slot = 9;
        
        else if (code === "DEV-05" || label.includes("generate the ui design drafts")) slot = 10;
        else if (code === "DEV-09" || label.includes("generate technical solution documents")) slot = 10;
        else if (code === "DEV-10" || label.includes("arrange a development schedule")) slot = 11;
        else if (code === "DEV-11" || label.includes("self-testing by developers")) slot = 12;
        else if (code === "DEV-12" || label.includes("self-testing passed")) slot = 13;
        
        else if (code === "TST-01" || label.includes("propose the beginning")) slot = 14;
        else if (code === "TST-04" || label.includes("requirement acceptance test")) slot = 14;
        else if (code === "TST-05" || label.includes("design acceptance test")) slot = 14;
        else if (code === "TST-02" || label.includes("conduct testing")) slot = 15;
        else if (code === "TST-03" || (label.includes("test passed") && col === 3)) slot = 16;
        
        else if (code === "TST-06" || (label.includes("test passed") && col === 0)) slot = 17;
        else if (code === "TST-07" || (label.includes("test passed") && col === 1)) slot = 17;
        else if (code === "TST-08" || label.includes("fix issues")) slot = 17;
        
        else if (code === "REL-01" || label.includes("merge code")) slot = 18;
        else if (code === "REL-02" || label.includes("deploy code")) slot = 19;
        else if (code === "REL-03" || label.includes("canary release")) slot = 19;
        else if (code === "REL-04" || label.includes("full release")) slot = 20;

        return { ...node, col, slot };
      });

      const cols = FIXED_SWIMLANES.columns;
      const rows = FIXED_SWIMLANES.rows;
      const totalSlots = 21;

      return { nodes: mappedNodes, columns: cols, rows, totalSlots };
    } else {
      // Dynamic Swimlane layout for standard processes (e.g. DEMO-PO-001)
      // Group by assigneeDept or assigneeRole to find unique columns
      const uniqueRoles = Array.from(new Set(nodes.map(n => n.assigneeRole || n.assigneeDept || "Nhân viên")));
      const cols = uniqueRoles.slice(0, 4).map(role => ({
        id: role,
        label: role,
        color: "bg-slate-50 text-slate-800"
      }));
      if (cols.length === 0) {
        cols.push({ id: "System", label: "Hệ thống", color: "bg-slate-50 text-slate-800" });
      }

      // Sort nodes by original y position to assign slots sequentially
      const sortedNodes = [...nodes].sort((a, b) => (a.y || 0) - (b.y || 0));
      const mappedNodes = sortedNodes.map((node, index) => {
        let col = cols.findIndex(c => c.id === (node.assigneeRole || node.assigneeDept || "Nhân viên"));
        if (col === -1) col = 0;
        return { ...node, col, slot: index };
      });

      const totalSlots = nodes.length;
      const rows = [
        { id: "Phase1", label: "Quy trình\nthực thi", slots: Array.from({ length: totalSlots }, (_, i) => i), color: "text-slate-800" }
      ];

      return { nodes: mappedNodes, columns: cols, rows, totalSlots };
    }
  }, [nodes, isSoftwareProcess]);

  // Compute Coordinates Helper
  const getNodeCoords = (col: number, slot: number) => {
    const x = verticalHeaderWidth + col * colWidth + colWidth / 2;
    const y = topHeaderHeight + slot * slotHeight + slotHeight / 2;
    return { x, y };
  };

  // Generate connection line path
  const renderEdgeLine = (edge: WorkflowEdge, edgeIdx: number) => {
    const sourceNode = layoutData.nodes.find(n => n.id === edge.source);
    const targetNode = layoutData.nodes.find(n => n.id === edge.target);

    if (!sourceNode || !targetNode) return null;

    const start = getNodeCoords(sourceNode.col, sourceNode.slot);
    const end = getNodeCoords(targetNode.col, targetNode.slot);

    // Style properties
    const isNo = edge.label?.toLowerCase() === "no" || edge.label?.toLowerCase() === "không đồng ý" || edge.label?.toLowerCase() === "cần sửa" || edge.label?.toLowerCase() === "từ chối";
    const isYes = edge.label?.toLowerCase() === "yes" || edge.label?.toLowerCase() === "đồng ý" || edge.label?.toLowerCase() === "đạt" || edge.label?.toLowerCase() === "thành công";
    
    let lineColor = "stroke-slate-500";
    if (isNo) lineColor = "stroke-amber-600";
    if (isYes) lineColor = "stroke-emerald-600";

    const isHovered = hoveredNode === edge.source || hoveredNode === edge.target;
    const strokeWidth = isHovered ? "3.5" : "1.8";

    // Direct path down
    if (sourceNode.col === targetNode.col && sourceNode.slot < targetNode.slot) {
      const nodeH = sourceNode.type === "decision" ? 32 : 27;
      const targetH = targetNode.type === "decision" ? 32 : 27;
      
      return (
        <g key={`edge-${edge.id}-${edgeIdx}`}>
          <path 
            d={`M ${start.x} ${start.y + nodeH} L ${end.x} ${end.y - targetH}`}
            fill="none"
            className={`${lineColor} transition-all`}
            strokeWidth={strokeWidth}
            markerEnd={`url(#arrow-${lineColor.split("-")[1]})`}
          />
          {edge.label && (
            <text 
              x={start.x + 10} 
              y={start.y + nodeH + 25} 
              className={`text-[10px] font-bold ${isNo ? "fill-amber-600" : isYes ? "fill-emerald-600" : "fill-slate-500"}`}
            >
              {edge.label}
            </text>
          )}
        </g>
      );
    }

    // Feedback Loop (e.g., Diamond to preceding task on the right)
    if (sourceNode.col === targetNode.col && sourceNode.slot > targetNode.slot) {
      const nodeW = sourceNode.type === "decision" ? 32 : 80;
      const targetW = targetNode.type === "decision" ? 32 : 80;

      // Draw loop to the right and up
      const rightX = start.x + colWidth / 2 - 15;
      const d = `M ${start.x + nodeW} ${start.y} 
                 L ${rightX} ${start.y} 
                 L ${rightX} ${end.y} 
                 L ${end.x + targetW} ${end.y}`;

      return (
        <g key={`edge-${edge.id}-${edgeIdx}`}>
          <path 
            d={d}
            fill="none"
            className={`${lineColor} transition-all`}
            strokeWidth={strokeWidth}
            markerEnd={`url(#arrow-${lineColor.split("-")[1]})`}
          />
          {edge.label && (
            <text 
              x={start.x + nodeW + 10} 
              y={start.y - 6} 
              className={`text-[10px] font-bold ${isNo ? "fill-amber-600" : isYes ? "fill-emerald-600" : "fill-slate-500"}`}
            >
              {edge.label}
            </text>
          )}
        </g>
      );
    }

    // Horizontal left / right connection
    if (sourceNode.slot === targetNode.slot) {
      const nodeW = sourceNode.type === "decision" ? 32 : 80;
      const targetW = targetNode.type === "decision" ? 32 : 80;

      const pathStart = sourceNode.col < targetNode.col ? start.x + nodeW : start.x - nodeW;
      const pathEnd = sourceNode.col < targetNode.col ? end.x - targetW : end.x + targetW;

      return (
        <g key={`edge-${edge.id}-${edgeIdx}`}>
          <path 
            d={`M ${pathStart} ${start.y} L ${pathEnd} ${end.y}`}
            fill="none"
            className={`${lineColor} transition-all`}
            strokeWidth={strokeWidth}
            markerEnd={`url(#arrow-${lineColor.split("-")[1]})`}
          />
          {edge.label && (
            <text 
              x={(pathStart + pathEnd) / 2} 
              y={start.y - 6} 
              textAnchor="middle"
              className={`text-[10px] font-bold ${isNo ? "fill-amber-600" : isYes ? "fill-emerald-600" : "fill-slate-500"}`}
            >
              {edge.label}
            </text>
          )}
        </g>
      );
    }

    // Complex feedback or diagonal loops (Software Dev specific lines)
    if (isSoftwareProcess) {
      const nodeCode = sourceNode.code || "";
      const targetCode = targetNode.code || "";

      // 1. Requirement Review: participate boxes (Col 1, 2, 3) pointing to Conduct review (Col 0)
      if (targetCode === "REQ-06" && (nodeCode === "REQ-07" || nodeCode === "REQ-08" || nodeCode === "REQ-09")) {
        const topY = 50 + 4 * slotHeight + 15; // horizontal line above the boxes
        const d = `M ${start.x} ${start.y - 27} 
                   L ${start.x} ${topY} 
                   L ${end.x + 110} ${topY} 
                   Q ${end.x + 80} ${topY} ${end.x + 80} ${end.y} 
                   L ${end.x + 80} ${end.y}`;
        return (
          <path 
            key={`edge-${edge.id}-${edgeIdx}`}
            d={d}
            fill="none"
            className={`${lineColor} transition-all`}
            strokeWidth={strokeWidth}
            markerEnd={`url(#arrow-${lineColor.split("-")[1]})`}
          />
        );
      }

      // 2. PRD splits to UI design (Col 1), Tech solution (Col 2), Test cases (Col 3)
      if (nodeCode === "DEV-01") {
        const splitY = start.y + 27 + 15;
        const d = `M ${start.x} ${start.y + 27} 
                   L ${start.x} ${splitY} 
                   L ${end.x} ${splitY} 
                   L ${end.x} ${end.y - 27}`;
        return (
          <path 
            key={`edge-${edge.id}-${edgeIdx}`}
            d={d}
            fill="none"
            className={`${lineColor} transition-all`}
            strokeWidth={strokeWidth}
            markerEnd={`url(#arrow-${lineColor.split("-")[1]})`}
          />
        );
      }

      // 3. Test passed? Yes (Col 3, slot 16) -> Requirement Acceptance (Col 0) & Design Acceptance (Col 1)
      if (nodeCode === "TST-03" && isYes) {
        const downY = start.y + 32 + 15;
        const d = `M ${start.x} ${start.y + 32} 
                   L ${start.x} ${downY} 
                   L ${end.x} ${downY} 
                   L ${end.x} ${end.y + 27}`; // enters from the bottom!
        return (
          <g key={`edge-${edge.id}-${edgeIdx}`}>
            <path 
              d={d}
              fill="none"
              className={`${lineColor} transition-all`}
              strokeWidth={strokeWidth}
              markerEnd={`url(#arrow-${lineColor.split("-")[1]})`}
            />
            <text x={900} y={downY - 6} className="text-[10px] font-bold fill-emerald-600">Yes</text>
          </g>
        );
      }

      // 4. Test passed? No (Col 0 or 1, slot 17) -> Fix Issues (Col 2, slot 17)
      if ((nodeCode === "TST-06" || nodeCode === "TST-07") && isNo) {
        if (nodeCode === "TST-06") {
          // Product Test passed? No -> goes far left and up then right into Fix issues
          const leftX = verticalHeaderWidth + 30;
          const upY = start.y - slotHeight + 35;
          const d = `M ${start.x - 32} ${start.y} 
                     L ${leftX} ${start.y} 
                     L ${leftX} ${upY} 
                     L ${end.x - 120} ${upY} 
                     Q ${end.x - 80} ${upY} ${end.x - 80} ${end.y} 
                     L ${end.x - 80} ${end.y}`;
          return (
            <g key={`edge-${edge.id}-${edgeIdx}`}>
              <path 
                d={d}
                fill="none"
                className={`${lineColor} transition-all`}
                strokeWidth={strokeWidth}
                markerEnd={`url(#arrow-${lineColor.split("-")[1]})`}
              />
              <text x={leftX + 15} y={start.y - 10} className="text-[10px] font-bold fill-amber-600">No</text>
            </g>
          );
        } else {
          // Design Test passed? No -> down, right, up into Fix issues
          const downY = start.y + 32 + 12;
          const d = `M ${start.x} ${start.y + 32} 
                     L ${start.x} ${downY} 
                     L ${end.x - 120} ${downY} 
                     Q ${end.x - 80} ${downY} ${end.x - 80} ${end.y} 
                     L ${end.x - 80} ${end.y}`;
          return (
            <g key={`edge-${edge.id}-${edgeIdx}`}>
              <path 
                d={d}
                fill="none"
                className={`${lineColor} transition-all`}
                strokeWidth={strokeWidth}
                markerEnd={`url(#arrow-${lineColor.split("-")[1]})`}
              />
              <text x={start.x + 15} y={downY - 5} className="text-[10px] font-bold fill-amber-600">No</text>
            </g>
          );
        }
      }

      // 5. Test passed? Yes (Product/Design, slot 17) -> Merge code (Col 2, slot 18)
      if ((nodeCode === "TST-06" || nodeCode === "TST-07") && isYes) {
        const downY = start.y + 32 + 15;
        const d = `M ${start.x} ${start.y + 32} 
                   L ${start.x} ${downY} 
                   L ${end.x} ${downY} 
                   L ${end.x} ${end.y - 27}`;
        return (
          <path 
            key={`edge-${edge.id}-${edgeIdx}`}
            d={d}
            fill="none"
            className={`${lineColor} transition-all`}
            strokeWidth={strokeWidth}
            markerEnd={`url(#arrow-${lineColor.split("-")[1]})`}
          />
        );
      }
    }

    // Fallback: simple orthogonal line
    const d = `M ${start.x} ${start.y} 
               L ${start.x} ${(start.y + end.y) / 2} 
               L ${end.x} ${(start.y + end.y) / 2} 
               L ${end.x} ${end.y}`;
    return (
      <path 
        key={`edge-${edge.id}-${edgeIdx}`}
        d={d}
        fill="none"
        className={`${lineColor} transition-all`}
        strokeWidth={strokeWidth}
        markerEnd={`url(#arrow-${lineColor.split("-")[1]})`}
      />
    );
  };

  const gridWidth = verticalHeaderWidth + layoutData.columns.length * colWidth;
  const gridHeight = topHeaderHeight + layoutData.totalSlots * slotHeight;

  return (
    <div 
      className={`bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all flex flex-col ${
        isFullscreen ? "fixed inset-0 z-50 p-6 bg-white dark:bg-slate-900" : "w-full min-h-[500px]"
      }`}
      id="swimlane-flowchart-block"
    >
      {/* 1. Header Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-500 shrink-0" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
            {isSoftwareProcess ? "Bản đồ lưu đồ phân vai (Cross-Functional Swimlane)" : "Sơ đồ luồng Swimlane Động"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <button 
            onClick={() => setScale(s => Math.max(0.6, s - 0.1))}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate-500 min-w-[40px] text-center font-mono">
            {Math.round(scale * 100)}%
          </span>
          <button 
            onClick={() => setScale(s => Math.min(1.4, s + 0.1))}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            title="Phóng to"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setScale(1)}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            title="Reset tỷ lệ"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

          {/* Fullscreen Button */}
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1 cursor-pointer"
            title={isFullscreen ? "Đóng toàn màn hình" : "Toàn màn hình"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="text-xs font-semibold hidden md:inline">{isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}</span>
          </button>
        </div>
      </div>

      {/* 2. Scrollable Grid Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-6"
      >
        <div 
          className="relative transition-transform duration-100 origin-top-left border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg rounded-2xl"
          style={{ 
            width: `${gridWidth}px`, 
            height: `${gridHeight}px`,
            transform: `scale(${scale})`
          }}
        >
          {/* A. Grid Column Header Lines (Vertical lines dividing departments) */}
          <div className="absolute inset-y-0 left-0 pointer-events-none flex" style={{ width: `${gridWidth}px` }}>
            {/* Row header column divider */}
            <div className="border-r border-slate-200 dark:border-slate-800 h-full" style={{ width: `${verticalHeaderWidth}px` }}></div>
            {/* Columns dividers */}
            {layoutData.columns.map((_, idx) => (
              <div 
                key={idx}
                className="border-r border-slate-200 dark:border-slate-800 h-full"
                style={{ width: `${colWidth}px` }}
              ></div>
            ))}
          </div>

          {/* B. Grid Row Divider Lines (Horizontal lines dividing phases) */}
          {isSoftwareProcess ? (
            <div className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: `${gridHeight}px` }}>
              {/* Column header divider */}
              <div className="border-b border-slate-300 dark:border-slate-700 w-full" style={{ height: `${topHeaderHeight}px` }}></div>
              {/* Custom horizontal block lines for phases */}
              <div className="border-b border-slate-200 dark:border-slate-800 w-full" style={{ height: `${slotHeight * 6}px` }}></div> {/* Req */}
              <div className="border-b border-slate-200 dark:border-slate-800 w-full" style={{ height: `${slotHeight * 8}px` }}></div> {/* Dev */}
              <div className="border-b border-slate-200 dark:border-slate-800 w-full" style={{ height: `${slotHeight * 4}px` }}></div> {/* Test */}
            </div>
          ) : (
            <div className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: `${gridHeight}px` }}>
              <div className="border-b border-slate-300 dark:border-slate-700 w-full" style={{ height: `${topHeaderHeight}px` }}></div>
            </div>
          )}

          {/* C. SVG Connections Layer */}
          <svg 
            width={gridWidth} 
            height={gridHeight} 
            className="absolute inset-0 pointer-events-none z-10"
          >
            <defs>
              <marker id="arrow-slate" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
              </marker>
              <marker id="arrow-amber" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#d97706" />
              </marker>
              <marker id="arrow-emerald" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
              </marker>
            </defs>

            {edges.map((edge, idx) => renderEdgeLine(edge, idx))}
          </svg>

          {/* D. HTML Rendered headers & cards */}
          {/* Column Headers */}
          <div 
            className="absolute top-0 left-0 flex font-display text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-widest border-b border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/90 z-20"
            style={{ width: `${gridWidth}px`, height: `${topHeaderHeight}px` }}
          >
            <div 
              className="flex items-center justify-center border-r border-slate-300 dark:border-slate-700"
              style={{ width: `${verticalHeaderWidth}px` }}
            >
              Phần vai
            </div>
            {layoutData.columns.map((col) => (
              <div 
                key={col.id} 
                className="flex items-center justify-center border-r border-slate-300 dark:border-slate-700"
                style={{ width: `${colWidth}px` }}
              >
                {col.label}
              </div>
            ))}
          </div>

          {/* Row (Phase) Headers on Left */}
          {layoutData.rows.map((row, rIdx) => {
            let rowY = topHeaderHeight;
            let rowH = gridHeight - topHeaderHeight;

            if (isSoftwareProcess) {
              if (row.id === "Requirement") {
                rowY = topHeaderHeight;
                rowH = slotHeight * 6;
              } else if (row.id === "Development") {
                rowY = topHeaderHeight + slotHeight * 6;
                rowH = slotHeight * 8;
              } else if (row.id === "Testing") {
                rowY = topHeaderHeight + slotHeight * 14;
                rowH = slotHeight * 4;
              } else if (row.id === "Release") {
                rowY = topHeaderHeight + slotHeight * 18;
                rowH = slotHeight * 3;
              }
            }

            return (
              <div 
                key={row.id}
                className="absolute left-0 flex flex-col items-center justify-center text-center font-display text-xs font-bold bg-slate-50 dark:bg-slate-900 border-r border-slate-300 dark:border-slate-700 border-b border-slate-200 dark:border-slate-800 p-3 select-none leading-relaxed z-20"
                style={{ 
                  top: `${rowY}px`, 
                  width: `${verticalHeaderWidth}px`, 
                  height: `${rowH}px`
                }}
              >
                <div className="rotate-0 md:-rotate-90 md:whitespace-pre uppercase tracking-wider text-[10px] text-slate-700 dark:text-slate-300 font-extrabold">
                  {row.label}
                </div>
              </div>
            );
          })}

          {/* Cards (Nodes) rendering layer */}
          <div className="absolute inset-0 pointer-events-auto z-20">
            {layoutData.nodes.map((node) => {
              const coords = getNodeCoords(node.col, node.slot);
              const isDecision = node.type === "decision";
              const isSpecialFill = (node.code === "DEV-01" || node.code === "DEV-05" || node.code === "DEV-09") || (node.label || "").toLowerCase().includes("documents") || (node.label || "").toLowerCase().includes("drafts");

              // Cards CSS Class
              let cardClass = "absolute select-none cursor-pointer flex items-center justify-center text-center shadow-sm hover:shadow-md transition-all ";
              let cardStyle: React.CSSProperties = {
                left: `${coords.x}px`,
                top: `${coords.y}px`,
                transform: "translate(-50%, -50%)"
              };

              if (isDecision) {
                // Diamond style
                return (
                  <div 
                    key={node.id}
                    style={cardStyle}
                    className="absolute z-30 group"
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <div className="relative w-16 h-16 bg-amber-50 dark:bg-amber-950/40 border border-amber-500 rounded-md rotate-45 flex items-center justify-center hover:scale-105 transition-transform duration-150 shadow-sm hover:border-amber-600">
                      <div className="-rotate-45 text-center text-[10px] font-bold text-amber-950 dark:text-amber-300 leading-tight p-1.5 font-display select-none">
                        {node.label}
                      </div>
                    </div>
                    {/* Tooltip on hover */}
                    <div className="absolute top-16 left-1/2 -translate-x-1/2 w-48 bg-slate-900/90 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg text-left">
                      <div className="font-bold border-b border-slate-700 pb-1 mb-1 text-indigo-400">{node.code}</div>
                      <div>{node.description}</div>
                    </div>
                  </div>
                );
              }

              // Normal Card or Special filled Cards
              const width = 160;
              const height = 55;
              cardStyle.width = `${width}px`;
              cardStyle.height = `${height}px`;

              if (node.type === "start" || node.type === "end") {
                cardClass += "bg-emerald-50 border border-emerald-500 text-emerald-950 dark:bg-emerald-950/20 dark:text-emerald-300 rounded-xl hover:scale-105 duration-150";
              } else if (isSpecialFill) {
                cardClass += "bg-indigo-50 border-2 border-indigo-500 text-indigo-950 dark:bg-indigo-950/40 dark:text-indigo-300 rounded-lg hover:scale-105 duration-150";
              } else {
                cardClass += "bg-white border border-slate-800 text-slate-900 dark:bg-slate-900 dark:text-slate-100 rounded-lg hover:scale-105 duration-150";
              }

              return (
                <div 
                  key={node.id}
                  style={cardStyle}
                  className={`${cardClass} p-2 font-display text-[10.5px] font-bold leading-normal border-slate-950 dark:border-slate-700 group`}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <div className="flex flex-col items-center justify-center h-full w-full">
                    {node.code && (
                      <span className="text-[8px] opacity-60 font-mono tracking-wider block mb-0.5">
                        {node.code}
                      </span>
                    )}
                    <span className="truncate-2-lines line-clamp-2">{node.label}</span>
                  </div>

                  {/* Tooltip on hover */}
                  <div className="absolute top-14 left-1/2 -translate-x-1/2 w-48 bg-slate-900/90 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg text-left">
                    <div className="font-bold border-b border-slate-700 pb-1 mb-1 text-indigo-400">
                      {node.code} {node.assigneeRole ? `• ${node.assigneeRole}` : ""}
                    </div>
                    <div>{node.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
