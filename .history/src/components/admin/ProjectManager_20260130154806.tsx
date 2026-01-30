import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Project, Item } from '../../types';
import { uploadImage } from '../../utils/upload';
// FIX 1: Import thêm icon X
import { Image as ImageIcon, X } from 'lucide-react';

// --- COMPONENTS CON (GIỮ NGUYÊN) ---
const VibeLabel = ({children}: {children: React.ReactNode}) => (
  <label className="block font-vibe uppercase tracking-tighter leading-none text-xs text-gray-500 mb-2">
    {children}
  </label>
);

const VibeInput = (props: any) => (
  <input 
    {...props} 
    className={`w-full p-3 border border-gray-200 font-vibe font-medium outline-none focus:border-black focus:bg-white bg-gray-50 transition-all text-sm ${props.className || ''}`} 
  />
);
// -----------------------------------

export default function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // -- 1. FETCH DATA (LOGIC GIỮ NGUYÊN) --
  const fetchProjects = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('projects')
      .select('*, items(*)')
      .order('priority', { ascending: false });
    
    if (data) {
        const sorted = data.map(p => ({
            ...p,
            items: Array.isArray(p.items) ? p.items.sort((a: any, b: any) => b.priority - a.priority) : []
        }));
        setProjects(sorted as Project[]);
        
        if (selectedProject) {
            const updated = sorted.find(p => p.id === selectedProject.id);
            if(updated) setSelectedProject(updated);
        }
    }
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  // -- 2. HANDLERS (CÁC HÀM CŨ GIỮ NGUYÊN) --
  const handleCreateNew = async () => {
    const title = prompt("Nhập tên dự án mới:");
    if (!title) return;
    
    const { data, error } = await supabase.from('projects').insert({
        title, type: 'review', priority: 10
    }).select().single();

    if (!error && data) {
        await fetchProjects();
        const newP = { ...data, items: [] };
        setSelectedProject(newP); 
    }
  };

  const handleSave = async () => {
    if (!selectedProject) return;
    setIsSaving(true);

    try {
        await supabase.from('projects').update({
            title: selectedProject.title,
            type: selectedProject.type,
            priority: selectedProject.priority
        }).eq('id', selectedProject.id);

        for (const item of selectedProject.items) {
            // Đảm bảo gallery_imgs là mảng hoặc null, tránh lỗi gửi lên Supabase
            const sanitizedGallery = (item.gallery_imgs && item.gallery_imgs.length > 0) ? item.gallery_imgs : null;

            const itemPayload = {
                project_id: selectedProject.id,
                title: item.title,
                description: item.description,
                tool_used: item.tool_used,
                priority: item.priority,
                before_img: item.before_img || null, // Đảm bảo null nếu rỗng
                after_img: item.after_img || null,   // Đảm bảo null nếu rỗng
                gallery_imgs: sanitizedGallery
            };

            if (item.id) {
                await supabase.from('items').update(itemPayload).eq('id', item.id);
            } else {
                await supabase.from('items').insert(itemPayload);
            }
        }
        
        alert("Đã lưu thay đổi thành công!");
        fetchProjects();
    } catch (err) {
        console.error(err);
        alert("Có lỗi khi lưu.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if(!selectedProject) return;
    if(!confirm("XÓA PROJECT NÀY? Hành động không thể hoàn tác.")) return;
    await supabase.from('projects').delete().eq('id', selectedProject.id);
    setSelectedProject(null);
    fetchProjects();
  };

  const handleAddItem = () => {
    if (!selectedProject) return;
    const newItem: any = {
        project_id: selectedProject.id,
        title: 'New Item',
        priority: 0,
        description: '',
        tool_used: '',
        gallery_imgs: [] // Khởi tạo mảng rỗng
    };
    setSelectedProject({
        ...selectedProject,
        items: [newItem, ...selectedProject.items]
    });
  };

  const handleUpdateItem = (index: number, field: keyof Item, value: any) => {
    if (!selectedProject) return;
    const newItems = [...selectedProject.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setSelectedProject({ ...selectedProject, items: newItems });
  };

  const handleRemoveItem = async (index: number, itemId?: number) => {
    if (!selectedProject) return;
    if (itemId) {
        if(!confirm("Xóa item này khỏi Database?")) return;
        await supabase.from('items').delete().eq('id', itemId);
    }
    const newItems = [...selectedProject.items];
    newItems.splice(index, 1);
    setSelectedProject({ ...selectedProject, items: newItems });
  };

  const handleUpload = async (file: File, callback: (url: string) => void) => {
    const url = await uploadImage(file);
    if(url) callback(url);
  };

  // FIX 2: Hàm mới để xóa 1 ảnh khỏi mảng gallery
  const handleRemoveGalleryImage = (itemIndex: number, imgIndexToRemove: number) => {
      if (!selectedProject) return;
      const currentItem = selectedProject.items[itemIndex];
      const currentGallery = currentItem.gallery_imgs || [];
      // Lọc bỏ ảnh tại vị trí index cần xóa
      const newGallery = currentGallery.filter((_, i) => i !== imgIndexToRemove);
      handleUpdateItem(itemIndex, 'gallery_imgs', newGallery);
  };


  // --- GIAO DIỆN (ĐÃ CẬP NHẬT NÚT XÓA) ---
  return (
    <div className="flex flex-col h-full w-full bg-white">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-20 relative">
            <h1 className="font-vibe uppercase tracking-tighter text-2xl font-bold flex items-center gap-2">
                <span className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-sm text-sm">PM</span>
                Project Manager
            </h1>
            <button onClick={handleCreateNew} className="bg-black text-white px-4 py-2 text-xs font-vibe uppercase tracking-widest font-bold hover:bg-gray-800 transition-colors">
                + New Project
            </button>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 flex overflow-hidden min-h-0">
            {/* LEFT COLUMN: LIST */}
            <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col h-full z-10">
                <div className="p-4 border-b border-gray-100 bg-white shrink-0">
                    <input type="text" placeholder="SEARCH..." className="w-full bg-gray-50 border border-gray-200 px-3 py-2 font-vibe uppercase tracking-widest text-xs outline-none focus:border-black transition-colors" />
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {projects.map(p => (
                        <div 
                            key={p.id}
                            onClick={() => setSelectedProject(p)}
                            className={`p-4 border-l-4 cursor-pointer transition-all ${
                                selectedProject?.id === p.id 
                                ? 'border-black bg-gray-50' 
                                : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-vibe uppercase tracking-tighter text-sm font-bold truncate pr-2">{p.title}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 font-vibe uppercase tracking-widest border ${
                                    p.type === 'review' ? 'border-black text-black' : 'border-gray-300 text-gray-500'
                                }`}>
                                    {p.type === 'review' ? 'Review' : 'Gallery'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-gray-400 font-vibe uppercase tracking-wider">
                                <span>{p.items.length} Items</span>
                                <span>Pri: {p.priority}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT COLUMN: EDITOR */}
            <div className="w-2/3 bg-gray-50 h-full overflow-y-auto pb-40 relative">
                {selectedProject ? (
                    <div className="max-w-3xl mx-auto p-8 space-y-8">
                        {/* 1. GENERAL INFO CARD */}
                        <div className="bg-white p-6 border border-gray-200 shadow-sm sticky top-0 z-10">
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                                <h2 className="font-vibe uppercase tracking-widest text-sm font-bold text-gray-400">Project Settings</h2>
                                <div className="flex gap-2">
                                    <button onClick={handleDeleteProject} className="text-red-500 hover:text-red-700 px-3 py-1 font-vibe uppercase tracking-widest text-[10px] font-bold">Delete</button>
                                    <button onClick={handleSave} className="bg-black text-white px-6 py-2 font-vibe uppercase tracking-widest text-[10px] font-bold hover:bg-gray-800 flex items-center gap-2">
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <VibeLabel>Project Name</VibeLabel>
                                    <VibeInput value={selectedProject.title} onChange={(e:any) => setSelectedProject({...selectedProject, title: e.target.value})} className="text-lg font-bold"/>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <VibeLabel>Type</VibeLabel>
                                        <select value={selectedProject.type} onChange={(e:any) => setSelectedProject({...selectedProject, type: e.target.value})} className="w-full p-3 border border-gray-200 font-vibe font-medium outline-none focus:border-black bg-white uppercase text-xs">
                                            <option value="review">Before / After</option>
                                            <option value="normal">Gallery Grid</option>
                                        </select>
                                    </div>
                                    <div>
                                        <VibeLabel>Priority</VibeLabel>
                                        <VibeInput type="number" value={selectedProject.priority} onChange={(e:any) => setSelectedProject({...selectedProject, priority: Number(e.target.value)})} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. ITEMS LIST */}
                        <div>
                            <div className="flex justify-between items-end mb-4 px-1">
                                <h2 className="font-vibe uppercase tracking-widest text-sm font-bold text-gray-400">Items ({selectedProject.items.length})</h2>
                                <button onClick={handleAddItem} className="bg-white text-black border border-black px-4 py-2 font-vibe uppercase tracking-widest text-[10px] font-bold hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]">+ Add Item</button>
                            </div>

                            <div className="flex flex-col gap-8">
                                {selectedProject.items.map((item, idx) => (
                                    <div key={idx} className="bg-white border border-gray-200 p-6 relative group shrink-0 shadow-sm hover:shadow-md transition-shadow">
                                        {/* Item Header */}
                                        <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                                            <div className="flex items-center gap-3">
                                                <span className="bg-black text-white px-2 py-1 font-vibe font-bold text-xs">#{idx + 1}</span>
                                                <input value={item.title} onChange={(e:any) => handleUpdateItem(idx, 'title', e.target.value)} className="font-vibe font-bold uppercase text-sm outline-none border-b border-transparent focus:border-black transition-colors min-w-[200px]" placeholder="ITEM NAME"/>
                                            </div>
                                            <button onClick={() => handleRemoveItem(idx, item.id)} className="text-gray-300 hover:text-red-500 transition-colors"><span className="font-vibe uppercase text-[10px] font-bold">Remove</span></button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Left: Inputs */}
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div><VibeLabel>Priority</VibeLabel><VibeInput type="number" value={item.priority} onChange={(e:any) => handleUpdateItem(idx, 'priority', Number(e.target.value))} /></div>
                                                    <div><VibeLabel>Tool Used</VibeLabel><VibeInput value={item.tool_used || ''} onChange={(e:any) => handleUpdateItem(idx, 'tool_used', e.target.value)} /></div>
                                                </div>
                                                <div><VibeLabel>Description</VibeLabel><textarea value={item.description || ''} onChange={(e:any) => handleUpdateItem(idx, 'description', e.target.value)} className="w-full p-3 border border-gray-200 font-vibe font-medium outline-none focus:border-black bg-gray-50 focus:bg-white text-xs h-24 resize-none leading-relaxed" placeholder="Write something about this work..."/></div>
                                            </div>

                                            {/* Right: Images */}
                                            <div>
                                                {selectedProject.type === 'review' ? (
                                                    // --- REVIEW MODE (Before/After) ---
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-2">
                                                            <VibeLabel>Before</VibeLabel>
                                                            <div className="aspect-square bg-gray-100 border border-gray-200 relative group/upload overflow-hidden">
                                                                {item.before_img ? (
                                                                    <>
                                                                        <img src={item.before_img} className="w-full h-full object-cover" />
                                                                        {/* FIX 3: Nút xóa ảnh Before */}
                                                                        <button 
                                                                            onClick={(e) => {e.stopPropagation(); handleUpdateItem(idx, 'before_img', null)}}
                                                                            className="absolute top-2 right-2 bg-white text-black p-1 rounded-full hover:bg-red-500 hover:text-white hover:border-red-500 border border-gray-200 z-20 transition-all opacity-0 group-hover/upload:opacity-100 shadow-sm"
                                                                            title="Remove image"
                                                                        >
                                                                            <X size={12} />
                                                                        </button>
                                                                    </>
                                                                ) : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon /></div>}
                                                                <label className="absolute inset-0 bg-black/80 opacity-0 group-hover/upload:opacity-100 flex items-center justify-center cursor-pointer transition-opacity z-10">
                                                                    <span className="text-white text-[10px] font-vibe font-bold uppercase">Upload</span>
                                                                    <input type="file" className="hidden" onChange={(e) => e.target.files && handleUpload(e.target.files[0], (url) => handleUpdateItem(idx, 'before_img', url))} />
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <VibeLabel>After (Main)</VibeLabel>
                                                            <div className="aspect-square bg-gray-100 border border-blue-200 relative group/upload overflow-hidden">
                                                                {item.after_img ? (
                                                                    <>
                                                                        <img src={item.after_img} className="w-full h-full object-cover" />
                                                                        {/* FIX 3: Nút xóa ảnh After */}
                                                                        <button 
                                                                            onClick={(e) => {e.stopPropagation(); handleUpdateItem(idx, 'after_img', null)}}
                                                                            className="absolute top-2 right-2 bg-white text-black p-1 rounded-full hover:bg-red-500 hover:text-white hover:border-red-500 border border-gray-200 z-20 transition-all opacity-0 group-hover/upload:opacity-100 shadow-sm"
                                                                            title="Remove image"
                                                                        >
                                                                            <X size={12} />
                                                                        </button>
                                                                    </>
                                                                ) : <div className="w-full h-full flex items-center justify-center text-blue-200"><ImageIcon /></div>}
                                                                <label className="absolute inset-0 bg-blue-600/90 opacity-0 group-hover/upload:opacity-100 flex items-center justify-center cursor-pointer transition-opacity z-10">
                                                                    <span className="text-white text-[10px] font-vibe font-bold uppercase">Upload</span>
                                                                    <input type="file" className="hidden" onChange={(e) => e.target.files && handleUpload(e.target.files[0], (url) => handleUpdateItem(idx, 'after_img', url))} />
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // --- NORMAL MODE (Gallery) ---
                                                    <div className="h-full bg-gray-50 border border-dashed border-gray-300 p-4 flex flex-col items-center justify-center text-center relative">
                                                        {/* FIX 4: Hiển thị danh sách thumbnail có nút xóa */}
                                                        {item.gallery_imgs && item.gallery_imgs.length > 0 && (
                                                            <div className="flex flex-wrap gap-3 justify-center mb-4 w-full">
                                                                {item.gallery_imgs.map((img, imgIdx) => (
                                                                    <div key={imgIdx} className="relative group/gallery-img w-14 h-14 border border-gray-200 bg-white p-0.5 shadow-sm">
                                                                        <img src={img} className="w-full h-full object-cover" />
                                                                        <button 
                                                                            onClick={() => handleRemoveGalleryImage(idx, imgIdx)}
                                                                            className="absolute -top-2 -right-2 bg-white text-black border border-gray-300 rounded-full p-0.5 opacity-0 group-hover/gallery-img:opacity-100 transition-all hover:bg-red-500 hover:text-white hover:border-red-500 shadow-sm z-10"
                                                                            title="Remove from gallery"
                                                                        >
                                                                            <X size={10} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        
                                                        <label className="cursor-pointer bg-white border border-gray-300 px-3 py-2 text-[10px] font-vibe font-bold uppercase hover:bg-black hover:text-white transition-colors shadow-sm">
                                                            {item.gallery_imgs && item.gallery_imgs.length > 0 ? '+ Add More Images' : 'Upload Gallery Images'}
                                                            <input type="file" multiple className="hidden" onChange={async (e) => {
                                                                if(!e.target.files) return;
                                                                const urls = [];
                                                                for(let i=0; i<e.target.files.length; i++) {
                                                                    const u = await uploadImage(e.target.files[i]);
                                                                    if(u) urls.push(u);
                                                                }
                                                                // Nối mảng cũ với ảnh mới
                                                                handleUpdateItem(idx, 'gallery_imgs', [...(item.gallery_imgs||[]), ...urls]);
                                                            }} />
                                                        </label>
                                                        
                                                        {(!item.gallery_imgs || item.gallery_imgs.length === 0) && (
                                                            <p className="text-[9px] text-gray-400 font-vibe uppercase mt-2 tracking-wider">No images in gallery yet</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 select-none">
                        <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center mb-4">
                            <span className="text-4xl pb-2">←</span>
                        </div>
                        <p className="font-vibe uppercase tracking-widest text-xs font-bold">Select a project to start editing</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}