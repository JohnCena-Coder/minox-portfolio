import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Project, Item } from '../types';
import { X, ArrowRight, ArrowUpRight, ZoomIn } from 'lucide-react';
import ComparisonSlider from './ComparisonSlider';

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Overlay (Detail Project)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  // State Zoom Ảnh (Lightbox)
  const [zoomedImg, setZoomedImg] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data } = await supabase.from('projects').select('*, items(*)');
    if (data) {
      // Sắp xếp Project theo Priority giảm dần
      const sortedProjects = data.sort((a, b) => (Number(b.priority) || 0) - (Number(a.priority) || 0));
      
      // Sắp xếp Items bên trong theo Priority giảm dần
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

  // --- LOGIC TÍNH TOÁN THỐNG KÊ (NEW) ---
  // 1. Tính tổng số Items (Cộng dồn số item của từng project)
  const totalItemsCount = projects.reduce((acc, project) => acc + (project.items?.length || 0), 0);
  
  // 2. Tính tổng số Projects
  const totalProjectsCount = projects.length;

  // Helper format số: Thêm số 0 đằng trước nếu nhỏ hơn 10 (VD: 5 -> 05)
  const formatNumber = (num: number) => num < 10 ? `0${num}` : num;
  // ---------------------------------------

  const getThumbnail = (item: Item, type: string) => {
    if (type === 'review') return item.after_img || item.before_img;
    return item.gallery_imgs?.[0];
  };

  const openOverlay = (project: Project) => {
    setSelectedProject(project);
    setIsOverlayOpen(true);
    document.body.classList.add('noscroll');
  };

  const closeOverlay = () => {
    setIsOverlayOpen(false);
    document.body.classList.remove('noscroll');
    setTimeout(() => setSelectedProject(null), 600);
  };

  if (loading) return <div className="text-center py-20 font-vibe uppercase">Loading Archive...</div>;

  return (
    <>
      {/* --- DANH SÁCH DỰ ÁN (GRID VIEW) --- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 transition-opacity duration-300">
        
        {/* SIDEBAR TRÁI (ĐÃ CẬP NHẬT) */}
        <aside className="md:col-span-3 h-fit sticky top-24">
            <div className="border-l-2 border-black pl-6 py-2">
                <h2 className="font-vibe text-4xl font-bold tracking-tighter leading-none mb-2">PROJECTS</h2>
                <p className="text-xs text-gray-500 font-mono mb-8">SELECTED WORKS 2024 — 2026</p>
                
                {/* PHẦN THỐNG KÊ (STATS) */}
                <div className="space-y-4">
                    {/* Dòng 1: TOTAL ITEMS */}
                    <div className="flex justify-between items-center group cursor-default">
                        <span className="font-vibe text-lg font-bold text-gray-400 group-hover:text-black transition-colors">TOTAL ITEMS</span>
                        {/* Hiển thị số lượng items thật */}
                        <span className="font-mono text-sm font-bold">
                            {formatNumber(totalItemsCount)}
                        </span>
                    </div>

                    {/* Dòng 2: PROJECTS (Thay cho CATEGORIES) */}
                    <div className="flex justify-between items-center group cursor-default">
                        <span className="font-vibe text-lg font-bold text-gray-400 group-hover:text-black transition-colors">PROJECTS</span>
                        {/* Hiển thị số lượng project thật */}
                        <span className="font-mono text-sm font-bold">
                            {formatNumber(totalProjectsCount)}
                        </span>
                    </div>
                </div>

                {/* FILTER STATUS (Giữ nguyên) */}
                <div className="mt-12">
                    <p className="text-[10px] font-bold tracking-widest uppercase mb-4 text-gray-400">Filter Status</p>
                    <div className="flex flex-wrap gap-2">
                         <span className="border border-black px-2 py-1 text-[10px] font-bold font-vibe hover:bg-black hover:text-white cursor-pointer transition-colors">PREVIEW</span>
                         <span className="border border-gray-200 text-gray-400 px-2 py-1 text-[10px] font-bold font-vibe hover:border-black hover:text-black cursor-pointer transition-colors">NORMAL</span>
                    </div>
                </div>
            </div>
        </aside>

        {/* DANH SÁCH PROJECT BÊN PHẢI (GIỮ NGUYÊN) */}
        <section className="md:col-span-9">
            <div className="space-y-16">
                {projects.map((project) => (
                    <div key={project.id} className="group mb-16">
                        <div onClick={() => openOverlay(project)} className="flex justify-between items-end mb-6 border-b border-black pb-4 cursor-pointer">
                            <div className="group/title">
                                <h3 className="font-vibe text-5xl md:text-6xl font-black tracking-tighter leading-none text-black group-hover/title:text-blue-600 transition-colors duration-300 uppercase">
                                    {project.title}
                                </h3>
                                <div className="flex items-center gap-3 mt-3">
                                    <span className="w-2 h-2 bg-blue-600"></span> 
                                    <p className="font-vibe text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.3em]">{project.type} TYPE</p>
                                </div>
                            </div>
                            <div className="hidden md:flex items-center gap-4 group/btn">
                                <span className="font-vibe text-[11px] font-extrabold uppercase tracking-[0.25em] border-b-2 border-transparent group-hover/btn:border-black transition-all">View Case</span>
                                <div className="w-10 h-10 border border-black rounded-full flex items-center justify-center transition-all group-hover/btn:bg-black group-hover/btn:text-white group-hover/btn:rotate-45"><ArrowUpRight size={16} /></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" onClick={() => openOverlay(project)}>
                            {project.items.slice(0, 4).map((item, idx) => {
                                const imgUrl = getThumbnail(item, project.type);
                                return (
                                    <div key={idx} className="aspect-video bg-gray-100 relative group/img cursor-pointer overflow-hidden border border-transparent hover:border-black transition-colors">
                                        {imgUrl ? (
                                            <img src={imgUrl} className="w-full h-full object-cover grayscale group-hover/img:grayscale-0 transition-all duration-500 transform group-hover/img:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-300 font-vibe">NO IMAGE</div>
                                        )}
                                        <div className="absolute inset-0 bg-black/10 group-hover/img:bg-transparent transition-colors"></div>
                                        {/* Hiệu ứng gradient đen ở dưới chân ảnh */}
                                        <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/80 to-transparent">
                                             <span className="text-white text-[10px] font-bold font-vibe tracking-widest uppercase">{item.title}</span>
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

      {/* --- OVERLAY DETAIL (GIỮ NGUYÊN) --- */}
      <div className={`fixed inset-0 z-[100] bg-white flex flex-col h-screen w-screen overflow-hidden transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${isOverlayOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="h-20 border-b border-black flex justify-between items-center px-6 bg-white shrink-0">
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-600 rounded-none"></span>
                <span className="font-vibe text-lg font-bold tracking-widest uppercase">Project Detail</span>
            </div>
            <button onClick={closeOverlay} className="group flex items-center gap-2 hover:text-blue-600 transition-colors">
                <span className="font-vibe text-sm font-bold tracking-widest uppercase hidden md:block">Close Project</span>
                <div className="w-10 h-10 border border-black flex items-center justify-center transition-transform duration-500 group-hover:rotate-90 group-hover:border-blue-600"><X size={20} /></div>
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 bg-white">
            {selectedProject && (
                <div className="max-w-6xl mx-auto pb-20 animate-fade-in">
                    <h1 className="font-vibe text-1xl md:text-2xl font-black tracking-tighter leading-none mb-4 text-black border-b-[6px] border-black pb-4 uppercase">
                        {selectedProject.title}
                    </h1>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mt-12">
                        <div className="md:col-span-4">
                            <div className="sticky top-12 space-y-8">
                                <div><p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Project Type</p><p className="font-vibe text-xl font-bold border-l-2 border-black pl-3 uppercase">{selectedProject.type}</p></div>
                                <div className="text-sm leading-relaxed text-gray-800"><p>Bấm vào ảnh để xem ở chế độ toàn màn hình (Zoom Mode).</p></div>
                            </div>
                        </div>

                        <div className="md:col-span-8">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-8 text-right">Visual Documentation</p>
                            
                            {selectedProject.items.map((item) => (
                                <div key={item.id} className="mb-16">
                                    <div className="flex items-center gap-3 mb-4 pb-2 border-b border-gray-100">
                                        <span className="font-mono text-xs font-bold text-gray-400">#{item.priority}</span>
                                        <h3 className="font-vibe text-2xl font-bold uppercase">{item.title}</h3>
                                    </div>

                                    {selectedProject.type === 'review' ? (
                                        <div className="border border-black/10 shadow-sm">
                                            {item.before_img && item.after_img ? (
                                                <ComparisonSlider beforeImg={item.before_img} afterImg={item.after_img} />
                                            ) : (
                                                <div className="p-10 text-center bg-gray-100 font-vibe text-gray-400">MISSING DATA</div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {item.gallery_imgs?.map((img, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className="group relative cursor-zoom-in"
                                                    onClick={() => setZoomedImg(img)}
                                                >
                                                    <img src={img} className="w-full h-auto border border-gray-200 hover:border-black transition-colors" loading="lazy" />
                                                    <div className="absolute top-2 right-2 bg-black text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ZoomIn size={16} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="mt-4 text-sm text-gray-600 font-vibe">
                                        {item.tool_used && <div><span className="font-bold text-black">TOOLS:</span> {item.tool_used}</div>}
                                        {item.description && <div>{item.description}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* --- LIGHTBOX (ZOOM FULLSCREEN) --- */}
      {zoomedImg && (
        <div 
            className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center cursor-zoom-out animate-fade-in"
            onClick={() => setZoomedImg(null)}
        >
            <button className="absolute top-4 right-4 text-white hover:text-gray-300">
                <X size={32} />
            </button>
            <img 
                src={zoomedImg} 
                className="max-w-[95vw] max-h-[95vh] object-contain shadow-2xl" 
                alt="Zoomed Preview"
            />
        </div>
      )}
    </>
  );
}