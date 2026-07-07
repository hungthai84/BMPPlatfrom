import React, { useState } from "react";
import { 
  Settings, Users, Shield, Webhook, Database, Building2, Plus, Trash2, 
  Image as ImageIcon, Video as VideoIcon, Sparkles, SlidersHorizontal, Check, RotateCcw, Eye,
  Palette, Volume2, Info, Layout, MousePointer2
} from "lucide-react";
import { WallpaperConfig, UIConfig, ThemePreset } from "../types";

interface SystemSettingsProps {
  companyName?: string;
  setCompanyName?: (name: string) => void;
  departments?: string[];
  setDepartments?: (depts: string[]) => void;
  wallpaper?: WallpaperConfig;
  onWallpaperChange?: (config: WallpaperConfig) => void;
  uiConfig?: UIConfig;
  onUIConfigChange?: (config: Partial<UIConfig>) => void;
}

const THEME_PRESETS: { id: ThemePreset; name: string; description: string; colors: string }[] = [
  { id: 'slate', name: 'Mặc định (Slate)', description: 'Chuyên nghiệp, cân bằng', colors: 'bg-slate-500' },
  { id: 'midnight', name: 'Huyền bí (Midnight)', description: 'Tập trung cao độ, bảo vệ mắt', colors: 'bg-slate-900' },
  { id: 'amber', name: 'Ấm áp (Amber)', description: 'Gần gũi, dịu nhẹ', colors: 'bg-amber-500' },
  { id: 'ocean', name: 'Biển khơi (Ocean)', description: 'Sáng tạo, mát mẻ', colors: 'bg-blue-500' }
];

const IMAGE_WALLPAPERS = [
  "https://i.ibb.co/G47jTb1g/minimalist-white-background-3840x2160-bright-space-clean-aesthetic-27644.jpg",
  "https://i.ibb.co/q2X19rq/geometric-mountain-wallpaper-3840x2160-calming-visuals-simple-patterns-26760.jpg",
  "https://i.ibb.co/R4P1zff0/ta-i-xu-ng-15.jpg",
  "https://i.ibb.co/TDnD5NB1/ta-i-xu-ng-14.jpg",
  "https://i.ibb.co/S49fBKcv/ta-i-xu-ng-13.jpg",
  "https://i.ibb.co/04qypw8/ta-i-xu-ng-12.jpg",
  "https://i.ibb.co/ch1yf4Dz/AVv-Xs-Egn6ve-Lq-M6aj-Fr-XO6-YYuy-NTs-Wt-x9-qxb2w-O8-Xt-OWdn-JECETXTri7-Ps-rnb2-Td-Jnln6xu-kddyc-Yisi1xf.jpg",
  "https://i.ibb.co/d0Fw0xdW/Best-wallpaper-1.jpg",
  "https://i.ibb.co/rKL4ffH2/2.jpg",
  "https://i.ibb.co/nq9GHB11/ta-i-xu-ng-12.jpg",
  "https://i.ibb.co/PZhKjDjP/Abstract-minimalistic-background-image-with-minimal-details-in-silvery-pearlescent-hues-subtle-tex.jpg",
  "https://i.ibb.co/Fc1dczn/Wallpaper.jpg",
  "https://i.ibb.co/DDCj9TBk/ta-i-xu-ng-15.jpg",
  "https://i.ibb.co/jPN1bS9c/Pastel-Minimal-Wallpaper-Clean-Aesthetic-for-Mac-Book.jpg",
  "https://i.ibb.co/chRZYCFs/ta-i-xu-ng-14.jpg",
  "https://i.ibb.co/k2jTwnTp/ta-i-xu-ng-13.jpg",
  "https://i.ibb.co/G4tGQZbB/ta-i-xu-ng-16.jpg",
  "https://i.ibb.co/r2w5qZCT/Download-Abstract-Gradient-Circle-Background-for-free.jpg",
  "https://i.ibb.co/zhc5bK7G/Ton-mental-a-aussi-besoin-de-repos.jpg"
];

