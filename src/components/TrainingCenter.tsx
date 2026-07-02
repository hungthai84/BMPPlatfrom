import React, { useState } from "react";
import { Process, QuizQuestion } from "../types";
import { 
  BookOpen, Sparkles, Award, FileCheck2, ChevronRight, CheckCircle2, 
  HelpCircle, AlertCircle, Play, Check, ShieldAlert, RefreshCw, Printer 
} from "lucide-react";

interface TrainingCenterProps {
  processes: Process[];
  currentUserRole: string;
}

export default function TrainingCenter({ processes, currentUserRole }: TrainingCenterProps) {
  // Only train on processes that have nodes
  const activeProcesses = processes.filter(p => p.nodes && p.nodes.length > 0);
  
  const [selectedProcId, setSelectedProcId] = useState<string>(
    activeProcesses.length > 0 ? activeProcesses[0].id : ""
  );

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const selectedProcess = activeProcesses.find(p => p.id === selectedProcId);

  // AI Quiz generator
  const handleStartQuiz = async () => {
    if (!selectedProcess) return;
    setIsGeneratingQuiz(true);
    setQuizQuestions([]);
    setUserAnswers({});
    setQuizSubmitted(false);

    try {
      const response = await fetch("/api/ai/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          processName: selectedProcess.name,
          department: selectedProcess.department,
          steps: selectedProcess.nodes.map(n => ({
            code: n.code,
            name: n.label,
            role: n.assigneeRole,
            sla: n.sla,
            risk: n.sop?.risks || "N/A"
          }))
        })
      });
      const data = await response.json();
      
      if (Array.isArray(data.questions)) {
        setQuizQuestions(data.questions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleSelectAnswer = (questionIdx: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const handleSubmitQuiz = () => {
    if (quizQuestions.length === 0) return;
    
    let correctCount = 0;
    quizQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    setQuizScore(correctCount);
    setQuizSubmitted(true);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[720px]" id="training-center-container">
      {/* LEFT COLUMN: ACTIVE PROCESSES SELECTION & COMPLIANCE STUDY */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between" id="training-sidebar">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Đào Tạo & Kiểm Tra Quy Trình</h3>
            <p className="text-[11px] text-slate-500">Chọn quy trình nghiệp vụ đã ban hành để nghiên cứu tài liệu vận hành:</p>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[220px]">
            {activeProcesses.map(p => {
              const isSelected = p.id === selectedProcId;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedProcId(p.id);
                    setQuizQuestions([]);
                    setQuizSubmitted(false);
                  }}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${isSelected ? 'bg-indigo-50 border-indigo-500 text-indigo-900 dark:bg-indigo-950/40 dark:border-indigo-500 dark:text-white' : 'bg-slate-50 border-slate-200 hover:border-slate-400 dark:bg-slate-800/40 dark:border-slate-800 text-slate-700 dark:text-slate-300'}`}
                >
                  <h4 className="text-xs font-bold truncate">{p.name}</h4>
                  <div className="flex justify-between text-[9px] text-slate-400 mt-1.5 font-bold">
                    <span>Mã: {p.code}</span>
                    <span className="uppercase text-blue-600 dark:text-blue-400">{p.status}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Training study panel */}
          {selectedProcess && (
            <div className="border border-slate-150 dark:border-slate-800 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/20 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-blue-500" /> Cẩm nang tự học hành động:
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Quy trình gồm <strong>{selectedProcess.nodes.length} bước</strong> liên kết chặt chẽ. Đọc kỹ cam kết SLA và checklist của từng bộ phận trước khi bắt đầu bài thi trắc nghiệm năng lực.
              </p>

              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                {selectedProcess.nodes.map((n, idx) => (
                  <div key={idx} className="text-[10px] bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{idx + 1}. {n.label}</span>
                    <span className="text-blue-600 font-bold shrink-0">{n.assigneeRole}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Start Quiz AI controller trigger */}
        {selectedProcess && (
          <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-xl p-4 space-y-3 shadow-md border border-indigo-800 mt-4">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-bold tracking-widest uppercase">KHAO THÍ NĂNG LỰC</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Hệ thống sẽ tổng hợp SLA, KPI, ma trận RACI và rủi ro của quy trình này để sinh bộ đề thi 3 câu hỏi trắc nghiệm kiểm tra độ hiểu biết.
            </p>
            <button
              onClick={handleStartQuiz}
              disabled={isGeneratingQuiz}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isGeneratingQuiz ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>Sinh bài thi trắc nghiệm AI <Sparkles className="w-3.5 h-3.5 text-amber-400" /></>
              )}
            </button>
          </div>
        )}
      </div>

      {/* RIGHT TWO COLUMNS: DYNAMIC QUIZ ROOM / CERTIFICATE VIEWER */}
      <div className="col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between overflow-y-auto" id="quiz-room-panel">
        {selectedProcess ? (
          quizQuestions.length > 0 ? (
            /* QUIZ IS ACTIVE OR COMPLETED */
            <div className="space-y-6 flex-1 flex flex-col justify-between h-full" id="quiz-area">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Phòng Khảo Thí Quy Trình Chuẩn ISO</span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <FileCheck2 className="w-5 h-5 text-indigo-500" /> Bài Thi: {selectedProcess.name}
                    </h3>
                  </div>

                  {!quizSubmitted && (
                    <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 font-extrabold text-[10px] rounded-full uppercase animate-pulse">
                      Đang tính giờ
                    </span>
                  )}
                </div>

                {/* Render questions list */}
                <div className="space-y-5">
                  {quizQuestions.map((q, idx) => {
                    const isCorrect = userAnswers[idx] === q.correctAnswer;
                    return (
                      <div key={idx} className="space-y-2 text-xs">
                        <h4 className="font-bold text-slate-800 dark:text-white leading-relaxed">
                          Câu {idx + 1}: {q.question}
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = userAnswers[idx] === oIdx;
                            let btnStyle = "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800/40 dark:border-slate-800 dark:text-slate-300";

                            if (!quizSubmitted && isSelected) {
                              btnStyle = "bg-indigo-50 border-indigo-500 text-indigo-950 dark:bg-indigo-950/40 dark:text-white";
                            } else if (quizSubmitted) {
                              if (oIdx === q.correctAnswer) {
                                btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold";
                              } else if (isSelected && !isCorrect) {
                                btnStyle = "bg-red-50 border-red-500 text-red-950 dark:bg-red-950/40 dark:text-red-300";
                              }
                            }

                            return (
                              <button
                                key={oIdx}
                                disabled={quizSubmitted}
                                onClick={() => handleSelectAnswer(idx, oIdx)}
                                className={`p-3 border text-left rounded-xl transition-all text-xs flex items-center gap-2 ${btnStyle} ${!quizSubmitted ? 'hover:bg-slate-100 dark:hover:bg-slate-800' : ''}`}
                              >
                                <span className="font-mono font-bold text-slate-400">{String.fromCharCode(65 + oIdx)}.</span>
                                <span className="flex-1">{opt}</span>
                                {quizSubmitted && oIdx === q.correctAnswer && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quiz submission and results */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                {!quizSubmitted ? (
                  <div className="flex justify-between items-center">
                    <p className="text-[11px] text-slate-400">Hãy tích đủ câu trả lời trước khi gửi bài chấm tự động.</p>
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(userAnswers).length < quizQuestions.length}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
                    >
                      Nộp bài & Chấm điểm
                    </button>
                  </div>
                ) : (
                  /* QUIZ COMPLETED: RESULTS PANEL */
                  <div className="space-y-6" id="quiz-results">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white">Kết quả thi trắc nghiệm nghiệp vụ:</h4>
                        <p className="text-slate-500 text-[11px]">Đạt chuẩn ISO yêu cầu trả lời đúng <strong>3/3 câu hỏi</strong> liên tục.</p>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-black font-display text-blue-600 dark:text-blue-400">{quizScore}/3</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${quizScore === 3 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {quizScore === 3 ? 'ĐẠT YÊU CẦU' : 'CHƯA ĐẠT'}
                        </span>
                      </div>
                    </div>

                    {/* DIGITAL CERTIFICATE GENERATION */}
                    {quizScore === 3 ? (
                      <div className="p-6 border-4 border-double border-amber-400 bg-amber-50/20 rounded-2xl space-y-4 text-center max-w-lg mx-auto relative overflow-hidden shadow-md" id="digital-certificate">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
                        
                        <div className="flex flex-col items-center gap-1">
                          <Award className="w-12 h-12 text-amber-500 animate-bounce" />
                          <span className="text-[10px] tracking-widest font-bold text-amber-600 dark:text-amber-400 uppercase">ISO COMPLIANCE ASSURANCE</span>
                          <h4 className="text-sm font-black text-slate-800 dark:text-white mt-1">CHỨNG CHỈ ĐÀO TẠO HOÀN THÀNH QUY TRÌNH</h4>
                        </div>

                        <div className="space-y-1.5 py-2">
                          <p className="text-[11px] text-slate-500">Hệ thống chứng nhận thành viên vận hành:</p>
                          <p className="text-base font-extrabold text-indigo-700 dark:text-indigo-400">Nhân viên Chuyên trách Vận hành</p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 px-6 leading-relaxed">
                            Đã nghiên cứu xuất sắc và vượt qua kỳ thi sát hạch thực hành chuẩn SOP của quy trình nghiệp vụ:
                          </p>
                          <p className="font-extrabold text-xs text-slate-800 dark:text-white uppercase">"{selectedProcess.name}"</p>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-dashed border-slate-200 dark:border-slate-800 pt-3">
                          <span>Mã chứng chỉ: CERT-{selectedProcess.code}</span>
                          <span>Ngày cấp: {new Date().toISOString().split('T')[0]}</span>
                        </div>

                        <div className="pt-2 flex justify-center">
                          <button
                            onClick={handlePrintCertificate}
                            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg flex items-center gap-1 shadow"
                          >
                            <Printer className="w-3.5 h-3.5" /> In chứng chỉ số
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl space-y-2 text-center text-xs text-red-800 dark:text-red-300">
                        <ShieldAlert className="w-8 h-8 text-red-500 mx-auto" />
                        <h5 className="font-bold">Độ hiểu biết quy trình chưa đạt tuyệt đối!</h5>
                        <p className="text-[11px]">Chuẩn chất lượng ISO yêu cầu nhân viên phải nắm vững 100% nghiệp vụ để tránh rủi ro thao tác sai. Hãy ôn luyện lại cẩm nang và thi lại.</p>
                        <button
                          onClick={handleStartQuiz}
                          className="mt-2 px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg"
                        >
                          Thi lại ngay
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* QUIZ IS NOT YET STARTED */
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-24 space-y-3" id="quiz-intro">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 text-2xl">
                📝
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-white text-sm">Trung Tâm Khảo Thí Quy Chuẩn Doanh Nghiệp</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Thiết lập đào tạo và sát hạch nghiệp vụ nội bộ tự động. Nhấp vào nút <strong>"Sinh bài thi trắc nghiệm AI"</strong> ở góc dưới bên trái để Gemini AI tự biên soạn đề thi thông minh riêng cho quy trình này.
                </p>
              </div>
            </div>
          )
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-24">
            <HelpCircle className="w-12 h-12 mb-3" />
            <p className="text-sm font-bold">Hãy chọn một quy trình hợp lệ ở cột bên trái để bắt đầu đào tạo.</p>
          </div>
        )}
      </div>
    </div>
  );
}
