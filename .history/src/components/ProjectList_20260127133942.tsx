import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Project, Item } from '../types';
import { X, ArrowRight, ArrowUpRight } from 'lucide-react';

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State cho Overlay (Lớp phủ chi tiết)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Logic fetch dữ liệu từ Supabase
  const fetchData = async () => {
    // 1. Lấy dữ liệu thô
    const { data, error } = await supabase
      .from('projects')
      .select('*, items(*)'); // Bỏ order trong query để JS xử lý cho chắc chắn

    if (data) {
      // 2. Sắp xếp thủ công bằng JS (Chắc chắn hoạt động)
      const sortedProjects = data.sort((a, b) => {
          // Ép kiểu về số, nếu null thì tính là 0
          return (Number(b.priority) || 0) - (Number(a.priority) || 0);
      });

      // 3. Sắp xếp Items bên trong từng Project
      const finalData = sortedProjects.map((p) => ({
        ...p,
        items: Array.isArray(p.items) 
          ? p.items.sort((a: any, b: any) => (Number(b.priority) || 0) - (Number(a.priority) || 0)) 
          : []
      })) as Project[];

      setProjects(finalData);
    }
    setLoading(false);
  };

  // ... (Phần còn lại giữ nguyên)

  // Helper lấy ảnh thumbnail cho Grid (Lấy ảnh đầu tiên của item ưu tiên nhất)
  const getThumbnail = (item: Item, type: string) => {
    if (type === 'review') return item.after_img || item.before_img;
    return item.gallery_imgs?.[0];
  };

  // Helper lấy tất cả ảnh để hiển thị trong Overlay Gallery
  const getAllImages = (project: Project) => {
    let images: { url: string; caption: string }[] = [];
    project.items.forEach(item => {
        if (project.type === 'review') {
            if (item.before_img) images.push({ url: item.before_img, caption: `Before: ${item.title}` });
            if (item.after_img) images.push({ url: item.after_img, caption: `After: ${item.title}` });
        } else {
            item.gallery_imgs?.forEach((img, idx) => {
                images.push({ url: img, caption: `${item.title} (Shot ${idx + 1})` });
            });
        }
    });
    return images;
  };

  // Xử lý mở/đóng Overlay
  const openOverlay = (project: Project) => {
    setSelectedProject(project);
    setIsOverlayOpen(true);
    document.body.style.overflow = 'hidden'; // Khóa cuộn trang chính
  };

  const closeOverlay = () => {
    setIsOverlayOpen(false);
    document.body.style.overflow = ''; // Mở khóa cuộn
    // Delay set null để chờ hiệu ứng đóng xong
    setTimeout(() => setSelectedProject(null), 600);
  };

  if (loading) return <div className="text-center py-20 font-vibe uppercase">Loading Archive...</div>;

  return (
    <>
      {/* --- PHẦN 1: GIAO DIỆN CHÍNH (SIDEBAR + LIST) --- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 transition-opacity duration-300">
        
        {/* LEFT SIDEBAR (Sticky) */}
        <aside className="md:col-span-3 h-fit sticky top-24">
            <div className="border-l-2 border-black pl-6 py-2">
                <h2 className="font-vibe text-4xl font-bold tracking-tighter leading-none mb-2">PROJECTS</h2>
                <p className="text-xs text-gray-500 font-mono mb-8">SELECTED WORKS 2024 — 2026</p>
                
                <div className="space-y-4">
                    <div className="flex justify-between items-center group cursor-pointer">
                        <span className="font-vibe text-lg font-bold text-gray-400 group-hover:text-black transition-colors">TOTAL ITEMS</span>
                        <span className="font-mono text-sm font-bold">{projects.reduce((acc, curr) => acc + curr.items.length, 0)}</span>
                    </div>
                    <div className="flex justify-between items-center group cursor-pointer">
                        <span className="font-vibe text-lg font-bold text-gray-400 group-hover:text-black transition-colors">CATEGORIES</span>
                        <span className="font-mono text-sm font-bold">02</span>
                    </div>
                </div>

                <div className="mt-12">
                    <p className="text-[10px] font-bold tracking-widest uppercase mb-4 text-gray-400">Filter Status</p>
                    <div className="flex flex-wrap gap-2">
                        <span className="border border-black px-2 py-1 text-[10px] font-bold font-vibe hover:bg-black hover:text-white cursor-pointer transition-colors">PREVIEW</span>
                        <span className="border border-gray-200 text-gray-400 px-2 py-1 text-[10px] font-bold font-vibe hover:border-black hover:text-black cursor-pointer transition-colors">NORMAL</span>
                    </div>
                </div>
            </div>
        </aside>

        {/* RIGHT LIST (Project Cards) */}
        <section className="md:col-span-9">
            <div className="space-y-16">
                {projects.map((project) => (
                    <div key={project.id} className="group mb-16">
                        {/* Header Card */}
                        <div 
                            onClick={() => openOverlay(project)}
                            className="flex justify-between items-end mb-6 border-b border-black pb-4 cursor-pointer"
                        >
                            <div className="group/title">
                                <h3 className="font-vibe text-5xl md:text-6xl font-black tracking-tighter leading-none text-black group-hover/title:text-blue-600 transition-colors duration-300 uppercase">
                                    {project.title}
                                </h3>
                                <div className="flex items-center gap-3 mt-3">
                                    <span className="w-2 h-2 bg-blue-600"></span> 
                                    <p className="font-vibe text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.3em]">
                                        {project.type} TYPE
                                    </p>
                                </div>
                            </div>
                            
                            <div className="hidden md:flex items-center gap-4 group/btn">
                                <span className="font-vibe text-[11px] font-extrabold uppercase tracking-[0.25em] border-b-2 border-transparent group-hover/btn:border-black group-hover/btn:tracking-[0.35em] transition-all duration-300">
                                    View Case
                                </span>
                                <div className="w-10 h-10 border border-black rounded-full flex items-center justify-center transition-all duration-300 group-hover/btn:bg-black group-hover/btn:text-white group-hover/btn:rotate-45">
                                    <ArrowUpRight size={16} />
                                </div>
                            </div>
                        </div>

                        {/* Grid 4 ảnh preview */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" onClick={() => openOverlay(project)}>
                            {project.items.slice(0, 4).map((item, idx) => {
                                const imgUrl = getThumbnail(item, project.type);
                                return (
                                    <div key={idx} className="aspect-video bg-gray-100 relative group/img cursor-pointer overflow-hidden border border-transparent hover:border-black transition-colors">
                                        {imgUrl ? (
                                            <img 
                                                src={imgUrl} 
                                                alt={item.title} 
                                                className="w-full h-full object-cover grayscale group-hover/img:grayscale-0 transition-all duration-500 transform group-hover/img:scale-105" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-300 font-vibe">NO IMAGE</div>
                                        )}
                                        <div className="absolute inset-0 bg-black/10 group-hover/img:bg-transparent transition-colors"></div>
                                        <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/80 to-transparent">
                                            <span className="text-white text-[10px] font-bold font-vibe tracking-widest uppercase truncate block">
                                                {item.title}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </section>
      </div>

      {/* --- PHẦN 2: OVERLAY DETAIL (Slide Up) --- */}
      <div 
        className={`fixed inset-0 z-[100] bg-white flex flex-col h-screen w-screen overflow-hidden transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${
            isOverlayOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Overlay Header */}
        <div className="h-20 border-b border-black flex justify-between items-center px-6 bg-white shrink-0">
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-600 rounded-none"></span>
                <span className="font-vibe text-lg font-bold tracking-widest uppercase">Project Detail</span>
            </div>
            
            <button 
                onClick={closeOverlay} 
                className="group flex items-center gap-2 hover:text-blue-600 transition-colors"
            >
                <span className="font-vibe text-sm font-bold tracking-widest uppercase hidden md:block">Close Project</span>
                <div className="w-10 h-10 border border-black flex items-center justify-center transition-transform duration-500 group-hover:rotate-90 group-hover:border-blue-600">
                    <X size={20} />
                </div>
            </button>
        </div>

        {/* Overlay Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-white">
            {selectedProject && (
                <div className="max-w-5xl mx-auto pb-20 animate-fade-in">
                    <h1 className="font-vibe text-6xl md:text-8xl font-black tracking-tighter leading-none mb-4 text-black border-b-[6px] border-black pb-4 uppercase">
                        {selectedProject.title}
                    </h1>
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mt-12">
                        {/* Cột trái: Info */}
                        <div className="md:col-span-4">
                            <div className="sticky top-12">
                                <div className="space-y-8 mb-12">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Project Type</p>
                                        <p className="font-vibe text-xl font-bold border-l-2 border-black pl-3 uppercase">{selectedProject.type}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Items Count</p>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="border border-black px-3 py-1 text-[10px] font-bold font-vibe cursor-default">
                                                {selectedProject.items.length} ITEMS
                                            </span>
                                            <span className="border border-black px-3 py-1 text-[10px] font-bold font-vibe cursor-default">
                                                PRIORITY {selectedProject.priority}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-12 text-sm leading-relaxed text-gray-800">
                                    <p className="mb-4">
                                        Dự án <strong>{selectedProject.title}</strong> bao gồm các hạng mục được thiết kế và xử lý kỹ lưỡng.
                                        Sử dụng công nghệ tối ưu để mang lại trải nghiệm hình ảnh tốt nhất.
                                    </p>
                                </div>

                                <button className="group w-full bg-black text-white py-4 font-vibe text-xl font-bold uppercase tracking-widest hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
                                    Live Demo 
                                    <ArrowRight className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Cột phải: Gallery */}
                        <div className="md:col-span-8">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 text-right">Visual Documentation</p>
                            
                            {getAllImages(selectedProject).map((img, idx) => (
                                <div key={idx} className="mb-8 group">
                                    <div className="overflow-hidden border border-gray-200">
                                        <img 
                                            src={img.url} 
                                            alt={img.caption}
                                            className="w-full h-auto transform transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center mt-2 border-b border-gray-200 pb-1">
                                        <p className="font-vibe text-xs font-bold uppercase tracking-widest text-gray-500">Figure: {img.caption}</p>
                                        <span className="text-[10px] font-mono text-gray-400">0{idx + 1}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </>
  );
}