const VIDEO_WALLPAPERS = [
  { url: "https://cdn.dribbble.com/userupload/18230475/file/original-d7ab36998c2277e97c1996d837a4673c.mp4" },
  { url: "https://cdn.dribbble.com/userupload/9438742/file/original-9334dd4051bb585cc561e8be06870b39.mp4" },
  { url: "https://cdn.dribbble.com/userupload/4241992/file/original-1fcb82b5ace105f3ec88a2deb08e842d.mp4" },
  { url: "https://cdn.dribbble.com/userupload/34993295/file/original-2ea4b30fcd7c6eac3ca0f4d5bfd3d67b.mp4" },
  { url: "https://cdn.dribbble.com/userupload/32536603/file/original-db8060ba2540c3bf1cd2f30b4984cd51.mp4" },
  { url: "https://cdn.dribbble.com/userupload/32480516/file/original-f4a88d4031fee315e3175bf1834c24b4.mp4" },
  { url: "https://cdn.dribbble.com/userupload/32404914/file/original-57644971c47c0d16f90a68404a5e65c1.mp4" },
  { url: "https://cdn.dribbble.com/userupload/16365481/file/original-527fee647d12f31fce8a309ad136c4bb.mp4" },
  { url: "https://cdn.dribbble.com/userupload/15594644/file/original-6008d4b0ddcff73c116cb7989a144a71.mp4" },
  { url: "https://cdn.dribbble.com/userupload/14779635/file/original-1aca59fc5dc52bee9dcd291a27effcbf.mp4" },
  { url: "https://cdn.dribbble.com/userupload/10782874/file/original-06f7280dda982b62cd9452b0da032598.mp4" },
  { url: "https://cdn.dribbble.com/userupload/32524948/file/original-3c68e4ad227ae70e1875ef71289be2b0.mp4", thumbnail: "https://i.postimg.cc/jS3rSGdF/videoframe-8901.png" },
  { url: "https://cdn.dribbble.com/userupload/13498087/file/original-b120f6a1a15d71e493f8d4b2d13b0296.mp4", thumbnail: "https://i.postimg.cc/BnmJ1jNN/videoframe-3046.png" },
  { url: "https://cdn.dribbble.com/userupload/16718734/file/original-f2df9314dbf922d5452d7a8a5885d744.mp4", thumbnail: "https://i.postimg.cc/NfYtJ6zp/videoframe-1990.png" },
  { url: "https://cdn.dribbble.com/userupload/43797830/file/original-b9bafe56dd75a7ae175f827cfc662738.mp4", thumbnail: "https://i.postimg.cc/yNJW1hB0/videoframe-3097.png" },
  { url: "https://cdn.dribbble.com/userupload/16365364/file/original-dcc3ad4c0f5802c6670d36fcca720e5e.mp4", thumbnail: "https://i.postimg.cc/vBgPtKyD/videoframe-4678.png" },
  { url: "https://cdn.dribbble.com/userupload/43797856/file/original-46c91cbdf46a3cbc3f30a85f061ed817.mp4", thumbnail: "https://i.postimg.cc/L6TVLSPN/videoframe-3537.png" },
  { url: "https://cdn.dribbble.com/userupload/12532568/file/original-816b8af88c5a4336e9f0467a7848033e.mp4" },
  { url: "https://cdn.dribbble.com/userupload/9535990/file/original-3a87c5fdf2433287d096795a11fa9ee4.mp4" },
  { url: "https://cdn.dribbble.com/userupload/13253460/file/original-85659da2508a303a516780470e3ae354.mp4" },
  { url: "https://cdn.dribbble.com/userupload/9783516/file/original-47f57ffecea5c7874ff6d6c2f0ce42bf.mp4" }
];

const GRADIENT_WALLPAPERS = [
  { value: "linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)", name: "Vibrant Liquid (Special)", animate: true },
  { value: "linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)", name: "Classic Indigo" },
  { value: "linear-gradient(45deg, #13547a 0%, #80d0c7 100%)", name: "Deep Sea Breeze" },
  { value: "linear-gradient(45deg, #ed6ea0 0%, #ec8c69 100%)", name: "Summer Peach" },
  { value: "linear-gradient(45deg, #000428 0%, #004e92 100%)", name: "Cosmic Midnight" },
  { value: "linear-gradient(45deg, #0f2027 0%, #203a43 50%, #2c5364 100%)", name: "Emerald Slate" },
  { value: "linear-gradient(45deg, #373b44 0%, #4286f4 100%)", name: "Skyline Dawn" },
  { value: "linear-gradient(45deg, #7028e4 0%, #e5b2ca 100%)", name: "Neon Orchid" },
  { value: "linear-gradient(45deg, #1e3c72 0%, #2a5298 100%)", name: "Royal Navy" },
  { value: "linear-gradient(45deg, #a8edea 0%, #fed6e3 100%)", name: "Rose Pastel" },
  { value: "linear-gradient(45deg, #0250c5 0%, #d43f8d 100%)", name: "Electric Dream" }
];

