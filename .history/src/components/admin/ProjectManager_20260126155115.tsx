import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Project, Item } from '../../types';
import { uploadImage } from '../../utils/upload';
import { Image as ImageIcon } from 'lucide-react';

// --- QUAN TRỌNG: ĐỊA KHAI BÁO COMPONENT CON Ở NGOÀI (Fix lỗi mất focus) ---
const VibeLabel = ({children}: {children: React.ReactNode}) => (
  <label className="block font-vibe uppercase tracking-tighter leading-none text-xs text-gray-500 mb-1">
    {children}
  </label>
);

const VibeInput = (props: any) => (
  <input 
    {...props} 
    className={`w-full p-2 border border-gray-200 font-vibe font-medium outline-none focus:border-black focus:bg-gray-50 transition-all text-sm ${props.className || ''}`} 
  />
);
// --------------------------------------------------------------------------

export default function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // -- 1. FETCH DATA --
  const fetchProjects = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('projects')
      .select('*, items(*)')
      .order('priority', { ascending: false });
    
    if (data) {
        // Sắp xếp items bên trong
        const sorted = data.map(p => ({
            ...p,
            items: Array.isArray(p.items) ? p.items.sort((a: any, b: any) => b.priority - a.priority) : []
        }));
        setProjects(sorted as Project[]);
        
        // Nếu đang edit project nào thì cập nhật lại data cho nó luôn
        if (selectedProject) {
            const updated = sorted.find(p => p.id === selectedProject.id);
            if(updated) setSelectedProject(updated);
        }
    }
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  // -- 2. HANDLERS --
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
        // 1. Update Project Info
        await supabase.from('projects').update({
            title: selectedProject.title,
            type: selectedProject.type,
            priority: selectedProject.priority
        }).eq('id', selectedProject.id);

        // 2. Update/Insert Items
        for (const item of selectedProject.items) {
            const itemPayload = {
                project_id: selectedProject.id,
                title: item.title,
                description: item.description,
                tool_used: item.tool_used,
                priority: item.priority,
                before_img: item.before_img,
                after_img: item.after_img,
                gallery_imgs: item.gallery_imgs
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
    // Fix lỗi TypeScript bằng cách ép kiểu any tạm thời cho item mới chưa có ID
    const newItem: any = {
        project_id: selectedProject.id,
        title: 'New Item',
        priority: 0,
        description: '',
        tool_used: ''
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

  return (
    <>
    {/* HEADER */}
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
        <h1 className="font-vibe uppercase tracking-tighter text-3xl font-bold">Project Management</h1>
        <button onClick={handleCreateNew} className="bg-black text-white px-6 py-2 rounded-sm font-vibe uppercase tracking-tighter text-lg font-bold hover:bg-gray-800 transition-colors">
            + Create New Project
        </button>
    </header>

    <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: LIST */}
        <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
                <input type="text" placeholder="SEARCH PROJECTS..." className="w-full bg-white border border-gray-300 px-3 py-2 font-vibe uppercase tracking-tighter text-sm rounded-sm focus:border-black outline-none" />
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {projects.map(p => (
                    <div 
                        key={p.id}
                        onClick={() => setSelectedProject(p)}
                        className={`p-4 border cursor-pointer relative group transition-all ${
                            selectedProject?.id === p.id 
                            ? 'border-black bg-gray-50' 
                            : 'border-gray-200 hover:border-gray-400 bg-white'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-vibe uppercase tracking-tighter text-xl font-bold">{p.title}</span>
                            <span className={`text-[10px] px-2 py-0.5 font-vibe uppercase tracking-tighter rounded-full ${
                                p.type === 'review' ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                                {p.type} Type
                            </span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-xs text-gray-400 font-vibe uppercase tracking-tighter">{p.items.length} Items</span>
                            <span className="text-xs font-bold font-vibe uppercase tracking-tighter">Priority: {p.priority}</span>
                        </div>
                        {selectedProject?.id === p.id && <div className="absolute right-0 top-0 bottom-0 w-1 bg-black"></div>}
                    </div>
                ))}
            </div>
        </div>

        {/* RIGHT COLUMN: EDITOR (DETAIL) */}
        <div className="w-2/3 bg-gray-50 overflow-y-auto p-8">
            {selectedProject ? (
                <div className="max-w-4xl mx-auto space-y-8 pb-20">
                    
                    {/* SECTION: GENERAL INFO */}
                    <div className="bg-white p-6 border border-gray-200 shadow-sm rounded-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-vibe uppercase tracking-tighter text-2xl font-bold border-l-4 border-black pl-3">General Information</h2>
                            <div className="flex space-x-2">
                                <button onClick={handleDeleteProject} className="text-red-500 hover:bg-red-50 px-3 py-1 font-vibe uppercase tracking-tighter font-bold text-sm border border-transparent hover:border-red-200">Delete</button>
                                <button onClick={handleSave} className="bg-black text-white px-4 py-1 font-vibe uppercase tracking-tighter font-bold text-sm hover:bg-gray-800">
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <VibeLabel>Project Name</VibeLabel>
                                <VibeInput 
                                    value={selectedProject.title} 
                                    onChange={(e:any) => setSelectedProject({...selectedProject, title: e.target.value})} 
                                    className="text-xl"
                                />
                            </div>
                            
                            <div>
                                <VibeLabel>Display Type</VibeLabel>
                                <select 
                                    value={selectedProject.type}
                                    onChange={(e:any) => setSelectedProject({...selectedProject, type: e.target.value})} 
                                    className="w-full p-3 border border-gray-200 font-vibe font-medium outline-none focus:border-black bg-white uppercase text-sm"
                                >
                                    <option value="review">PREVIEW (BEFORE/AFTER)</option>
                                    <option value="normal">NORMAL (GALLERY)</option>
                                </select>
                            </div>

                            <div>
                                <VibeLabel>Priority (Higher = Top)</VibeLabel>
                                <VibeInput 
                                    type="number"
                                    value={selectedProject.priority} 
                                    onChange={(e:any) => setSelectedProject({...selectedProject, priority: Number(e.target.value)})} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION: ITEMS */}
                    <div className="bg-white p-6 border border-gray-200 shadow-sm rounded-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-vibe uppercase tracking-tighter text-2xl font-bold border-l-4 border-blue-600 pl-3">Project Items</h2>
                            <button onClick={handleAddItem} className="bg-gray-100 text-black px-4 py-1 font-vibe uppercase tracking-tighter font-bold text-sm border border-gray-300 hover:bg-gray-200">+ Add Item</button>
                        </div>

                        <div className="space-y-6">
                            {selectedProject.items.map((item, idx) => (
                                <div key={idx} className="border-2 border-black p-4 bg-gray-50 relative group">
                                    <div 
                                        onClick={() => handleRemoveItem(idx, item.id)}
                                        className="absolute -top-3 -right-3 bg-black text-white w-6 h-6 flex items-center justify-center rounded-full text-xs cursor-pointer hover:bg-red-600 z-10"
                                    >✕</div>
                                    <div className="absolute -top-3 left-4 bg-black text-white px-2 py-0.5 font-vibe uppercase tracking-tighter text-xs font-bold">
                                        ITEM #{idx + 1}
                                    </div>

                                    <div className="grid grid-cols-12 gap-6 mt-4">
                                        {/* Left: Text Inputs */}
                                        <div className="col-span-5 space-y-4">
                                            <div>
                                                <VibeLabel>Item Name</VibeLabel>
                                                <VibeInput value={item.title} onChange={(e:any) => handleUpdateItem(idx, 'title', e.target.value)} />
                                            </div>
                                            <div>
                                                <VibeLabel>Priority</VibeLabel>
                                                <VibeInput type="number" value={item.priority} onChange={(e:any) => handleUpdateItem(idx, 'priority', Number(e.target.value))} />
                                            </div>
                                            <div>
                                                <VibeLabel>Tools Used</VibeLabel>
                                                <VibeInput value={item.tool_used || ''} onChange={(e:any) => handleUpdateItem(idx, 'tool_used', e.target.value)} />
                                            </div>
                                            <div>
                                                <VibeLabel>Description</VibeLabel>
                                                <textarea 
                                                    value={item.description || ''} 
                                                    onChange={(e:any) => handleUpdateItem(idx, 'description', e.target.value)}
                                                    className="w-full p-2 border border-gray-200 font-vibe font-medium outline-none focus:border-black text-sm h-20"
                                                />
                                            </div>
                                        </div>

                                        {/* Right: Images */}
                                        <div className="col-span-7">
                                            {selectedProject.type === 'review' ? (
                                                <div className="grid grid-cols-2 gap-4">
                                                    {/* BEFORE IMG */}
                                                    <div className="group/img relative">
                                                        <VibeLabel><span className="text-center block">BEFORE (ORIGINAL)</span></VibeLabel>
                                                        <label className="aspect-square border-2 border-dashed border-gray-300 rounded bg-white flex flex-col items-center justify-center cursor-pointer hover:border-black transition-colors overflow-hidden relative">
                                                            {item.before_img ? (
                                                                <img src={item.before_img} className="w-full h-full object-cover" />
                                                            ) : <ImageIcon className="text-gray-300"/>}
                                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-vibe font-bold uppercase">Click to Upload</div>
                                                            <input type="file" className="hidden" onChange={(e) => e.target.files && handleUpload(e.target.files[0], (url) => handleUpdateItem(idx, 'before_img', url))} />
                                                        </label>
                                                    </div>

                                                    {/* AFTER IMG */}
                                                    <div className="group/img relative">
                                                        <VibeLabel><span className="text-center block text-blue-600">AFTER (RETOUCHED)</span></VibeLabel>
                                                        <label className="aspect-square border-2 border-dashed border-blue-200 rounded bg-white flex flex-col items-center justify-center cursor-pointer hover:border-blue-600 transition-colors overflow-hidden relative">
                                                            {item.after_img ? (
                                                                <img src={item.after_img} className="w-full h-full object-cover" />
                                                            ) : <ImageIcon className="text-blue-200"/>}
                                                             <div className="absolute inset-0 bg-blue-600/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-vibe font-bold uppercase">Click to Upload</div>
                                                            <input type="file" className="hidden" onChange={(e) => e.target.files && handleUpload(e.target.files[0], (url) => handleUpdateItem(idx, 'after_img', url))} />
                                                        </label>
                                                    </div>
                                                </div>
                                            ) : (
                                                // NORMAL TYPE (GALLERY)
                                                <div>
                                                    <VibeLabel>Gallery Images</VibeLabel>
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        {item.gallery_imgs?.map((img, i) => (
                                                            <img key={i} src={img} className="w-16 h-16 object-cover border border-gray-300" />
                                                        ))}
                                                    </div>
                                                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-2 text-xs font-vibe font-bold uppercase block text-center border border-dashed border-gray-400">
                                                        + Upload More Images
                                                        <input type="file" multiple className="hidden" onChange={async (e) => {
                                                            if(!e.target.files) return;
                                                            const urls = [];
                                                            for(let i=0; i<e.target.files.length; i++) {
                                                                const u = await uploadImage(e.target.files[i]);
                                                                if(u) urls.push(u);
                                                            }
                                                            handleUpdateItem(idx, 'gallery_imgs', [...(item.gallery_imgs||[]), ...urls]);
                                                        }} />
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 text-center pb-8">
                        <p className="text-[10px] text-gray-400 font-vibe uppercase tracking-tighter">CMS VERSION 2.0 • VIBE EDITION</p>
                    </div>

                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <div className="text-6xl mb-4">←</div>
                    <p className="font-vibe uppercase tracking-tighter text-xl font-bold">Select a project to edit</p>
                </div>
            )}
        </div>
    </div>
    </>
  );
}