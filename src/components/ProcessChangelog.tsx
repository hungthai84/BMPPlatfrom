import React, { useState } from 'react';
import { Process, ChangelogItem } from '../types';
import { Plus, Trash2, Save } from 'lucide-react';

interface ProcessChangelogProps {
  process: Process;
  onSaveProcess: (p: Process) => void;
  currentUserRole: string;
}

export default function ProcessChangelog({ process, onSaveProcess, currentUserRole }: ProcessChangelogProps) {
  const [changelog, setChangelog] = useState<ChangelogItem[]>(process.changelog || []);
  const isEditable = currentUserRole !== "Viewer";

  const handleAddLog = () => {
    setChangelog([
      ...changelog,
      { version: '1.0', date: new Date().toLocaleDateString('vi-VN'), author: process.creator || '', description: '' }
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

  const handleSave = () => {
    onSaveProcess({
      ...process,
      changelog,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-5xl mx-auto">
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">VIII. Quản lý phiên bản</h2>
          <p className="text-sm text-slate-500">Lịch sử thay đổi và cập nhật quy trình</p>
        </div>
        {isEditable && (
          <div className="flex gap-2">
            <button
              onClick={handleAddLog}
              className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Thêm phiên bản
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" /> Lưu thay đổi
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-slate-200 dark:border-slate-700 text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              <th className="border border-slate-200 dark:border-slate-700 p-3 text-center w-24">Phiên bản</th>
              <th className="border border-slate-200 dark:border-slate-700 p-3 text-center w-36">Ngày hiệu lực</th>
              <th className="border border-slate-200 dark:border-slate-700 p-3 text-left">Nội dung thay đổi</th>
              <th className="border border-slate-200 dark:border-slate-700 p-3 text-center w-40">Đơn vị chủ trì</th>
              {isEditable && <th className="border border-slate-200 dark:border-slate-700 p-3 w-16"></th>}
            </tr>
          </thead>
          <tbody>
            {changelog.map((log, index) => (
              <tr key={index} className="bg-white dark:bg-slate-900">
                <td className="border border-slate-200 dark:border-slate-700 p-2">
                  <input
                    type="text"
                    value={log.version}
                    onChange={(e) => handleUpdateLog(index, 'version', e.target.value)}
                    disabled={!isEditable}
                    className="w-full p-1.5 border border-slate-300 dark:border-slate-600 rounded text-center focus:ring-1 focus:ring-indigo-500 bg-transparent"
                  />
                </td>
                <td className="border border-slate-200 dark:border-slate-700 p-2">
                  <input
                    type="text"
                    value={log.date}
                    onChange={(e) => handleUpdateLog(index, 'date', e.target.value)}
                    disabled={!isEditable}
                    className="w-full p-1.5 border border-slate-300 dark:border-slate-600 rounded text-center focus:ring-1 focus:ring-indigo-500 bg-transparent"
                    placeholder="dd/mm/yyyy"
                  />
                </td>
                <td className="border border-slate-200 dark:border-slate-700 p-2">
                  <textarea
                    value={log.description}
                    onChange={(e) => handleUpdateLog(index, 'description', e.target.value)}
                    disabled={!isEditable}
                    rows={2}
                    className="w-full p-1.5 border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-indigo-500 bg-transparent"
                    placeholder="Ban hành mới / Thay đổi mục..."
                  />
                </td>
                <td className="border border-slate-200 dark:border-slate-700 p-2">
                  <input
                    type="text"
                    value={log.author}
                    onChange={(e) => handleUpdateLog(index, 'author', e.target.value)}
                    disabled={!isEditable}
                    className="w-full p-1.5 border border-slate-300 dark:border-slate-600 rounded text-center focus:ring-1 focus:ring-indigo-500 bg-transparent"
                    placeholder="Khối/Phòng..."
                  />
                </td>
                {isEditable && (
                  <td className="border border-slate-200 dark:border-slate-700 p-2 text-center">
                    <button
                      onClick={() => handleRemoveLog(index)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {changelog.length === 0 && (
              <tr>
                <td colSpan={isEditable ? 5 : 4} className="border border-slate-200 dark:border-slate-700 p-6 text-center text-slate-500">
                  Chưa có lịch sử phiên bản nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
