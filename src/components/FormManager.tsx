import React, { useState } from "react";
import { DynamicForm, FormField } from "../types";
import { 
  FileSpreadsheet, Plus, Trash2, Eye, FormInput, Save, HelpCircle, 
  CheckCircle, PlusCircle, AlertCircle, RefreshCw, Layers 
} from "lucide-react";

interface FormManagerProps {
  forms: DynamicForm[];
  onSaveForms: (updatedForms: DynamicForm[]) => void;
  currentUserRole: string;
}

export default function FormManager({ forms, onSaveForms, currentUserRole }: FormManagerProps) {
  const [selectedFormId, setSelectedFormId] = useState<string>(forms.length > 0 ? forms[0].id : "");
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(true); // Mode toggling: Build vs Preview
  
  // New field builder form state
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<FormField['type']>("text");
  const [newRequired, setNewRequired] = useState(false);
  const [newOptionsRaw, setNewOptionsRaw] = useState(""); // comma-separated options

  // Mock form submission response state
  const [submittedData, setSubmittedData] = useState<any | null>(null);

  const canEdit = currentUserRole !== 'Viewer' && currentUserRole !== 'Approver' && currentUserRole !== 'Reviewer';

  const selectedForm = forms.find(f => f.id === selectedFormId);

  // Form lifecycle: Add Form
  const handleAddNewForm = () => {
    if (!canEdit) return;
    const newForm: DynamicForm = {
      id: `form-new-${Date.now()}`,
      name: `Biểu mẫu Nghiệp vụ Số ${forms.length + 1}`,
      fields: [
        { id: `field-1-${Date.now()}`, label: "Họ và tên nhân sự thực hiện", type: "text", required: true },
        { id: `field-2-${Date.now()}`, label: "Ngày ghi nhận sự vụ", type: "date", required: true }
      ]
    };
    const updated = [...forms, newForm];
    onSaveForms(updated);
    setSelectedFormId(newForm.id);
  };

  // Form lifecycle: Delete Form
  const handleDeleteForm = (formId: string) => {
    if (!canEdit) return;
    if (forms.length <= 1) {
      alert("Hệ thống phải duy trì tối thiểu 1 biểu mẫu nghiệp vụ.");
      return;
    }
    const updated = forms.filter(f => f.id !== formId);
    onSaveForms(updated);
    setSelectedFormId(updated[0].id);
  };

  // Field lifecycle: Add Field
  const handleAddField = () => {
    if (!canEdit || !selectedForm || !newLabel.trim()) return;

    const options = newOptionsRaw.trim() 
      ? newOptionsRaw.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    const newField: FormField = {
      id: `field-${Date.now()}`,
      label: newLabel.trim(),
      type: newType,
      required: newRequired,
      ...(options ? { options } : {})
    };

    const updatedFields = [...selectedForm.fields, newField];
    const updatedForms = forms.map(f => f.id === selectedForm.id ? { ...f, fields: updatedFields } : f);
    
    onSaveForms(updatedForms);
    
    // Reset field builder form
    setNewLabel("");
    setNewType("text");
    setNewRequired(false);
    setNewOptionsRaw("");
  };

  // Field lifecycle: Delete Field
  const handleDeleteField = (fieldId: string) => {
    if (!canEdit || !selectedForm) return;
    const updatedFields = selectedForm.fields.filter(f => f.id !== fieldId);
    const updatedForms = forms.map(f => f.id === selectedForm.id ? { ...f, fields: updatedFields } : f);
    onSaveForms(updatedForms);
  };

  const handleUpdateFormName = (newName: string) => {
    if (!canEdit || !selectedForm) return;
    const updatedForms = forms.map(f => f.id === selectedForm.id ? { ...f, name: newName } : f);
    onSaveForms(updatedForms);
  };

  const handleMockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const entries: any = {};
    formData.forEach((value, key) => {
      entries[key] = value;
    });
    setSubmittedData(entries);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[720px]" id="form-manager-container">
      {/* LEFT COLUMN: LIST OF DYNAMIC FORMS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4" id="form-sidebar-list">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Kho Biểu Mẫu Động</h3>
            <p className="text-[11px] text-slate-500">Thiết kế biểu mẫu số để đính kèm vào các bước workflow:</p>
          </div>
          {canEdit && (
            <button
              onClick={handleAddNewForm}
              className="p-1.5 bg-blue-50 text-blue-600 rounded-lg dark:bg-blue-950 dark:text-blue-400 font-bold hover:scale-105 transition-all text-xs flex items-center gap-0.5"
              title="Tạo biểu mẫu mới"
            >
              <Plus className="w-4 h-4" /> Thêm mới
            </button>
          )}
        </div>

        <div className="space-y-2 overflow-y-auto max-h-[460px]" id="forms-list">
          {forms.map(f => {
            const isSelected = f.id === selectedFormId;
            return (
              <div
                key={f.id}
                onClick={() => {
                  setSelectedFormId(f.id);
                  setSubmittedData(null);
                }}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between group ${isSelected ? 'bg-blue-50 border-blue-500 text-blue-900 dark:bg-blue-950/40 dark:border-blue-500 dark:text-white' : 'bg-slate-50 border-slate-200 hover:border-slate-400 dark:bg-slate-800/40 dark:border-slate-800 text-slate-700 dark:text-slate-300'}`}
              >
                <div className="truncate space-y-1">
                  <h4 className="text-xs font-bold truncate">{f.name}</h4>
                  <span className="text-[10px] text-slate-400 font-semibold block">{f.fields.length} trường thông tin điện tử</span>
                </div>
                {canEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Xóa biểu mẫu "${f.name}"?`)) {
                        handleDeleteForm(f.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 leading-snug flex items-start gap-2">
          <HelpCircle className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
          <p>Mỗi trường dữ liệu được số hóa sẽ lưu trữ trực tiếp cấu trúc JSON đầu vào giúp doanh nghiệp không cần biểu mẫu giấy.</p>
        </div>
      </div>

      {/* RIGHT SIDE: BUILDER / PREVIEW AREA */}
      <div className="col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between" id="form-builder-view">
        {selectedForm ? (
          <div className="flex-1 flex flex-col justify-between h-full space-y-5">
            {/* Header / Mode Toggler */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 gap-4">
              <div className="space-y-1 flex-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Cấu hình mẫu biểu kỹ thuật số</p>
                {canEdit ? (
                  <input
                    type="text"
                    value={selectedForm.name}
                    onChange={(e) => handleUpdateFormName(e.target.value)}
                    className="font-bold text-base text-slate-900 dark:text-white bg-transparent border-b border-dashed border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:outline-none w-full"
                  />
                ) : (
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{selectedForm.name}</h3>
                )}
              </div>

              {/* Build vs Preview Toggler */}
              <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 text-xs shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => setIsPreviewMode(false)}
                  className={`px-3 py-1 rounded-md font-bold transition-all ${!isPreviewMode ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-white shadow-sm' : 'text-slate-500'}`}
                >
                  Thiết kế trường
                </button>
                <button
                  onClick={() => {
                    setIsPreviewMode(true);
                    setSubmittedData(null);
                  }}
                  className={`px-3 py-1 rounded-md font-bold transition-all ${isPreviewMode ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-white shadow-sm' : 'text-slate-500'}`}
                >
                  <Eye className="w-3.5 h-3.5 inline mr-1" /> Xem thử & Điền
                </button>
              </div>
            </div>

            {/* Main Area: Fields Builder or Filler Mockup */}
            <div className="flex-1 overflow-y-auto pr-1 min-h-[360px]" style={{ maxHeight: "420px" }}>
              {!isPreviewMode ? (
                /* 1. BUILDER MODE */
                <div className="space-y-6" id="fields-editor">
                  {/* Field list editor */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Các trường thông tin hiện tại:</h4>
                    <div className="space-y-2">
                      {selectedForm.fields.map((field) => (
                        <div 
                          key={field.id}
                          className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs font-medium"
                        >
                          <div className="space-y-1">
                            <span className="font-bold text-slate-800 dark:text-white">{field.label}</span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
                              <span>Mẫu: {field.type}</span>
                              <span>•</span>
                              <span>{field.required ? "Bắt buộc" : "Tùy chọn"}</span>
                              {field.options && (
                                <>
                                  <span>•</span>
                                  <span>Lựa chọn: {field.options.join(", ")}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {canEdit && (
                            <button
                              onClick={() => handleDeleteField(field.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-white dark:hover:bg-slate-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add Field Section (Fields Builder Form) */}
                  {canEdit && (
                    <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/20 space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        <PlusCircle className="w-4 h-4 text-blue-600" /> Thêm trường dữ liệu mới
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold uppercase">Tên nhãn / Câu hỏi</label>
                          <input 
                            type="text"
                            placeholder="VD: Mô tả sự vụ..."
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-slate-800 dark:text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 font-bold uppercase">Loại dữ liệu nhập</label>
                          <select
                            value={newType}
                            onChange={(e) => setNewType(e.target.value as FormField['type'])}
                            className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-slate-800 dark:text-white"
                          >
                            <option value="text">Chữ viết (Text)</option>
                            <option value="number">Số lượng (Number)</option>
                            <option value="date">Ngày tháng (Date)</option>
                            <option value="dropdown">Lựa chọn (Dropdown)</option>
                            <option value="file">Đính kèm file (File Upload)</option>
                            <option value="checkbox">Hộp chọn (Checkbox)</option>
                          </select>
                        </div>

                        <div className="space-y-1 flex flex-col justify-end">
                          <label className="flex items-center gap-2 cursor-pointer py-2">
                            <input 
                              type="checkbox"
                              checked={newRequired}
                              onChange={(e) => setNewRequired(e.target.checked)}
                              className="rounded border-slate-300 text-blue-600"
                            />
                            <span className="font-bold text-slate-700 dark:text-slate-300">Trường bắt buộc?</span>
                          </label>
                        </div>
                      </div>

                      {/* Dropdown Options builder */}
                      {newType === "dropdown" && (
                        <div className="space-y-1 text-xs">
                          <label className="text-[10px] text-slate-400 font-bold uppercase">Danh sách lựa chọn (Phân cách bằng dấu phẩy)</label>
                          <input 
                            type="text"
                            placeholder="Hài lòng, Bình thường, Rất thất vọng..."
                            value={newOptionsRaw}
                            onChange={(e) => setNewOptionsRaw(e.target.value)}
                            className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg text-slate-800 dark:text-white"
                          />
                        </div>
                      )}

                      <button
                        onClick={handleAddField}
                        disabled={!newLabel.trim()}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs disabled:opacity-50 transition-colors shadow-sm"
                      >
                        Thêm trường này +
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* 2. INTERACTIVE FILL PREVIEW MODE */
                <form onSubmit={handleMockSubmit} className="space-y-4 max-w-lg mx-auto" id="form-fill-mock">
                  {selectedForm.fields.map((field) => (
                    <div key={field.id} className="space-y-1 text-xs">
                      <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        {field.label}
                        {field.required && <span className="text-red-500">*</span>}
                      </label>

                      {field.type === "text" && (
                        <input 
                          type="text"
                          required={field.required}
                          name={field.label}
                          placeholder="Nhập câu trả lời..."
                          className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}

                      {field.type === "number" && (
                        <input 
                          type="number"
                          required={field.required}
                          name={field.label}
                          placeholder="VD: 500000"
                          className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-white focus:outline-none"
                        />
                      )}

                      {field.type === "date" && (
                        <input 
                          type="date"
                          required={field.required}
                          name={field.label}
                          className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-white focus:outline-none"
                        />
                      )}

                      {field.type === "dropdown" && (
                        <select 
                          required={field.required}
                          name={field.label}
                          className="w-full p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-white focus:outline-none"
                        >
                          <option value="">-- Chọn một giá trị --</option>
                          {field.options?.map((opt, oIdx) => (
                            <option key={oIdx} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}

                      {field.type === "file" && (
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl text-center cursor-pointer hover:border-blue-500">
                          <input 
                            type="file" 
                            required={field.required}
                            name={field.label}
                            className="hidden" 
                            id={`file-input-${field.id}`}
                            onChange={(e) => {
                              const fileName = e.target.files?.[0]?.name;
                              if (fileName) {
                                alert(`Đã đính kèm tệp nháp: ${fileName}`);
                              }
                            }}
                          />
                          <label htmlFor={`file-input-${field.id}`} className="cursor-pointer space-y-1 block">
                            <span className="font-bold text-blue-600 block">Chọn tệp đính kèm</span>
                            <span className="text-[10px] text-slate-400 block">Kéo thả tệp PDF, DOCX, PNG hoặc chọn trực tiếp (Max: 10MB)</span>
                          </label>
                        </div>
                      )}

                      {field.type === "checkbox" && (
                        <label className="flex items-center gap-2.5 py-1.5 cursor-pointer">
                          <input 
                            type="checkbox"
                            name={field.label}
                            value="yes"
                            className="rounded border-slate-300 text-blue-600 focus:ring-0"
                          />
                          <span className="font-semibold text-slate-600 dark:text-slate-300">Tôi đồng ý điều khoản</span>
                        </label>
                      )}
                    </div>
                  ))}

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg"
                    >
                      Kiểm thử gửi biểu mẫu
                    </button>
                  </div>
                </form>
              )}

              {/* Display mock output on fill submit */}
              {isPreviewMode && submittedData && (
                <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2 text-xs">
                  <h4 className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" /> Kết quả kiểm thử thành công (Mock JSON Payload):
                  </h4>
                  <pre className="p-3 bg-slate-900 text-slate-300 rounded-lg overflow-x-auto text-[10px] font-mono whitespace-pre">
                    {JSON.stringify(submittedData, null, 2)}
                  </pre>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Payload này sẽ được tự động đính kèm vào ticket hoặc chuyển tiếp tới API Call tiếp theo trong luồng.</p>
                </div>
              )}
            </div>

            {/* Status Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Mọi chỉnh sửa được liên kết trực tiếp với các bước trong quy trình.
              </span>
              <span className="font-bold font-mono">ID: {selectedForm.id}</span>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-24">
            <Layers className="w-12 h-12 mb-3" />
            <p className="text-sm font-bold">Vui lòng chọn hoặc thêm biểu mẫu mới ở cột trái để cấu hình.</p>
          </div>
        )}
      </div>
    </div>
  );
}
