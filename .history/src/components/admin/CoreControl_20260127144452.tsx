import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FolderKanban, User, LogOut } from 'lucide-react';
import ProjectManager from './ProjectManager';
import InfoManager from './InfoManager';

// Placeholder cho Info (sẽ làm ở bước sau)
const InfoManager = () => <div className="p-6">Quản lý Info (Đang xây dựng...)</div>;

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'projects' | 'info'>('projects');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) window.location.href = '/login';
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Đang tải CMS...</div>;
  if (!session) return null;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-[#1f2937] text-white flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold tracking-wider">MINOX CMS</h1>
          <p className="text-xs text-gray-400 mt-1">Admin Dashboard</p>
        </div>

        <nav className="flex-1 py-6 space-y-2 px-3">
          <button
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'projects' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <FolderKanban size={20} />
            <span className="font-medium">Quản lý Project</span>
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === 'info' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <User size={20} />
            <span className="font-medium">Quản lý Info</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 px-4 py-2 transition-colors"
          >
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-auto bg-gray-50 relative">
        {activeTab === 'projects' && <ProjectManager />}
        {activeTab === 'info' && <InfoManager />}
      </main>
    </div>
  );
}