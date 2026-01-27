import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FolderKanban, User, LogOut, Settings } from 'lucide-react';
import ProjectManager from './ProjectManager';
import InfoManager from './InfoManager'; // Giả sử bạn đã có file này

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

  // Class tiện ích cho text Vibe
  const vibeClass = "font-vibe uppercase tracking-tighter leading-none";

  return (
    <div className="flex h-screen bg-[#f3f4f6] overflow-hidden text-gray-900 font-vibe">
      {/* SIDEBAR */}
      <aside className="w-64 bg-black text-white flex flex-col flex-shrink-0 z-20">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <div className={`${vibeClass} text-3xl font-bold`}>MINOX CMS</div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={() => setActiveTab('projects')}
            className={`w-full flex items-center px-4 py-3 rounded ${vibeClass} text-lg font-bold transition-all ${
              activeTab === 'projects' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            <FolderKanban className="w-5 h-5 mr-3" />
            Projects
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`w-full flex items-center px-4 py-3 rounded ${vibeClass} text-lg font-bold transition-all ${
              activeTab === 'info' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            <User className="w-5 h-5 mr-3" />
            Info Page
          </button>
        </nav>

        <div className="p-6 border-t border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center font-bold">M</div>
            <div>
              <div className={`${vibeClass} text-sm font-bold`}>Minh / Jayce</div>
              <div className="text-xs text-gray-500 uppercase tracking-tighter">Super Admin</div>
            </div>
            <button onClick={handleLogout} className="ml-auto text-red-500 hover:text-red-400"><LogOut size={16}/></button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {activeTab === 'projects' && <ProjectManager />}
        {activeTab === 'info' && <InfoManager />}
      </main>
    </div>
  );
}