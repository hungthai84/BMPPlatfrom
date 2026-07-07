import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

export default function Calendar() {
  const events = [
    { date: '2026-07-05', title: 'Đánh giá định kỳ ISO' },
    { date: '2026-07-10', title: 'Ngày hết hạn quy trình QT-KD-101' },
    { date: '2026-07-15', title: 'Đào tạo nội bộ - P. Nhân sự' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <CalendarIcon className="w-5 h-5 text-indigo-500" /> Lịch Mốc Thời Gian Quan Trọng
      </h3>
      <div className="space-y-3">
        {events.map((event, i) => (
          <div key={i} className="flex gap-3 text-xs items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="bg-indigo-100 text-indigo-700 font-bold px-2 py-1 rounded text-[10px] whitespace-nowrap">
              {event.date}
            </div>
            <p className="font-semibold text-slate-700 dark:text-slate-300">{event.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
