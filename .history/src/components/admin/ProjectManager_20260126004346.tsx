import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Project } from '../../types';
import ProjectForm from './ProjectForm';
import { Edit, Trash2, Plus, RefreshCw } from 'lucide-react';

export default function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    // Lấy project + items để hiển thị số lượng items
    const { data } = await supabase.from('projects').select('*, items(*)').order('priority', { ascending: false });
    if (data) setProjects(data as Project[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('Bạn chắc chắn muốn xóa dự án này? (Toàn bộ item bên trong sẽ mất)')) {
      await supabase.from('projects').delete().eq('id', id);
      fetchProjects();
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Dự án</h2>
        <div className="flex gap-2">
            <button onClick={fetchProjects} className="p-2 bg-gray-200 rounded hover:bg-gray-300"><RefreshCw size={20}/></button>
            <button onClick={handleAddNew} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium">
            <Plus size={20} /> Thêm Dự án
            </button>
        </div>
      </div>

      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden border">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-4 border-b">Priority</th>
                <th className="p-4 border-b">Tên Dự án</th>
                <th className="p-4 border-b">Loại</th>
                <th className="p-4 border-b">Số Items</th>
                <th className="p-4 border-b text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 border-b last:border-0">
                  <td className="p-4">{p.priority}</td>
                  <td className="p-4 font-medium text-gray-900">{p.title}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${p.type === 'review' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                      {p.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">{p.items.length} Items</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleEdit(p)} className="text-blue-600 hover:text-blue-800 mr-3">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">Chưa có dự án nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <ProjectForm 
          initialData={editingProject} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchProjects();
          }} 
        />
      )}
    </div>
  );
}