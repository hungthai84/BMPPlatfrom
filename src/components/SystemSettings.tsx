import React, { useState } from "react";
import { Settings, Users, Shield, Webhook, Database, Building2, Plus, Trash2 } from "lucide-react";

interface SystemSettingsProps {
  companyName?: string;
  setCompanyName?: (name: string) => void;
  departments?: string[];
  setDepartments?: (depts: string[]) => void;
}

export default function SystemSettings({ 
  companyName = "CÔNG TY TNHH MTV SEN VÀNG VIỆT NAM", 
  setCompanyName,
  departments = [],
  setDepartments 
}: SystemSettingsProps) {
  const [newDept, setNewDept] = useState("");

  const addDepartment = () => {
    if (newDept && setDepartments && departments) {
      setDepartments([...departments, newDept]);
      setNewDept("");
    }
  };

  const removeDepartment = (index: number) => {
    if (setDepartments && departments) {
      setDepartments(departments.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Thiết Lập Hệ Thống</h2>
            <p className="text-[13px] font-medium text-slate-500">Cấu hình vai trò, bảo mật và các kết nối bên ngoài</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="mb-8 p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/30">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-6 h-6 text-indigo-500" />
              <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Thông tin Công ty</h3>
            </div>
            <div className="flex flex-col gap-2 max-w-md">
              <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Tên công ty (hiển thị trên tài liệu in)</label>
              <input 
                type="text" 
                value={companyName}
                onChange={(e) => setCompanyName?.(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                placeholder="Nhập tên công ty..."
              />
            </div>
          </div>

          <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/30">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-blue-500" />
              <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Cơ Cấu Phòng Ban</h3>
            </div>
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-[13px] bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                placeholder="Tên phòng ban mới..."
              />
              <button onClick={addDepartment} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {departments.map((dept, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">{dept}</span>
                  <button onClick={() => removeDepartment(index)} className="text-red-500 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
