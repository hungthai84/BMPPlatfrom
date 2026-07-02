import React, { useState } from 'react';
import { Process } from '../types';
import { Save, Plus, Trash2, FileText } from 'lucide-react';
import { Dialog, DialogTitle, DialogContent, Button, Box, Typography, Chip } from '@mui/material';
import ReferenceDocuments from './ReferenceDocuments';

interface ProcessGeneralInfoProps {
  processes: Process[];
  process: Process;
  onSaveProcess: (p: Process) => void;
  currentUserRole: string;
}

export default function ProcessGeneralInfo({ processes, process, onSaveProcess, currentUserRole }: ProcessGeneralInfoProps) {
  const [openRefDialog, setOpenRefDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<Process>>({
    name: process.name || '',
    department: process.department || '',
    decisionNumber: process.decisionNumber || '',
    decisionDate: process.decisionDate || '',
    definitionsList: process.definitionsList || [''],
    purposeList: process.purposeList || [''],
    scopeAppliesTo: process.scopeAppliesTo || '',
    scopeContent: process.scopeContent || '',
    targetAudienceList: process.targetAudienceList || [{ object: '', responsibility: '' }],
    referencesList: process.referencesList || [],
    termList: process.termList || [{ term: '', explanation: '' }],
    abbreviationList: process.abbreviationList || [{ abbreviation: '', meaning: '' }],
    generalPrinciples: process.generalPrinciples || '',
    responsibilities: process.responsibilities || '',
  });

  const isEditable = currentUserRole !== "Viewer";

  const handleChange = (field: keyof Process, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: keyof Process, index: number, value: string) => {
    const newList = [...(formData[field] as string[])];
    newList[index] = value;
    handleChange(field, newList);
  };

  const addArrayItem = (field: keyof Process) => {
    handleChange(field, [...(formData[field] as string[]), '']);
  };

  const removeArrayItem = (field: keyof Process, index: number) => {
    const newList = [...(formData[field] as string[])];
    newList.splice(index, 1);
    handleChange(field, newList);
  };

  const handleObjectArrayChange = (field: keyof Process, index: number, key: string, value: string) => {
    const newList = [...(formData[field] as any[])];
    newList[index] = { ...newList[index], [key]: value };
    handleChange(field, newList);
  };

  const addObjectArrayItem = (field: keyof Process, emptyObj: any) => {
    handleChange(field, [...(formData[field] as any[]), emptyObj]);
  };

  const removeObjectArrayItem = (field: keyof Process, index: number) => {
    const newList = [...(formData[field] as any[])];
    newList.splice(index, 1);
    handleChange(field, newList);
  };

  const handleSave = () => {
    onSaveProcess({
      ...process,
      ...formData,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-5xl mx-auto">
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Thông Tin Chung</h2>
          <p className="text-sm text-slate-500">Thiết lập các thông tin cơ bản cho tài liệu quy trình</p>
        </div>
        {isEditable && (
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" /> Lưu thông tin
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Phòng ban</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                disabled={!isEditable}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 disabled:opacity-60"
                placeholder="VD: Phòng Hành chính..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tên quy trình</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={!isEditable}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 disabled:opacity-60"
                placeholder="VD: Quy trình Tuyển dụng..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ban hành kèm theo Quyết định số</label>
              <input
                type="text"
                value={formData.decisionNumber}
                onChange={(e) => handleChange('decisionNumber', e.target.value)}
                disabled={!isEditable}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 disabled:opacity-60"
                placeholder="VD: 01/2025/QĐ-SV"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ngày quyết định</label>
              <input
                type="text"
                value={formData.decisionDate}
                onChange={(e) => handleChange('decisionDate', e.target.value)}
                disabled={!isEditable}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 disabled:opacity-60"
                placeholder="VD: ngày 10 tháng 01 năm 2025"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-6">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 uppercase text-sm tracking-wide">I. Định nghĩa, mục đích</h3>
          
          <div className="space-y-4 pl-4 border-l-2 border-indigo-100 dark:border-indigo-900/50">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex justify-between items-center">
              1. Định nghĩa
              {isEditable && (
                <button onClick={() => addArrayItem('definitionsList')} className="text-indigo-600 hover:text-indigo-700 p-1">
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </label>
            {(formData.definitionsList || []).map((def, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  value={def}
                  onChange={(e) => handleArrayChange('definitionsList', idx, e.target.value)}
                  disabled={!isEditable}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 disabled:opacity-60"
                  placeholder={`Định nghĩa ${idx + 1}...`}
                />
                {isEditable && (
                  <button onClick={() => removeArrayItem('definitionsList', idx)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-4 pl-4 border-l-2 border-indigo-100 dark:border-indigo-900/50">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex justify-between items-center">
              2. Mục đích
              {isEditable && (
                <button onClick={() => addArrayItem('purposeList')} className="text-indigo-600 hover:text-indigo-700 p-1">
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </label>
            {(formData.purposeList || []).map((purp, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  value={purp}
                  onChange={(e) => handleArrayChange('purposeList', idx, e.target.value)}
                  disabled={!isEditable}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 disabled:opacity-60"
                  placeholder={`Mục đích ${idx + 1}...`}
                />
                {isEditable && (
                  <button onClick={() => removeArrayItem('purposeList', idx)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-6">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 uppercase text-sm tracking-wide">II. Phạm vi điều chỉnh, đối tượng áp dụng</h3>
          
          <div className="space-y-2 pl-4 border-l-2 border-indigo-100 dark:border-indigo-900/50">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">1. Phạm vi điều chỉnh</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                value={formData.scopeAppliesTo}
                onChange={(e) => handleChange('scopeAppliesTo', e.target.value)}
                disabled={!isEditable}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 disabled:opacity-60"
                placeholder="Áp dụng cho..."
              />
              <input
                value={formData.scopeContent}
                onChange={(e) => handleChange('scopeContent', e.target.value)}
                disabled={!isEditable}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 disabled:opacity-60"
                placeholder="Nội dung điều chỉnh..."
              />
            </div>
          </div>

          <div className="space-y-4 pl-4 border-l-2 border-indigo-100 dark:border-indigo-900/50">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex justify-between items-center">
              2. Đối tượng áp dụng
              {isEditable && (
                <button onClick={() => addObjectArrayItem('targetAudienceList', { object: '', responsibility: '' })} className="text-indigo-600 hover:text-indigo-700 p-1">
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </label>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 mb-1 px-1">
                <span className="text-xs font-semibold text-slate-500">Đối tượng</span>
                <span className="text-xs font-semibold text-slate-500">Trách nhiệm</span>
              </div>
              {(formData.targetAudienceList || []).map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <input
                      value={item.object}
                      onChange={(e) => handleObjectArrayChange('targetAudienceList', idx, 'object', e.target.value)}
                      disabled={!isEditable}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 disabled:opacity-60"
                      placeholder="Đối tượng..."
                    />
                    <input
                      value={item.responsibility}
                      onChange={(e) => handleObjectArrayChange('targetAudienceList', idx, 'responsibility', e.target.value)}
                      disabled={!isEditable}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 disabled:opacity-60"
                      placeholder="Trách nhiệm..."
                    />
                  </div>
                  {isEditable && (
                    <button onClick={() => removeObjectArrayItem('targetAudienceList', idx)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-6">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 uppercase text-sm tracking-wide">III. Tài liệu tham khảo</h3>
          <div className="space-y-4">
             <Button
                variant="outlined"
                startIcon={<FileText />}
                onClick={() => setOpenRefDialog(true)}
             >
               Chọn tài liệu tham khảo ({formData.referencesList?.length || 0})
             </Button>
             
             {formData.referencesList && formData.referencesList.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.referencesList.map((ref, idx) => (
                    <Chip key={idx} label={`${ref.code} - ${ref.name}`} size="small" />
                  ))}
                </div>
             )}
          </div>
        </div>

        <Dialog open={openRefDialog} onClose={() => setOpenRefDialog(false)} fullWidth maxWidth="sm">
            <DialogTitle>Chọn Tài liệu tham khảo</DialogTitle>
            <DialogContent>
                <ReferenceDocuments 
                    processes={processes}
                    process={{...process, ...formData} as Process}
                    onSaveProcess={(updatedProcess) => {
                        setFormData(prev => ({...prev, referencesList: updatedProcess.referencesList}));
                        // We do NOT save immediately here, we wait for the main "Lưu thông tin" button
                    }}
                />
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={() => setOpenRefDialog(false)}>Đóng</Button>
                </Box>
            </DialogContent>
        </Dialog>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-6">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 uppercase text-sm tracking-wide">IV. Giải thích từ ngữ, từ viết tắt</h3>
          
          <div className="space-y-4 pl-4 border-l-2 border-indigo-100 dark:border-indigo-900/50">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex justify-between items-center">
              1. Giải thích từ ngữ
              {isEditable && (
                <button onClick={() => addObjectArrayItem('termList', { term: '', explanation: '' })} className="text-indigo-600 hover:text-indigo-700 p-1">
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </label>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 mb-1 px-1">
                <span className="text-xs font-semibold text-slate-500">Thuật ngữ</span>
                <span className="text-xs font-semibold text-slate-500">Giải nghĩa</span>
              </div>
              {(formData.termList || []).map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <input
                      value={item.term}
                      onChange={(e) => handleObjectArrayChange('termList', idx, 'term', e.target.value)}
                      disabled={!isEditable}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 disabled:opacity-60"
                      placeholder="Thuật ngữ..."
                    />
                    <input
                      value={item.explanation}
                      onChange={(e) => handleObjectArrayChange('termList', idx, 'explanation', e.target.value)}
                      disabled={!isEditable}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 disabled:opacity-60"
                      placeholder="Giải nghĩa..."
                    />
                  </div>
                  {isEditable && (
                    <button onClick={() => removeObjectArrayItem('termList', idx)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pl-4 border-l-2 border-indigo-100 dark:border-indigo-900/50">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex justify-between items-center">
              2. Từ viết tắt
              {isEditable && (
                <button onClick={() => addObjectArrayItem('abbreviationList', { abbreviation: '', meaning: '' })} className="text-indigo-600 hover:text-indigo-700 p-1">
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </label>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 mb-1 px-1">
                <span className="text-xs font-semibold text-slate-500">Từ viết tắt</span>
                <span className="text-xs font-semibold text-slate-500">Ý nghĩa</span>
              </div>
              {(formData.abbreviationList || []).map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <input
                      value={item.abbreviation}
                      onChange={(e) => handleObjectArrayChange('abbreviationList', idx, 'abbreviation', e.target.value)}
                      disabled={!isEditable}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 disabled:opacity-60"
                      placeholder="Viết tắt..."
                    />
                    <input
                      value={item.meaning}
                      onChange={(e) => handleObjectArrayChange('abbreviationList', idx, 'meaning', e.target.value)}
                      disabled={!isEditable}
                      className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 disabled:opacity-60"
                      placeholder="Ý nghĩa..."
                    />
                  </div>
                  {isEditable && (
                    <button onClick={() => removeObjectArrayItem('abbreviationList', idx)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-6">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 uppercase text-sm tracking-wide">V. Quy định chung</h3>
          
          <div className="space-y-2 pl-4 border-l-2 border-indigo-100 dark:border-indigo-900/50">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">1. Nguyên tắc chung</label>
            <textarea
              value={formData.generalPrinciples}
              onChange={(e) => handleChange('generalPrinciples', e.target.value)}
              disabled={!isEditable}
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 disabled:opacity-60"
              placeholder="Nguyên tắc..."
            />
          </div>

          <div className="space-y-2 pl-4 border-l-2 border-indigo-100 dark:border-indigo-900/50">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">2. Trách nhiệm</label>
            <textarea
              value={formData.responsibilities}
              onChange={(e) => handleChange('responsibilities', e.target.value)}
              disabled={!isEditable}
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 disabled:opacity-60"
              placeholder="Trách nhiệm của..."
            />
          </div>
        </div>

      </div>
    </div>
  );
}
