import React, { useState } from 'react';
import ProjectManager from './ProjectManager'; // Component quản lý dự án (đã làm)
import InfoManager from './InfoManager';       // Component quản lý info (vừa làm)
import { LayoutGrid, User, LogOut } from 'lucide-react';

export default function CoreControl() {
  // State lưu tab đang chọn ('projects' hoặc 'info')
  const [activeTab, setActiveTab] = useState<'projects' | 'info'>('projects');

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-sans">
        
        {/* --- SIDEBAR TRÁI (MENU) --- */}
        <div className="w-64 bg-black text-white flex flex-col flex-shrink-0 transition-all duration-300">
            
            {/* Header CMS */}
            <div className="h-16 flex items-center px-6 border-b border-white/20">
                <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-bold mr-3 text-lg font-vibe">M</div>
                <h1 className="font-vibe text-xl font-bold tracking-widest uppercase">MINOX CMS</h1>
            </div>

            {/* Danh sách Menu */}
            <div className="flex-1 py-6 px-3 space-y-2">
                
                {/* Nút Project Manager */}
                <button 
                    onClick={() => setActiveTab('projects')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm font-vibe uppercase tracking-wider text-sm transition-all duration-200 ${
                        activeTab === 'projects' 
                        ? 'bg-white text-black font-bold shadow-md translate-x-1' 
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                >
                    <LayoutGrid size={18} />
                    Project Manager
                </button>

                {/* Nút Info Manager */}
                <button 
                    onClick={() => setActiveTab('info')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm font-vibe uppercase tracking-wider text-sm transition-all duration-200 ${
                        activeTab === 'info' 
                        ? 'bg-white text-black font-bold shadow-md translate-x-1' 
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                >
                    <User size={18} />
                    Profile & Info
                </button>
            </div>

            {/* Footer Sidebar */}
            <div className="p-4 border-t border-white/20">
                <a 
                    href="/" 
                    className="flex items-center gap-2 text-gray-500 hover:text-white font-vibe uppercase text-xs tracking-widest transition-colors"
                >
                    <LogOut size={14} /> 
                    Back to Live Site
                </a>
            </div>
        </div>

        {/* --- MAIN CONTENT (KHUNG PHẢI) --- */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
            
            {/* Logic hiển thị: Nếu tab là 'projects' thì hiện ProjectManager, ngược lại hiện InfoManager */}
            {activeTab === 'projects' ? (
                <ProjectManager />
            ) : (
                <InfoManager />
            )}
            
            {/* Nhãn hiển thị chế độ hiện tại (Góc dưới phải) */}
            <div className="absolute bottom-4 right-6 pointer-events-none opacity-50">
                <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                    CURRENT MODE: <span className="text-black font-bold">{activeTab}</span>
                </p>
            </div>
        </div>
    </div>
  );
}