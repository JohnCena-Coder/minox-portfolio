import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FolderKanban, User, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'projects' | 'info'>('projects');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) window.location.href = '/login';
      else setSession(session);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (!session) return null;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-gray-800">CMS Admin</div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('projects')} className={`w-full flex gap-3 p-3 rounded ${activeTab === 'projects' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
            <FolderKanban size={20} /> Projects
          </button>
          <button onClick={() => setActiveTab('info')} className={`w-full flex gap-3 p-3 rounded ${activeTab === 'info' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
            <User size={20} /> Info Page
          </button>
        </nav>
        <button onClick={handleLogout} className="flex gap-3 p-4 text-red-400 hover:bg-gray-800 border-t border-gray-800">
          <LogOut size={20} /> Đăng xuất
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {activeTab === 'projects' && <div><h2>Quản lý Project (Sẽ làm ở bước 6)</h2></div>}
        {activeTab === 'info' && <div><h2>Quản lý Info (Sẽ làm ở bước 7)</h2></div>}
      </main>
    </div>
  );
}