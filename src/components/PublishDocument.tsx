import React, { useState } from "react";
import { Process, ChangelogItem } from "../types";
import { 
  FileText, Award, Calendar, User, Printer, CheckCircle, 
  Send, ShieldCheck, AlertCircle, RefreshCw, MessageCircle, ArrowRight,
  Download, FileSpreadsheet, FileCheck2
} from "lucide-react";

interface PublishDocumentProps {
  process: Process;
  onUpdateProcessStatus: (id: string, newStatus: Process['status'], reviewComments?: string, updatedChangelog?: ChangelogItem[]) => void;
  currentUserRole: string;
  companyName?: string;
}

export default function PublishDocument({ process, onUpdateProcessStatus, currentUserRole, companyName = "CÔNG TY TNHH MTV SEN VÀNG VIỆT NAM" }: PublishDocumentProps) {
  const [commentInput, setCommentInput] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Parse nodes for sequential visual roadmap
  const orderedNodes = [...(process.nodes || [])].sort((a, b) => a.x - b.x);

  // Role permissions
  const isSuperAdmin = currentUserRole === 'Super Admin';
  const isProcessManager = currentUserRole === 'Process Manager';
  const isEditor = currentUserRole === 'Editor';
  const isReviewer = currentUserRole === 'Reviewer';
  const isApprover = currentUserRole === 'Approver';

  // Can execute specific status transitions
  const canSubmitForReview = isSuperAdmin || isProcessManager || isEditor;
  const canReview = isSuperAdmin || isProcessManager || isReviewer;
  const canApprove = isSuperAdmin || isProcessManager || isApprover;

  const handleAction = (targetStatus: Process['status'], desc: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Create automatic changelog record
    const newLog: ChangelogItem = {
      version: process.version,
      date: today,
      author: currentUserRole + " (User)",
      description: desc + (commentInput ? `. Nội dung: "${commentInput}"` : "")
    };

    const updatedChangelog = [newLog, ...(process.changelog || [])];
    onUpdateProcessStatus(process.id, targetStatus, commentInput, updatedChangelog);
    setCommentInput("");
    alert(`Đã cập nhật luồng phê duyệt: ${desc}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportSimulate = (type: 'PDF' | 'Word' | 'Excel') => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert(`🎉 Đã tự động sinh tài liệu ${type} chuẩn ISO 9001 thành công!\nTên file: ${process.code}_${process.name.replace(/\s+/g, "_")}_${process.version}.${type.toLowerCase()}`);
    }, 1500);
  };

  return (
    <div className="space-y-6" id="publish-tab">
      {/* 1. APPROVAL WORKFLOW STATUS CONTROL PANEL */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm" id="approval-control-panel">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">LUỒNG DUYỆT BAN HÀNH QUY TRÌNH</span>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${process.status === 'active' ? 'bg-emerald-500 animate-pulse' : process.status === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-blue-500'}`} />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Trạng thái hiện tại: <span className="uppercase text-blue-600 dark:text-blue-400 font-display">{process.status === 'active' ? 'Có hiệu lực (Published)' : process.status === 'pending' ? 'Chờ phê duyệt (Pending)' : 'Đang soạn thảo (Draft)'}</span>
              </h3>
            </div>
          </div>

          {/* Progress Tracker Bar */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className={`px-2.5 py-1 rounded-full ${process.status === 'draft' ? 'bg-blue-100 text-blue-800 font-bold' : 'bg-slate-100 text-slate-500'}`}>Soạn thảo</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
            <span className={`px-2.5 py-1 rounded-full ${process.status === 'pending' ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-slate-100 text-slate-500'}`}>Góp ý & Kiểm tra</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
            <span className={`px-2.5 py-1 rounded-full ${process.status === 'active' ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-slate-100 text-slate-500'}`}>Phê duyệt ban hành</span>
          </div>
        </div>

        {/* Dynamic Action Buttons based on User Role */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 shrink-0">Hành động khả dụng cho [{currentUserRole}]:</span>
            <div className="flex flex-wrap gap-2">
              {process.status === 'draft' && canSubmitForReview && (
                <button
                  onClick={() => handleAction('pending', 'Đệ trình kiểm tra và phê duyệt')}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg flex items-center gap-1 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" /> Gửi duyệt ban hành
                </button>
              )}

              {process.status === 'pending' && canReview && (
                <button
                  onClick={() => handleAction('draft', 'Yêu cầu chỉnh sửa thêm / Từ chối')}
                  className="px-4 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold"
                >
                  Trả về chỉnh sửa ✕
                </button>
              )}

              {process.status === 'pending' && canApprove && (
                <button
                  onClick={() => handleAction('active', 'Phê duyệt chính thức ban hành ISO 9001')}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1 shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Phê duyệt & Ban hành ✔
                </button>
              )}

              {process.status === 'active' && (canSubmitForReview) && (
                <button
                  onClick={() => handleAction('draft', 'Thu hồi quy trình để hiệu chỉnh')}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white rounded-lg text-xs font-bold"
                >
                  Thu hồi sửa đổi (Revise)
                </button>
              )}
            </div>
          </div>

          {/* Comment / Feedback box */}
          {process.status === 'pending' && (canReview || canApprove) && (
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase block">Nhập ý kiến góp ý / Biên bản phê duyệt</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Góp ý cho biên bản sửa đổi..."
                  className="flex-1 p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. FORMAL PUBLISHED DOCUMENT SHEET CONTAINER (ISO 9001 Standard Template) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden" id="formal-document-card">
        {/* Document Frame Bar */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <FileCheck2 className="w-4 h-4 text-emerald-600" /> TÀI LIỆU QUY TRÌNH ISO 9001 CHÍNH THỨC
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrint}
              className="p-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
              title="Mở trình in ấn của hệ thống"
            >
              <Printer className="w-3.5 h-3.5" /> In bản cứng
            </button>
            <div className="h-4 w-px bg-slate-300"></div>
            <button
              onClick={() => handleExportSimulate('PDF')}
              disabled={isExporting}
              className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              PDF
            </button>
            <button
              onClick={() => handleExportSimulate('Word')}
              disabled={isExporting}
              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-400 rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              Word
            </button>
            <button
              onClick={() => handleExportSimulate('Excel')}
              disabled={isExporting}
              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              {isExporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Excel"}
            </button>
          </div>
        </div>

        {/* Paper Document Body */}
        <div className="p-10 space-y-8 bg-white dark:bg-slate-900 border-4 border-slate-100 dark:border-slate-950 max-w-4xl mx-auto my-4 text-xs shadow-inner font-sans text-slate-900 dark:text-slate-100 print:p-0 print:border-none print:shadow-none" id="iso-print-container">
          
          {/* DOCUMENT HEADER */}
          <div className="text-center space-y-4 pt-12 pb-24 print:pt-4 print:break-after-page">
            <h1 className="text-sm font-bold uppercase">{companyName.toUpperCase()}</h1>
            <div className="space-y-4 mt-24 pt-12">
              <h2 className="text-2xl font-bold uppercase text-slate-900 dark:text-white leading-relaxed">
                QUY TRÌNH<br />{process.name.toUpperCase()}
              </h2>
              <p className="text-sm font-medium italic mt-8">
                (Ban hành kèm theo Quyết định số {process.decisionNumber || '____/2025/QĐ-SV'}<br />
                {process.decisionDate || 'ngày ___ tháng ___ năm 2025'})
              </p>
            </div>
            <div className="mt-32 pt-32 text-sm italic font-medium">
              TP. Hồ Chí Minh, {process.decisionDate || 'ngày ___ tháng ___ năm ____'}
            </div>
          </div>

          {/* PAGE BREAK (Simulation) */}
          <div className="h-px w-full bg-slate-200 dark:bg-slate-700 my-12 print:hidden"></div>

          {/* MỤC LỤC */}
          <div className="space-y-6 page-break-before print:break-before-page print:break-after-page">
            <h3 className="font-bold text-lg text-center uppercase mb-8">Mục lục</h3>
            <div className="space-y-2 text-sm max-w-2xl mx-auto font-medium">
              <div className="flex justify-between font-bold"><span>I. Định nghĩa, mục đích</span><span className="font-normal">03</span></div>
              <div className="flex justify-between pl-6"><span>1. Định nghĩa</span><span className="font-normal">03</span></div>
              <div className="flex justify-between pl-6"><span>2. Mục đích</span><span className="font-normal">03</span></div>
              <div className="flex justify-between font-bold mt-2"><span>II. Phạm vi điều chỉnh, đối tượng áp dụng</span><span className="font-normal">04</span></div>
              <div className="flex justify-between pl-6"><span>1. Phạm vi điều chỉnh</span><span className="font-normal">04</span></div>
              <div className="flex justify-between pl-6"><span>2. Đối tượng áp dụng</span><span className="font-normal">04</span></div>
              <div className="flex justify-between font-bold mt-2"><span>III. Tài liệu tham khảo</span><span className="font-normal">05</span></div>
              <div className="flex justify-between font-bold mt-2"><span>IV. Giải thích từ ngữ, từ viết tắt</span><span className="font-normal">05</span></div>
              <div className="flex justify-between pl-6"><span>1. Giải thích từ ngữ</span><span className="font-normal">05</span></div>
              <div className="flex justify-between pl-6"><span>2. Từ viết tắt</span><span className="font-normal">06</span></div>
              <div className="flex justify-between font-bold mt-2"><span>V. Quy định chung</span><span className="font-normal">06</span></div>
              <div className="flex justify-between pl-6"><span>1. Nguyên tắc chung</span><span className="font-normal">06</span></div>
              <div className="flex justify-between pl-6"><span>2. Trách nhiệm</span><span className="font-normal">06</span></div>
              <div className="flex justify-between font-bold mt-2"><span>VI. Nội dung quy trình</span><span className="font-normal">07</span></div>
              <div className="flex justify-between pl-6"><span>1. Lưu đồ</span><span className="font-normal">07</span></div>
              <div className="flex justify-between pl-6"><span>2. Diễn giải lưu đồ</span><span className="font-normal">08</span></div>
              <div className="flex justify-between font-bold mt-2"><span>VII. Biểu mẫu</span><span className="font-normal">09</span></div>
              <div className="flex justify-between font-bold mt-2"><span>VIII. Quản lý phiên bản</span><span className="font-normal">09</span></div>
            </div>
          </div>

          <div className="h-px w-full bg-slate-200 dark:bg-slate-700 my-12 print:hidden"></div>

          {/* I. ĐỊNH NGHĨA, MỤC ĐÍCH */}
          <div className="space-y-3 print:break-before-page">
            <h3 className="font-bold text-sm uppercase">I. Định nghĩa, mục đích</h3>
            <div className="pl-5 space-y-3 text-sm leading-relaxed text-justify whitespace-pre-wrap">
              <h4 className="font-bold">1. Định nghĩa</h4>
              {process.definitionsList && process.definitionsList.length > 0 && process.definitionsList[0] !== '' ? (
                <ul className="list-disc pl-5 space-y-1.5">
                  {process.definitionsList.filter(d => d.trim()).map((def, idx) => (
                    <li key={idx}>{def}</li>
                  ))}
                </ul>
              ) : (
                <p>{process.definitions || `Quy trình ${process.name} là hệ thống các bước tiêu chuẩn được thiết lập nhằm ${process.description}`}</p>
              )}
              
              <h4 className="font-bold">2. Mục đích</h4>
              {process.purposeList && process.purposeList.length > 0 && process.purposeList[0] !== '' ? (
                <ul className="list-disc pl-5 space-y-1.5">
                  {process.purposeList.filter(p => p.trim()).map((purp, idx) => (
                    <li key={idx}>{purp}</li>
                  ))}
                </ul>
              ) : (
                <p>{process.purpose || `Quy trình của ${companyName} được ban hành nhằm chuẩn hóa quá trình ${process.name.toLowerCase()}, đảm bảo chất lượng, hiệu quả công việc và tuân thủ các tiêu chuẩn quản lý.`}</p>
              )}
            </div>
          </div>

          {/* II. PHẠM VI ĐIỀU CHỈNH */}
          <div className="space-y-3 mt-6">
            <h3 className="font-bold text-sm uppercase">II. Phạm vi điều chỉnh, đối tượng áp dụng</h3>
            <div className="pl-5 space-y-3 text-sm leading-relaxed text-justify whitespace-pre-wrap">
              <h4 className="font-bold">1. Phạm vi điều chỉnh</h4>
              {process.scopeAppliesTo || process.scopeContent ? (
                <table className="w-full border-collapse border border-slate-300 dark:border-slate-700 text-sm mt-2">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800">
                      <th className="border border-slate-300 dark:border-slate-700 p-2 font-bold text-left w-1/3">Áp dụng cho</th>
                      <th className="border border-slate-300 dark:border-slate-700 p-2 font-bold text-left">Nội dung</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-300 dark:border-slate-700 p-2">{process.scopeAppliesTo}</td>
                      <td className="border border-slate-300 dark:border-slate-700 p-2">{process.scopeContent}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p>{process.scope || `Quy trình này quy định các nguyên tắc, trình tự thực hiện và tiêu chuẩn liên quan đến ${process.name.toLowerCase()} trong phạm vi ${companyName}.`}</p>
              )}
              
              <h4 className="font-bold">2. Đối tượng áp dụng</h4>
              {process.targetAudienceList && process.targetAudienceList.length > 0 && process.targetAudienceList[0].object ? (
                <table className="w-full border-collapse border border-slate-300 dark:border-slate-700 text-sm mt-2">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800">
                      <th className="border border-slate-300 dark:border-slate-700 p-2 font-bold text-left w-1/3">Đối tượng</th>
                      <th className="border border-slate-300 dark:border-slate-700 p-2 font-bold text-left">Trách nhiệm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {process.targetAudienceList.filter(item => item.object || item.responsibility).map((item, idx) => (
                      <tr key={idx}>
                        <td className="border border-slate-300 dark:border-slate-700 p-2">{item.object}</td>
                        <td className="border border-slate-300 dark:border-slate-700 p-2">{item.responsibility}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>{process.targetAudience || `Toàn bộ nhân sự thuộc ${process.department}, các bộ phận liên quan và các cá nhân có trách nhiệm thực hiện hoặc phối hợp thực hiện theo quy trình này.`}</p>
              )}
            </div>
          </div>

          {/* III. TÀI LIỆU THAM KHẢO */}
          <div className="space-y-3 mt-6">
            <h3 className="font-bold text-sm uppercase">III. Tài liệu tham khảo</h3>
            <div className="pl-5 space-y-2 text-sm leading-relaxed text-justify whitespace-pre-wrap">
              {process.references ? (
                <p>{process.references}</p>
              ) : (
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Sổ tay văn hóa và quy chế quản lý nội bộ của Công ty.</li>
                  <li>Bộ tiêu chuẩn chất lượng ISO 9001:2015.</li>
                  <li>Các quy định của pháp luật hiện hành có liên quan.</li>
                </ul>
              )}
            </div>
          </div>

          {/* IV. GIẢI THÍCH TỪ NGỮ */}
          <div className="space-y-3 mt-6">
            <h3 className="font-bold text-sm uppercase">IV. Giải thích từ ngữ, từ viết tắt</h3>
            <div className="pl-5 space-y-3 text-sm leading-relaxed text-justify whitespace-pre-wrap">
              <h4 className="font-bold">1. Giải thích từ ngữ</h4>
              {process.termList && process.termList.length > 0 && process.termList[0].term ? (
                <table className="w-full border-collapse border border-slate-300 dark:border-slate-700 text-sm mt-2">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800">
                      <th className="border border-slate-300 dark:border-slate-700 p-2 font-bold text-left w-1/3">Thuật ngữ</th>
                      <th className="border border-slate-300 dark:border-slate-700 p-2 font-bold text-left">Giải nghĩa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {process.termList.filter(item => item.term || item.explanation).map((item, idx) => (
                      <tr key={idx}>
                        <td className="border border-slate-300 dark:border-slate-700 p-2 font-medium">{item.term}</td>
                        <td className="border border-slate-300 dark:border-slate-700 p-2">{item.explanation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : process.terms ? (
                <p>{process.terms}</p>
              ) : (
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>Quy trình:</strong> Chuỗi các hoạt động có liên quan với nhau nhằm biến đổi đầu vào thành đầu ra mong muốn.</li>
                </ul>
              )}
              
              <h4 className="font-bold">2. Từ viết tắt</h4>
              {process.abbreviationList && process.abbreviationList.length > 0 && process.abbreviationList[0].abbreviation ? (
                <table className="w-full border-collapse border border-slate-300 dark:border-slate-700 text-sm mt-2">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800">
                      <th className="border border-slate-300 dark:border-slate-700 p-2 font-bold text-left w-1/3">Từ viết tắt</th>
                      <th className="border border-slate-300 dark:border-slate-700 p-2 font-bold text-left">Ý nghĩa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {process.abbreviationList.filter(item => item.abbreviation || item.meaning).map((item, idx) => (
                      <tr key={idx}>
                        <td className="border border-slate-300 dark:border-slate-700 p-2 font-medium">{item.abbreviation}</td>
                        <td className="border border-slate-300 dark:border-slate-700 p-2">{item.meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : process.abbreviations ? (
                <p>{process.abbreviations}</p>
              ) : (
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>SOP:</strong> Standard Operating Procedure (Quy trình vận hành tiêu chuẩn)</li>
                  <li><strong>SLA:</strong> Service Level Agreement (Cam kết thời gian dịch vụ)</li>
                </ul>
              )}
            </div>
          </div>

          {/* V. QUY ĐỊNH CHUNG */}
          <div className="space-y-3 mt-6">
            <h3 className="font-bold text-sm uppercase">V. Quy định chung</h3>
            <div className="pl-5 space-y-3 text-sm leading-relaxed text-justify whitespace-pre-wrap">
              <h4 className="font-bold">1. Nguyên tắc chung</h4>
              <p>{process.generalPrinciples || `Tuân thủ nghiêm ngặt các bước đã được định nghĩa trong quy trình. Đảm bảo tính minh bạch, chính xác và đúng thời hạn SLA được giao.`}</p>
              <h4 className="font-bold">2. Trách nhiệm</h4>
              {process.responsibilities ? (
                <p>{process.responsibilities}</p>
              ) : (
                <ul className="list-disc pl-5 space-y-1.5">
                  <li><strong>{process.creator || 'Người soạn thảo'}:</strong> Trách nhiệm soạn thảo, cập nhật và duy trì quy trình.</li>
                  <li><strong>{process.reviewer || 'Người kiểm soát'}:</strong> Kiểm soát, review và đóng góp ý kiến tối ưu quy trình.</li>
                  <li><strong>{process.approver || 'Người phê duyệt'}:</strong> Phê duyệt chính thức và chịu trách nhiệm cao nhất về hiệu lực của quy trình.</li>
                </ul>
              )}
            </div>
          </div>

          {/* VI. NỘI DUNG QUY TRÌNH */}
          <div className="space-y-5 mt-6">
            <h3 className="font-bold text-sm uppercase">VI. Nội dung quy trình</h3>
            
            <div className="pl-5 space-y-6">
              <div className="space-y-4">
                <h4 className="font-bold text-sm">1. Lưu đồ</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-800 dark:border-slate-500 text-sm">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 font-bold">
                        <th className="border border-slate-800 dark:border-slate-500 p-2.5 text-center w-12">Bước</th>
                        <th className="border border-slate-800 dark:border-slate-500 p-2.5 w-48">Đơn vị chịu trách nhiệm</th>
                        <th className="border border-slate-800 dark:border-slate-500 p-2.5 text-center">Lưu đồ</th>
                        <th className="border border-slate-800 dark:border-slate-500 p-2.5 text-center w-32">Thời hạn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderedNodes.map((n, idx) => (
                        <tr key={n.id} className="align-middle">
                          <td className="border border-slate-800 dark:border-slate-500 p-2.5 text-center font-bold">{idx + 1}</td>
                          <td className="border border-slate-800 dark:border-slate-500 p-2.5">
                            <span className="font-semibold">{n.assigneeRole}</span><br/>
                            <span className="text-xs text-slate-600 dark:text-slate-400">({n.assigneeDept})</span>
                          </td>
                          <td className="border border-slate-800 dark:border-slate-500 p-2.5 relative">
                            <div className="flex flex-col items-center justify-center min-h-[80px]">
                              <div className="w-3/4 max-w-[200px] border-2 border-slate-800 dark:border-slate-400 bg-white dark:bg-slate-900 p-2 text-center rounded-lg text-xs shadow-sm font-bold uppercase tracking-wide z-10">
                                {n.label}
                              </div>
                              {idx < orderedNodes.length - 1 && (
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-6 w-0.5 bg-slate-800 dark:bg-slate-400 z-0">
                                  <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-r-2 border-slate-800 dark:border-slate-400 transform rotate-45"></div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="border border-slate-800 dark:border-slate-500 p-2.5 text-center font-semibold">
                            {n.sla} giờ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-sm">2. Diễn giải lưu đồ</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-800 dark:border-slate-500 text-sm">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 font-bold">
                        <th className="border border-slate-800 dark:border-slate-500 p-2.5 text-center w-12">Bước</th>
                        <th className="border border-slate-800 dark:border-slate-500 p-2.5 w-40">Đơn vị chịu trách nhiệm</th>
                        <th className="border border-slate-800 dark:border-slate-500 p-2.5">Nội dung công việc thực hiện (Diễn giải cụ thể)</th>
                        <th className="border border-slate-800 dark:border-slate-500 p-2.5 w-32">Thời hạn / Biểu mẫu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 dark:divide-slate-500">
                      {orderedNodes.map((n, idx) => (
                        <tr key={n.id} className="align-top">
                          <td className="border border-slate-800 dark:border-slate-500 p-2.5 text-center font-bold">{idx + 1}</td>
                          <td className="border border-slate-800 dark:border-slate-500 p-2.5">
                            <span className="font-semibold">{n.assigneeRole}</span><br/>
                            <span className="text-xs text-slate-600 dark:text-slate-400">{n.assigneeDept}</span>
                          </td>
                          <td className="border border-slate-800 dark:border-slate-500 p-2.5 space-y-1.5 text-justify">
                            <p className="font-bold uppercase text-xs">{n.label}</p>
                            <p>{n.description}</p>
                            {n.checklist && n.checklist.length > 0 && (
                              <ul className="list-disc pl-5 mt-2 space-y-1">
                                {n.checklist.map((c, i) => <li key={i}>{c}</li>)}
                              </ul>
                            )}
                          </td>
                          <td className="border border-slate-800 dark:border-slate-500 p-2.5 text-center space-y-2">
                            <div className="font-semibold">{n.sla} giờ</div>
                            {n.formId && <div className="text-xs font-bold text-blue-700 dark:text-blue-400">BM-{n.code}</div>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* VII. BIỂU MẪU */}
          <div className="space-y-3 mt-6">
            <h3 className="font-bold text-sm uppercase">VII. Biểu mẫu</h3>
            <div className="pl-5 space-y-1.5 text-sm leading-relaxed">
              <ul className="list-disc pl-5 space-y-1.5">
                {process.nodes.filter(n => n.formId).length > 0 ? (
                  process.nodes.filter(n => n.formId).map((n, idx) => (
                    <li key={idx}><strong>BM-{n.code}</strong>: Biểu mẫu {n.label.toLowerCase()}</li>
                  ))
                ) : (
                  <li>(Không có biểu mẫu đính kèm)</li>
                )}
              </ul>
            </div>
          </div>

          {/* VIII. QUẢN LÝ PHIÊN BẢN */}
          <div className="space-y-4 mt-6">
            <h3 className="font-bold text-sm uppercase">VIII. Quản lý phiên bản</h3>
            <div className="pl-5">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-800 dark:border-slate-500 text-sm">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 font-bold">
                      <th className="border border-slate-800 dark:border-slate-500 p-2.5 text-center w-24">Phiên bản</th>
                      <th className="border border-slate-800 dark:border-slate-500 p-2.5 text-center w-32">Ngày hiệu lực</th>
                      <th className="border border-slate-800 dark:border-slate-500 p-2.5">Nội dung thay đổi</th>
                      <th className="border border-slate-800 dark:border-slate-500 p-2.5 w-36">Đơn vị chủ trì</th>
                      <th className="border border-slate-800 dark:border-slate-500 p-2.5 w-36">Người phê duyệt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 dark:divide-slate-500">
                    {(process.changelog || []).map((log, idx) => (
                      <tr key={idx} className="align-top">
                        <td className="border border-slate-800 dark:border-slate-500 p-2.5 text-center font-bold">{log.version}</td>
                        <td className="border border-slate-800 dark:border-slate-500 p-2.5 text-center">{log.date}</td>
                        <td className="border border-slate-800 dark:border-slate-500 p-2.5">{log.description}</td>
                        <td className="border border-slate-800 dark:border-slate-500 p-2.5 text-center">{log.author}</td>
                        <td className="border border-slate-800 dark:border-slate-500 p-2.5 text-center">{process.approver || 'Tổng Giám đốc'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
