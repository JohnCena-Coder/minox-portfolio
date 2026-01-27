import React, { useState } from 'react';
import ProjectManager from './ProjectManager';
import InfoManager from './InfoManager'; // Import component mới
import { LayoutGrid, User, LogOut } from 'lucide-react';

export default function CoreControl() {
  // State để chuyển tab: 'projects' hoặc 'info'
  const [activeTab, setActiveTab] = useState<'projects' | 'info'>('projects');

  return (
    <div className="flex h-screen bg-[#f3f4f6]">
        {/* SIDEBAR */}
        <div className="w-64 bg-black text-white flex flex-col flex-shrink-0">
            <div className="h-16 flex items-center px-6 border-b border-white/20">
                <h1 className="font-vibe text-2xl font-bold tracking-tighter">MINOX CMS</h1>
            </div>

            <div className="flex-1 py-6 px-3 space-y-2">
                <button 
                    onClick={() => setActiveTab('projects')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm font-vibe uppercase tracking-wider text-sm transition-colors ${
                        activeTab === 'projects' ? 'bg-white text-black font-bold' : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                >
                    <LayoutGrid size={18} />
                    Project Manager
                </button>

                <button 
                    onClick={() => setActiveTab('info')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm font-vibe uppercase tracking-wider text-sm transition-colors ${
                        activeTab === 'info' ? 'bg-white text-black font-bold' : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                >
                    <User size={18} />
                    Profile & Info
                </button>
            </div>

            <div className="p-4 border-t border-white/20">
                <a href="/" className="flex items-center gap-2 text-gray-400 hover:text-white font-vibe uppercase text-xs tracking-widest">
                    <LogOut size={14} /> Back to Site
                </a>
            </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* Nếu đang chọn tab nào thì hiện component đó */}
            {activeTab === 'projects' ? <ProjectManager /> : <InfoManager />}
            
            {/* Nhãn trang thái */}
            <div className="absolute bottom-2 right-4 text-[10px] text-gray-400 font-mono pointer-events-none">
                MODE: {activeTab.toUpperCase()}
            </div>
        </div>
    </div>
  );
}