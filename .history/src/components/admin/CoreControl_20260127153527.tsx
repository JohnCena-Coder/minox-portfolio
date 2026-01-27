import React, { useState } from 'react';
import ProjectManager from './ProjectManager';
import InfoManager from './InfoManager';
import { LayoutGrid, User, LogOut, Menu, X } from 'lucide-react'; // Thêm icon Menu và X

export default function CoreControl() {
  const [activeTab, setActiveTab] = useState<'projects' | 'info'>('projects');
  
  // State quản lý việc đóng/mở menu trên mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-sans overflow-hidden">
        
        {/* --- 1. MOBILE OVERLAY (Lớp nền tối khi mở menu) --- */}
        {isMobileMenuOpen && (
            <div 
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
            ></div>
        )}

        {/* --- 2. SIDEBAR (RESPONSIVE) --- */}
        <div className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-black text-white flex flex-col transition-transform duration-300 ease-in-out
            md:relative md:translate-x-0 
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
            
            {/* Header CMS */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-white/20 shrink-0">
                <div className="flex items-center">
                    <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-bold mr-3 text-lg font-vibe">M</div>
                    <h1 className="font-vibe text-xl font-bold tracking-widest uppercase">MINOX CMS</h1>
                </div>
                
                {/* Nút đóng menu (Chỉ hiện trên Mobile) */}
                <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="md:hidden text-gray-400 hover:text-white"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Danh sách Menu */}
            <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
                <button 
                    onClick={() => { setActiveTab('projects'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm font-vibe uppercase tracking-wider text-sm transition-all duration-200 ${
                        activeTab === 'projects' 
                        ? 'bg-white text-black font-bold shadow-md translate-x-1' 
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                >
                    <LayoutGrid size={18} />
                    Project Manager
                </button>

                <button 
                    onClick={() => { setActiveTab('info'); setIsMobileMenuOpen(false); }}
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
            <div className="p-4 border-t border-white/20 shrink-0">
                <a 
                    href="/" 
                    className="flex items-center gap-2 text-gray-500 hover:text-white font-vibe uppercase text-xs tracking-widest transition-colors"
                >
                    <LogOut size={14} /> 
                    Back to Live Site
                </a>
            </div>
        </div>

        {/* --- 3. MAIN CONTENT --- */}
        <div className="flex-1 flex flex-col h-full w-full relative overflow-hidden">
            
            {/* Mobile Header Bar (Chứa nút mở menu) */}
            <div className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4 shrink-0">
                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 -ml-2 text-black hover:bg-gray-100 rounded-md"
                >
                    <Menu size={24} />
                </button>
                <span className="ml-4 font-vibe font-bold uppercase tracking-widest text-sm">
                    {activeTab === 'projects' ? 'Project Manager' : 'Profile Info'}
                </span>
            </div>

            {/* Nội dung chính (Scrollable) */}
            <div className="flex-1 overflow-hidden relative">
                {activeTab === 'projects' ? (
                    <ProjectManager />
                ) : (
                    <InfoManager />
                )}
            </div>
            
        </div>
    </div>
  );
}