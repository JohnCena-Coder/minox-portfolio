import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Project, Item } from '../types';
import ComparisonSlider from './ComparisonSlider';
import { ChevronDown, ChevronUp, Layers, Image as ImageIcon } from 'lucide-react';

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      // Fetch dữ liệu Projects và Items
      const { data, error } = await supabase
        .from('projects')
        .select('*, items(*)')
        .order('priority', { ascending: false });

      if (error) {
        console.error('Lỗi tải dữ liệu:', error);
      } else {
        // Xử lý dữ liệu: Sắp xếp items bên trong theo Priority giảm dần
        const sortedData = data?.map((p) => ({
          ...p,
          items: Array.isArray(p.items) 
            ? p.items.sort((a: any, b: any) => (b.priority || 0) - (a.priority || 0)) 
            : []
        })) as Project[];
        
        setProjects(sortedData || []);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  // Helper: Lấy ảnh đại diện (Thumbnail) từ Item ưu tiên cao nhất
  const getProjectThumbnail = (project: Project) => {
    if (!project.items || project.items.length === 0) return null;
    const firstItem = project.items[0]; // Item có priority cao nhất
    
    // Nếu Review: Lấy ảnh After (Kết quả). Nếu Normal: Lấy ảnh đầu tiên
    if (project.type === 'review') return firstItem.after_img;
    return firstItem.gallery_imgs?.[0] || null;
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Đang tải dự án...</div>;
  if (projects.length === 0) return <div className="text-center py-10 text-gray-500">Chưa có dự án nào.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {projects.map((project) => {
        const isExpanded = expandedId === project.id;
        const thumbnail = getProjectThumbnail(project);
        
        return (
          <div 
            key={project.id}
            className={`group bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 ${
              isExpanded ? 'md:col-span-2 ring-2 ring-blue-500/20 shadow-xl' : 'col-span-1 hover:shadow-lg hover:-translate-y-1'
            }`}
          >
            {/* --- HEADER CARD (Luôn hiện & Clickable) --- */}
            <div onClick={() => toggleExpand(project.id)} className="cursor-pointer">
              
              {/* 1. ẢNH ĐẠI DIỆN PROJECT */}
              <div className="w-full h-64 overflow-hidden relative bg-gray-100">
                {thumbnail ? (
                  <img 
                    src={thumbnail} 
                    alt={project.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon size={48} opacity={0.5} />
                  </div>
                )}
                
                {/* Badge Loại Project */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                   {project.type === 'review' ? (
                     <><Layers size={14} className="text-blue-600"/> REVIEW</>
                   ) : (
                     <><ImageIcon size={14} className="text-pink-600"/> GALLERY</>
                   )}
                </div>
              </div>

              {/* 2. THÔNG TIN PROJECT */}
              <div className="p-5 flex justify-between items-center bg-white border-b border-gray-100">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1">{project.title}</h3>
                  <p className="text-sm text-gray-500 font-medium">
                    {/* Hiển thị số lượng items thực tế có trong DB, nhưng lát chỉ render 4 */}
                    {project.items.length} Items Available
                  </p>
                </div>
                <button className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                  <ChevronDown size={24}/>
                </button>
              </div>
            </div>

            {/* --- BODY CARD (Chỉ hiện khi Expand) --- */}
            {isExpanded && (
              <div className="bg-gray-50/50 p-6 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="space-y-12">
                  
                  {/* LOGIC QUAN TRỌNG: Chỉ lấy 4 items đầu tiên (slice 0,4) */}
                  {project.items.slice(0, 4).map((item) => (
                    <div key={item.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-100">
                        <span className="bg-gray-100 text-gray-600 font-bold px-2 py-1 rounded text-xs">#{item.priority}</span>
                        <h4 className="text-lg font-bold text-gray-800">{item.title}</h4>
                      </div>
                      
                      {/* HIỂN THỊ DỰA TRÊN LOẠI PROJECT */}
                      {project.type === 'review' ? (
                        <div className="mb-5">
                           {item.before_img && item.after_img ? (
                             <ComparisonSlider beforeImg={item.before_img} afterImg={item.after_img} />
                           ) : (
                             <div className="bg-red-50 text-red-500 p-4 text-center rounded text-sm">Thiếu ảnh hiển thị</div>
                           )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
                          {item.gallery_imgs?.map((img, idx) => (
                            <img key={idx} src={img} className="w-full h-40 object-cover rounded-lg border hover:opacity-90 cursor-pointer" />
                          ))}
                        </div>
                      )}

                      {/* Thông tin chi tiết */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                         <div><span className="font-semibold block mb-1">Mô tả:</span> {item.description || 'Không có mô tả'}</div>
                         <div><span className="font-semibold block mb-1 text-blue-600">Công cụ:</span> {item.tool_used || 'N/A'}</div>
                      </div>
                    </div>
                  ))}

                  {/* Thông báo nếu có nhiều hơn 4 item */}
                  {project.items.length > 4 && (
                    <div className="text-center text-sm text-gray-400 italic pt-4 border-t border-gray-200">
                      Hiển thị 4/{project.items.length} items ưu tiên nhất.
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}