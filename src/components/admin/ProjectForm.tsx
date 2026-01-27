import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadImage } from '../../utils/upload';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Project, Item } from '../../types';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Project | null;
}

export default function ProjectForm({ onClose, onSuccess, initialData }: Props) {
  const [loading, setLoading] = useState(false);
  
  // State cho Project
  const [title, setTitle] = useState(initialData?.title || '');
  const [priority, setPriority] = useState(initialData?.priority || 0);
  const [type, setType] = useState<'review' | 'normal'>(initialData?.type || 'review');
  
  // State cho Items (Mảng các item)
  const [items, setItems] = useState<Partial<Item>[]>(initialData?.items || []);

  // -- LOGIC ITEM --
  const addItem = () => {
    setItems([...items, { title: 'Item mới', priority: 0, description: '', tool_used: '' }]);
  };

  const removeItem = async (index: number, itemId?: number) => {
    if (confirm('Xóa item này?')) {
      if (itemId) {
        // Nếu item đã có trong DB thì xóa luôn
        await supabase.from('items').delete().eq('id', itemId);
      }
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };

  const updateItem = (index: number, field: keyof Item, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  // -- LOGIC SAVE --
  const handleSave = async () => {
    if (!title) return alert('Nhập tên dự án!');
    setLoading(true);

    try {
      // 1. Lưu Project (Cha)
      const projectData = { title, type, priority };
      let projectId = initialData?.id;

      if (projectId) {
        await supabase.from('projects').update(projectData).eq('id', projectId);
      } else {
        const { data, error } = await supabase.from('projects').insert(projectData).select().single();
        if (error) throw error;
        projectId = data.id;
      }

      // 2. Lưu Items (Con)
      for (const item of items) {
        // Upload ảnh nếu người dùng chọn file mới (File object)
        // Lưu ý: Input file trả về FileList, ta cần xử lý logic upload ở component bên dưới
        // Ở đây giả định item.before_img là URL string sau khi đã upload xong
        // Để đơn giản hóa logic "Copy-Paste", ta sẽ upload ngay khi chọn ảnh (onChange)
        
        const itemData = {
          project_id: projectId,
          title: item.title,
          description: item.description,
          tool_used: item.tool_used,
          priority: item.priority,
          before_img: item.before_img,
          after_img: item.after_img,
          gallery_imgs: item.gallery_imgs
        };

        if (item.id) {
           await supabase.from('items').update(itemData).eq('id', item.id);
        } else {
           await supabase.from('items').insert(itemData);
        }
      }

      onSuccess();
    } catch (error) {
      console.error(error);
      alert('Lỗi lưu dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Helper component để upload nhanh
  const FileUploader = ({ label, currentUrl, onUpload }: any) => {
    const [uploading, setUploading] = useState(false);
    
    const handleFile = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      const url = await uploadImage(file);
      if (url) onUpload(url);
      setUploading(false);
    };

    return (
      <div className="mt-2">
        <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
        <div className="flex items-center gap-2">
            {currentUrl && <img src={currentUrl} className="w-10 h-10 object-cover rounded border" />}
            <input type="file" onChange={handleFile} className="text-xs" disabled={uploading} />
            {uploading && <span className="text-xs text-blue-500">Đang lên...</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-lg shadow-xl flex flex-col">
        {/* Header Modal */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
          <h2 className="font-bold text-lg">
            {initialData ? `Sửa Project: ${initialData.title}` : 'Tạo Project Mới'}
          </h2>
          <button onClick={onClose}><X /></button>
        </div>

        {/* Body Modal (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* 1. Project Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded bg-blue-50/50">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium">Tên Dự án</label>
              <input 
                value={title} onChange={e => setTitle(e.target.value)}
                className="w-full p-2 border rounded mt-1" 
                placeholder="VD: Retouch Album Wedding"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Độ ưu tiên (Số lớn lên đầu)</label>
              <input 
                type="number" value={priority} onChange={e => setPriority(Number(e.target.value))}
                className="w-full p-2 border rounded mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Loại (Không đổi được sau khi tạo)</label>
              <select 
                value={type} onChange={e => setType(e.target.value as any)}
                disabled={!!initialData} // Khóa nếu đang edit
                className="w-full p-2 border rounded mt-1 bg-white"
              >
                <option value="review">Review (Before/After)</option>
                <option value="normal">Normal (Gallery)</option>
              </select>
            </div>
          </div>

          {/* 2. Items List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-700">Danh sách Items ({items.length})</h3>
              <button onClick={addItem} className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm">
                <Plus size={16}/> Thêm Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="border p-4 rounded bg-gray-50 relative group">
                  <button 
                    onClick={() => removeItem(idx, item.id)}
                    className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input 
                      placeholder="Tên Item" 
                      value={item.title} 
                      onChange={e => updateItem(idx, 'title', e.target.value)}
                      className="p-2 border rounded"
                    />
                    <input 
                      placeholder="Tool sử dụng (Ps, Lr...)" 
                      value={item.tool_used || ''} 
                      onChange={e => updateItem(idx, 'tool_used', e.target.value)}
                      className="p-2 border rounded"
                    />
                    <textarea 
                      placeholder="Mô tả..." 
                      value={item.description || ''} 
                      onChange={e => updateItem(idx, 'description', e.target.value)}
                      className="p-2 border rounded md:col-span-2 h-20"
                    />
                  </div>

                  {/* UPLOAD AREA - TÙY LOẠI PROJECT */}
                  <div className="bg-white p-3 rounded border border-dashed border-gray-300">
                    {type === 'review' ? (
                      <div className="grid grid-cols-2 gap-4">
                        <FileUploader 
                          label="Ảnh Before (Gốc)" 
                          currentUrl={item.before_img} 
                          onUpload={(url: string) => updateItem(idx, 'before_img', url)} 
                        />
                        <FileUploader 
                          label="Ảnh After (Đã sửa)" 
                          currentUrl={item.after_img} 
                          onUpload={(url: string) => updateItem(idx, 'after_img', url)} 
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2">Gallery Ảnh (Thêm từng ảnh)</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                           {item.gallery_imgs?.map((img, i) => (
                             <img key={i} src={img} className="w-16 h-16 object-cover rounded border" />
                           ))}
                        </div>
                        <input 
                          type="file" 
                          multiple
                          onChange={async (e) => {
                            // Upload nhiều ảnh
                            if(!e.target.files) return;
                            const newUrls = [];
                            for(let i=0; i<e.target.files.length; i++) {
                               const url = await uploadImage(e.target.files[i]);
                               if(url) newUrls.push(url);
                            }
                            const current = item.gallery_imgs || [];
                            updateItem(idx, 'gallery_imgs', [...current, ...newUrls]);
                          }}
                          className="text-xs"
                        />
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Modal */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-lg">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded">Hủy</button>
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : 'Lưu Dự án'}
          </button>
        </div>
      </div>
    </div>
  );
}