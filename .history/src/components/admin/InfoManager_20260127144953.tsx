import React, { useEffect, useState, useRef } from 'react'; // Thêm useRef
import { supabase } from '../../lib/supabase';
import { uploadImage } from '../../utils/upload';
import { Image as ImageIcon, Save, Upload } from 'lucide-react';

export default function InfoManager() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // 1. Tạo Ref để điều khiển thẻ Input từ xa
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data } = await supabase.from('profile').select('*').single();
    if (data) setProfile(data);
    else setProfile({ name: '', title: '', skills: '', description: '', email: '', bio_img: '' });
    setLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase
        .from('profile')
        .upsert({ id: 1, ...profile }); // Luôn dùng ID=1

    if (!error) alert("Đã cập nhật Profile thành công!");
    else alert("Lỗi khi lưu: " + error.message);
    
    setIsSaving(false);
  };

  const handleUpload = async (file: File) => {
    if (!file) return;
    
    // Hiện thông báo đang upload (để biết là nó đang chạy)
    const originalText = profile.bio_img;
    setProfile({ ...profile, bio_img: 'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif' }); // Loading gif tạm

    const url = await uploadImage(file);
    if (url) {
        setProfile({ ...profile, bio_img: url });
    } else {
        alert("Upload thất bại!");
        setProfile({ ...profile, bio_img: originalText }); // Trả lại ảnh cũ nếu lỗi
    }
  };

  // Hàm kích hoạt click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (loading) return <div className="p-8 text-gray-500 font-vibe">ĐANG TẢI DỮ LIỆU...</div>;

  return (
    <div className="h-full p-8 overflow-y-auto bg-gray-50 font-sans">
        <div className="max-w-5xl mx-auto bg-white p-8 border border-gray-200 shadow-sm">
            
            {/* HEADER */}
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                <h2 className="text-3xl font-bold font-vibe uppercase tracking-tighter">Edit Profile</h2>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-black text-white px-6 py-2 font-vibe uppercase font-bold text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                    <Save size={16} />
                    {isSaving ? 'SAVING...' : 'SAVE CHANGES'}
                </button>
            </div>

            {/* FORM */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                
                {/* CỘT TRÁI: TEXT INFO */}
                <div className="md:col-span-8 space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1 tracking-widest font-vibe">Display Name</label>
                        <input 
                            value={profile.name} 
                            onChange={e => setProfile({...profile, name: e.target.value})}
                            className="w-full p-3 border-b border-gray-200 font-bold text-xl focus:border-black outline-none bg-transparent font-vibe uppercase"
                            placeholder="YOUR NAME"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1 tracking-widest font-vibe">Title / Role</label>
                            <input 
                                value={profile.title} 
                                onChange={e => setProfile({...profile, title: e.target.value})}
                                className="w-full p-2 border border-gray-200 focus:border-black outline-none bg-gray-50 text-sm font-bold font-vibe uppercase" 
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1 tracking-widest font-vibe">Email</label>
                            <input 
                                value={profile.email} 
                                onChange={e => setProfile({...profile, email: e.target.value})}
                                className="w-full p-2 border border-gray-200 focus:border-black outline-none bg-gray-50 text-sm font-bold font-vibe uppercase" 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1 tracking-widest font-vibe">Skills (Separator: •)</label>
                        <input 
                            value={profile.skills} 
                            onChange={e => setProfile({...profile, skills: e.target.value})}
                            className="w-full p-2 border border-gray-200 focus:border-black outline-none bg-gray-50 text-sm font-bold font-vibe uppercase" 
                            placeholder="REACT • NODE • DESIGN"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1 tracking-widest font-vibe">Bio Description</label>
                        <textarea 
                            value={profile.description} 
                            onChange={e => setProfile({...profile, description: e.target.value})}
                            className="w-full p-3 border border-gray-200 focus:border-black outline-none h-32 resize-none bg-gray-50 text-sm leading-relaxed" 
                        />
                    </div>
                </div>

                {/* CỘT PHẢI: ẢNH ĐẠI DIỆN (ĐÃ FIX) */}
                <div className="md:col-span-4">
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-2 tracking-widest font-vibe">Profile Picture</label>
                    
                    {/* Khu vực hiển thị ảnh */}
                    <div 
                        onClick={triggerFileInput} // Bấm vào đây để kích hoạt input
                        className="relative group w-full aspect-[3/4] bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-black overflow-hidden transition-all duration-300"
                    >
                        {profile.bio_img ? (
                            <img src={profile.bio_img} className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center text-gray-400">
                                <ImageIcon size={48} strokeWidth={1} />
                                <span className="font-vibe text-xs mt-2 uppercase tracking-widest">No Image</span>
                            </div>
                        )}

                        {/* Lớp phủ khi hover */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                            <div className="bg-white text-black px-4 py-2 font-vibe font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                <Upload size={14} /> Change Photo
                            </div>
                        </div>
                    </div>

                    {/* INPUT FILE ẨN (Nằm tách biệt hẳn ra ngoài) */}
                    <input 
                        type="file" 
                        ref={fileInputRef} // Gắn ref vào đây
                        className="hidden" 
                        accept="image/*"
                        onChange={e => e.target.files && handleUpload(e.target.files[0])} 
                    />
                    
                    <p className="mt-3 text-[10px] text-gray-400 font-vibe uppercase text-center tracking-widest">
                        Recommended: Portrait (3:4 Ratio)
                    </p>
                </div>

            </div>
        </div>
    </div>
  );
}