const CUSTOM_PATTERNS = [
  {
    id: "orbiting-planets",
    name: "Orbiting Planets",
    thumbnail: "https://images.pexels.com/photos/1655166/pexels-photo-1655166.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
    description: "Khung cảnh vụ trụ với quỹ đạo các hành tinh chuyển động"
  },
  {
    id: "dotted-pattern",
    name: "Dotted Pattern",
    css: "radial-gradient(circle at 25% 25%, #a3b1c6 15%, transparent 15%), radial-gradient(circle at 75% 75%, #a3b1c6 15%, transparent 15%)",
    bgcolor: "#e0e7ed",
    size: "10px 10px",
    description: "Họa tiết chấm tròn sáng tối giản hiện đại"
  },
  {
    id: "dark-dotted-pattern",
    name: "Dark Dotted Pattern",
    css: "radial-gradient(circle, rgba(255, 255, 255, 0.2) 1px, transparent 1px)",
    bgcolor: "#1d1f20",
    size: "11px 11px",
    description: "Họa tiết chấm tinh xảo tối màu chuyên nghiệp"
  }
];

export default function SystemSettings({ 
  companyName = "CÔNG TY TNHH MTV SEN VÀNG VIỆT NAM", 
  setCompanyName,
  departments = [],
  setDepartments,
  wallpaper = { type: 'none', value: '', blur: 0, opacity: 100 },
  onWallpaperChange,
  uiConfig = { 
    theme: 'slate', 
    transparency: { sidebarOpacity: 85, cardOpacity: 90, contentOpacity: 30, blur: 10 },
    sound: { enabled: true, volume: 0.06 }
  },
  onUIConfigChange
}: SystemSettingsProps) {
  const [newDept, setNewDept] = useState("");
  const [activeNavTab, setActiveNavTab] = useState<'system' | 'appearance' | 'sound'>('system');
  const [activeWallpaperTab, setActiveWallpaperTab] = useState<'image' | 'video' | 'gradient' | 'pattern'>('image');

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

  const updateWallpaper = (newConfig: Partial<WallpaperConfig>) => {
    if (onWallpaperChange) {
      onWallpaperChange({
        ...wallpaper,
        ...newConfig
      });
    }
  };

  const updateUI = (newConfig: any) => {
    if (onUIConfigChange) {
      onUIConfigChange(newConfig);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* 1. STRATEGIC BANNER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-12 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-500/10 transition-all duration-700" />
        <div className="relative z-10 flex flex-col gap-2 flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Settings className="w-8 h-8 animate-spin-slow" />
            </div>
            <h1 className="text-4xl display-title text-slate-900 dark:text-white">Thiết Lập Hệ Thống</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
            Chuẩn hóa toàn bộ trải nghiệm số, đảm bảo tính nhất quán tối đa giữa hành trình khách hàng và các điểm chạm công nghệ.
          </p>
        </div>
        <div className="relative z-10">
          <button className="flex items-center gap-2 px-5 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all">
            <BookOpen className="w-4 h-4" />
            Tài liệu hướng dẫn
          </button>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-950/60 rounded-2xl w-fit">
        <button
          onClick={() => setActiveNavTab('system')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
            activeNavTab === 'system'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Layout className="w-4 h-4" />
          Hệ thống
        </button>
        <button
          onClick={() => setActiveNavTab('appearance')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
            activeNavTab === 'appearance'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Palette className="w-4 h-4" />
          Diện mạo
        </button>
        <button
          onClick={() => setActiveNavTab('sound')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
            activeNavTab === 'sound'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          Âm thanh
        </button>
      </div>

      {/* 5. MAIN CONTENT AREA */}
      <div className="grid grid-cols-1 gap-6 min-h-[400px]">
        
        {activeNavTab === 'system' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Company Info Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl display-title text-slate-900 dark:text-white">Thông tin Công ty</h3>
                  <p className="text-xs font-semibold text-slate-500">Khai báo thông tin pháp lý cơ bản</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Tên doanh nghiệp chuẩn</label>
                  <input 
                    type="text" 
                    value={companyName}
                    onChange={(e) => setCompanyName?.(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-white outline-none"
                    placeholder="Nhập tên công ty..."
                  />
                </div>
              </div>
            </div>

            {/* Departments Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl display-title text-slate-900 dark:text-white">Cơ Cấu Phòng Ban</h3>
                  <p className="text-xs font-semibold text-slate-500">Quản lý sơ đồ tổ chức nội bộ</p>
                </div>
              </div>
              <div className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Tên phòng ban mới..."
                />
                <button onClick={addDepartment} className="p-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 shadow-md">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {departments.map((dept, index) => (
                  <div key={index} className="group flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{dept}</span>
                    <button onClick={() => removeDepartment(index)} className="text-rose-500 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeNavTab === 'appearance' && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Theme Presets */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl">
                  <Palette className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl display-title text-slate-900 dark:text-white">Chủ đề Hệ thống (Theme Presets)</h3>
                  <p className="text-xs font-semibold text-slate-500">Phân bổ bảng màu chuẩn hóa theo trạng thái không gian</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {THEME_PRESETS.map((t) => {
                  const isSelected = uiConfig.theme === t.id;
                  return (
                    <div 
                      key={t.id}
                      onClick={() => updateUI({ theme: t.id })}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/10 shadow-md ring-4 ring-indigo-500/5' 
                          : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-full h-2 rounded-full mb-4 ${t.colors}`} />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{t.name}</h4>
                      <p className="text-[11px] font-medium text-slate-500 leading-tight">{t.description}</p>
                      {isSelected && (
                        <div className="mt-4 flex justify-end">
                          <Check className="w-4 h-4 text-indigo-500" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Transparency & Blur Controls */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-2xl">
                  <SlidersHorizontal className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl display-title text-slate-900 dark:text-white">Kiểm soát Độ trong suốt (Glassmorphic)</h3>
                  <p className="text-xs font-semibold text-slate-500">Hòa trộn nền với hình nền wallpaper để duy trì tính thẩm mỹ</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300"> Sidebar Opacity (Menu)</label>
                      <span className="tech-mono text-indigo-500">{uiConfig.transparency.sidebarOpacity}%</span>
                    </div>
                    <input 
                      type="range" min="30" max="100" step="1"
                      value={uiConfig.transparency.sidebarOpacity}
                      onChange={(e) => updateUI({ transparency: { ...uiConfig.transparency, sidebarOpacity: parseInt(e.target.value) } })}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300"> Card Opacity (Thẻ nội dung)</label>
                      <span className="tech-mono text-indigo-500">{uiConfig.transparency.cardOpacity}%</span>
                    </div>
                    <input 
                      type="range" min="30" max="100" step="1"
                      value={uiConfig.transparency.cardOpacity}
                      onChange={(e) => updateUI({ transparency: { ...uiConfig.transparency, cardOpacity: parseInt(e.target.value) } })}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300"> Content Opacity (Nền chung)</label>
                      <span className="tech-mono text-indigo-500">{uiConfig.transparency.contentOpacity}%</span>
                    </div>
                    <input 
                      type="range" min="5" max="60" step="1"
                      value={uiConfig.transparency.contentOpacity}
                      onChange={(e) => updateUI({ transparency: { ...uiConfig.transparency, contentOpacity: parseInt(e.target.value) } })}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300"> Backdrop Blur (Độ mờ)</label>
                      <span className="tech-mono text-indigo-500">{uiConfig.transparency.blur}px</span>
                    </div>
                    <input 
                      type="range" min="0" max="40" step="1"
                      value={uiConfig.transparency.blur}
                      onChange={(e) => updateUI({ transparency: { ...uiConfig.transparency, blur: parseInt(e.target.value) } })}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Wallpaper Selection */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl display-title text-slate-900 dark:text-white">Workspace Wallpaper</h3>
                    <p className="text-xs font-semibold text-slate-500">Tùy chỉnh diện mạo không gian làm việc phía sau</p>
                  </div>
                </div>
                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-950/60 rounded-xl">
                  {(['image', 'video', 'gradient', 'pattern'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveWallpaperTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all ${
                        activeWallpaperTab === tab
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wallpaper Grids */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeWallpaperTab === 'image' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                    {IMAGE_WALLPAPERS.map((url, i) => (
                      <div 
                        key={i} 
                        onClick={() => updateWallpaper({ type: 'image', value: url })}
                        className={`aspect-video rounded-xl overflow-hidden border-2 cursor-pointer transition-all hover:scale-105 ${
                          wallpaper.type === 'image' && wallpaper.value === url ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-transparent'
                        }`}
                      >
                        <img src={url} className="w-full h-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                )}
                {activeWallpaperTab === 'gradient' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                    {GRADIENT_WALLPAPERS.map((grad, i) => (
                      <div 
                        key={i} 
                        onClick={() => updateWallpaper({ type: 'gradient', value: grad.value })}
                        style={{ background: grad.value }}
                        className={`aspect-video rounded-xl border-2 cursor-pointer transition-all hover:scale-105 ${
                          wallpaper.type === 'gradient' && wallpaper.value === grad.value ? 'border-slate-900 dark:border-white ring-2 ring-indigo-500/20' : 'border-transparent'
                        } ${grad.animate ? 'animated-gradient-bg' : ''}`}
                      />
                    ))}
                  </div>
                )}
                {/* Other tabs follow similar logic... */}
                {activeWallpaperTab === 'video' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {VIDEO_WALLPAPERS.map((v, i) => (
                      <div 
                        key={i} 
                        onClick={() => updateWallpaper({ type: 'video', value: v.url })}
                        className={`aspect-video rounded-xl overflow-hidden border-2 cursor-pointer transition-all hover:scale-105 relative bg-slate-900 ${
                          wallpaper.type === 'video' && wallpaper.value === v.url ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-transparent'
                        }`}
                      >
                        {v.thumbnail ? <img src={v.thumbnail} className="w-full h-full object-cover opacity-60" /> : <div className="w-full h-full flex items-center justify-center"><VideoIcon className="w-6 h-6 text-slate-700" /></div>}
                      </div>
                    ))}
                  </div>
                )}
                {activeWallpaperTab === 'pattern' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {CUSTOM_PATTERNS.map((p) => (
                      <div 
                        key={p.id} 
                        onClick={() => updateWallpaper({ type: 'pattern', value: p.id })}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          wallpaper.type === 'pattern' && wallpaper.value === p.id ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-100 dark:border-slate-800'
                        }`}
                      >
                        <h5 className="text-xs font-bold mb-1">{p.name}</h5>
                        <p className="text-[10px] text-slate-500">{p.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeNavTab === 'sound' && (
          <div className="max-w-2xl mx-auto w-full animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 shadow-sm text-center">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Volume2 className="w-10 h-10" />
              </div>
              <h3 className="text-3xl display-title text-slate-900 dark:text-white mb-2">Trải nghiệm Đa giác quan</h3>
              <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                Tích hợp Âm thanh Xúc giác Động (Tactile Switch Audio Feedback) để biến phần mềm thành một công cụ cơ học sống động.
              </p>
              
              <div className="flex flex-col gap-8 p-8 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MousePointer2 className="w-5 h-5 text-indigo-500" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Âm thanh khi nhấp (Tactile Click)</h4>
                      <p className="text-[11px] font-medium text-slate-500">Tự động phát âm thanh khi tương tác với nút, tab, checkbox.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={uiConfig.sound.enabled} 
                      onChange={(e) => updateUI({ sound: { ...uiConfig.sound, enabled: e.target.checked } })}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Âm lượng phản hồi (Volume Gain)</label>
                    <span className="tech-mono text-indigo-500">{Math.round(uiConfig.sound.volume * 1000) / 10}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="0.3" step="0.01"
                    value={uiConfig.sound.volume}
                    disabled={!uiConfig.sound.enabled}
                    onChange={(e) => updateUI({ sound: { ...uiConfig.sound, volume: parseFloat(e.target.value) } })}
                    className="w-full accent-emerald-500 disabled:opacity-30"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>Silent</span>
                    <span>Standard (0.06)</span>
                    <span>High</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="w-4 h-4 text-indigo-400" />
                    <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Thông số kỹ thuật (Audio Specs)</h5>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] text-slate-400 mb-1">Pitch Frequency</p>
                      <p className="tech-mono text-slate-700 dark:text-slate-300">950Hz → 1400Hz</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] text-slate-400 mb-1">Duration Ramp</p>
                      <p className="tech-mono text-slate-700 dark:text-slate-300">0.04s (40ms)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
