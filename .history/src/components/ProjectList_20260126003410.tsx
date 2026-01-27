import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Project } from '../types';
import ComparisonSlider from './ComparisonSlider';
import { ChevronDown, ChevronUp, Layers, Image as ImageIcon } from 'lucide-react';

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // 1. Fetch dữ liệu từ Supabase khi vào trang
  useEffect(() => {
    async function fetchData() {
      // Lấy Projects kèm theo Items con, sắp xếp theo Priority giảm dần
      const { data, error } = await supabase
        .from('projects')
        .select('*, items(*)')
        .order('priority', { ascending: false });

      if (error) {
        console.error('Lỗi tải dữ liệu:', error);
      } else {
        // Sắp xếp items bên trong mỗi project theo priority
        const sortedData = data?.map((p) => ({
          ...p,
          items: p.items.sort((a: any, b: any) => b.priority - a.priority)
        })) as Project[];
        
        setProjects(sortedData || []);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // 2. Hàm xử lý Click mở rộng
  const toggleExpand = (id: number) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Đang tải dự án...</div>;
  if (projects.length === 0) return <div className="text-center py-10 text-gray-500">Chưa có dự án nào.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {projects.map((project) => {
        const isExpanded = expandedId === project.id;
        
        return (
          <div 
            key={project.id}
            // Nếu mở rộng thì chiếm full hàng (col-span-2), nếu không thì 1 cột
            className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 ${
              isExpanded ? 'md:col-span-2 ring-2 ring-blue-500/20' : 'col-span-1 hover:shadow-md'
            }`}
          >
            {/* --- HEADER CARD (Luôn hiện) --- */}
            <div 
              onClick={() => toggleExpand(project.id)}
              className="p-5 cursor-pointer flex justify-between items-start bg-white hover:bg-gray-50 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {project.type === 'review' ? <Layers size={16} className="text-blue-500"/> : <ImageIcon size={16} className="text-pink-500"/>}
                  <h3 className="text-lg font-bold text-gray-900">{project.title}</h3>
                </div>
                <p className="text-sm text-gray-500">
                  {project.type === 'review' ? 'Review (Before/After)' : 'Normal Gallery'} • {project.items.length} Items
                </p>
              </div>
              <button className="text-gray-400">
                {isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
              </button>
            </div>

            {/* --- BODY CARD (Chỉ hiện khi Expand) --- */}
            {isExpanded && (
              <div className="border-t border-gray-100 bg-gray-50 p-5 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-12">
                  {project.items.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h4 className="text-md font-bold text-gray-800 mb-2 border-l-4 border-blue-500 pl-2">
                        {item.title}
                      </h4>
                      
                      {/* HIỂN THỊ DỰA TRÊN LOẠI PROJECT */}
                      {project.type === 'review' ? (
                        // TYPE: REVIEW (Slider)
                        <div className="mb-4">
                           {item.before_img && item.after_img ? (
                             <ComparisonSlider beforeImg={item.before_img} afterImg={item.after_img} />
                           ) : (
                             <div className="bg-gray-100 p-4 text-center rounded text-sm text-gray-500">Thiếu ảnh Before/After</div>
                           )}
                        </div>
                      ) : (
                        // TYPE: NORMAL (Gallery)
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                          {item.gallery_imgs && item.gallery_imgs.length > 0 ? (
                            item.gallery_imgs.map((img, idx) => (
                              <img key={idx} src={img} alt="Gallery" className="w-full h-32 object-cover rounded hover:opacity-90 transition-opacity cursor-pointer border border-gray-100" />
                            ))
                          ) : (
                            <div className="bg-gray-100 p-4 text-center rounded text-sm text-gray-500 col-span-full">Chưa có ảnh</div>
                          )}
                        </div>
                      )}

                      {/* Thông tin chi tiết Item */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-3 bg-gray-50 p-3 rounded">
                         {item.description && <p><span className="font-semibold">Mô tả:</span> {item.description}</p>}
                         {item.tool_used && <p><span className="font-semibold text-blue-600">Tools:</span> {item.tool_used}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}