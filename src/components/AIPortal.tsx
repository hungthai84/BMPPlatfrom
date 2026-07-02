import React, { useState, useRef, useEffect } from "react";
import { Process } from "../types";
import { 
  Sparkles, Send, Bot, User, HelpCircle, RefreshCw, ChevronRight, 
  Search, ShieldAlert, Zap, BookOpen 
} from "lucide-react";

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  isFallback?: boolean;
}

interface AIPortalProps {
  processes: Process[];
}

const QUICK_PROMPTS = [
  "SLA tối đa của quy trình Tuyển dụng nhân sự là bao lâu?",
  "Bước đầu tiên của quy trình Phê duyệt ngân sách cần biểu mẫu nào?",
  "Rủi ro lớn nhất và biện pháp kiểm soát trong quy trình Chăm sóc khách hàng?",
  "Ai chịu trách nhiệm chính phê duyệt các tài liệu quy trình ban hành?"
];

export default function AIPortal({ processes }: AIPortalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Xin chào! Tôi là Trợ lý AI Chuyên gia Vận hành chuẩn ISO 9001 của doanh nghiệp. Bạn có thể hỏi tôi bất kỳ thông tin nào liên quan đến sơ đồ luồng, thời gian SLA, trách nhiệm RACI, checklist hoặc biểu mẫu nghiệp vụ trong hệ thống.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/search-process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: textToSend,
          processes: processes.map(p => ({
            code: p.code,
            name: p.name,
            department: p.department,
            status: p.status,
            description: p.description,
            nodes: p.nodes.map(n => ({
              code: n.code,
              name: n.label,
              role: n.assigneeRole,
              dept: n.assigneeDept,
              sla: n.sla,
              description: n.description,
              checklist: n.checklist,
              risk: n.sop?.risks,
              control: n.sop?.controls
            }))
          }))
        })
      });

      const data = await response.json();

      const aiMsg: Message = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: data.answer || "Rất tiếc, tôi không thể xử lý câu trả lời ngay lúc này.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFallback: data.fallback
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: `msg-${Date.now()}-ai-error`,
        sender: 'ai',
        text: "Hệ thống gặp sự cố kết nối với AI. Bạn vui lòng thử lại sau.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[720px]" id="ai-portal-container">
      {/* LEFT COLUMN: GUIDELINES & QUICK PROMPTS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between" id="ai-sidebar">
        <div className="space-y-5">
          <div className="space-y-2">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> Tra Cứu Quy Trình Thông Minh
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Trợ lý AI sử dụng thuật toán tìm kiếm ngữ nghĩa kết hợp dữ liệu sơ đồ thực tế để trả lời chính xác, trích dẫn đúng mã tài liệu ISO và chỉ dẫn thao tác.
            </p>
          </div>

          <div className="border border-slate-150 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/20 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <BookOpen className="w-4 h-4 text-blue-500" /> Chủ đề bạn có thể hỏi:
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-blue-500" /> Cam kết dịch vụ SLA (Giờ xử lý)
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-blue-500" /> Phân công RACI (Bộ phận phụ trách)
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-blue-500" /> Biểu mẫu số và checklist bắt buộc
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-blue-500" /> Rủi ro thao tác & biện pháp phòng ngừa
              </li>
            </ul>
          </div>

          {/* Quick Prompts List */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gợi ý câu hỏi nhanh:</h4>
            <div className="space-y-1.5" id="quick-prompts">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
                  className="w-full text-left p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-150 dark:border-slate-800 rounded-lg text-[11px] text-slate-600 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-700 hover:bg-slate-100/50 font-medium transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Portal disclaimer */}
        <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 text-[10px] text-slate-400 leading-snug flex items-center gap-2">
          <Bot className="w-4 h-4 shrink-0 text-indigo-500" />
          <span>Dữ liệu huấn luyện tự động cập nhật ngay khi bạn sửa đổi luồng hoặc SOP.</span>
        </div>
      </div>

      {/* RIGHT TWO COLUMNS: CHAT SCREEN WINDOW */}
      <div className="col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-sm h-full" id="ai-chat-window">
        {/* Chat Window Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-800 dark:text-white">Trợ Lý Thiết Kế & Tra Cứu Quy Trình AI</h4>
              <span className="text-[9px] text-emerald-600 font-bold tracking-wider uppercase">Sẵn sàng phản hồi trực tuyến</span>
            </div>
          </div>
        </div>

        {/* Chat Conversation Scroll */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4" id="chat-scroller">
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <div 
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isAI ? 'self-start' : 'self-end flex-row-reverse ml-auto'}`}
              >
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${isAI ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'bg-blue-600 text-white'}`}>
                  {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Message Body Bubble */}
                <div className="space-y-1">
                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${isAI ? 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-150 dark:border-slate-800 rounded-tl-none' : 'bg-blue-600 text-white rounded-tr-none'}`}>
                    {msg.text}

                    {/* Offline Fallback Alert indicator */}
                    {isAI && msg.isFallback && (
                      <div className="mt-3.5 pt-2 border-t border-slate-250 dark:border-slate-700 text-[10px] text-slate-400 italic flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Câu trả lời mô phỏng do thiếu API Key hoặc lỗi kết nối mạng.</span>
                      </div>
                    )}
                  </div>
                  <span className={`text-[9px] text-slate-400 block px-1 ${isAI ? 'text-left' : 'text-right font-medium'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex gap-3 max-w-[80%] self-start" id="ai-loading-bubble">
              <div className="w-8 h-8 rounded-lg shrink-0 bg-indigo-100 text-indigo-700 flex items-center justify-center dark:bg-indigo-950 dark:text-indigo-300">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 rounded-tl-none flex items-center gap-2 text-xs text-slate-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>AI đang rà soát kho cơ sở dữ liệu ISO...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="flex gap-2 items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1 focus-within:ring-2 focus-within:ring-blue-500 shadow-inner"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Gõ câu hỏi tra cứu quy trình ở đây..."
              className="flex-1 bg-transparent border-none outline-none py-2 text-xs text-slate-700 dark:text-slate-300 focus:ring-0"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 transition-colors shadow"
              title="Gửi tin nhắn"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
