import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadImage } from '../../utils/upload'; // Đảm bảo bạn đã có file này từ bước fix lỗi trước
import { Image as ImageIcon, Save } from 'lucide-react';

export default function InfoManager() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Tự động lấy thông tin khi mở lên
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    // Lấy dòng đầu tiên trong bảng profile
    const { data } = await supabase.from('profile').select('*').single();
    if (data) setProfile(data);
    // Nếu chưa có data thì để profile rỗng chứ không crash
    else setProfile({ name: '', title: '', skills: '', description: '', email: '', bio_img: '' });
    setLoading(false);
  };

  // 2. Hàm Lưu
  const handleSave = async () => {
    setIsSaving(true);
    
    // Nếu chưa có ID thì là tạo mới (Insert), có rồi thì là sửa (Update)
    // Nhưng vì ta chỉ dùng 1 profile duy nhất, ta dùng upsert (có thì sửa, chưa thì tạo)
    const { error } = await supabase
        .from('profile')
        .upsert({ 
            id: profile.id || 1, // Luôn giữ ID là 1
            ...profile 
        });

    if (!error) alert("Đã cập nhật Profile thành công!");
    else alert("Lỗi khi lưu: " + error.message);
    
    setIsSaving(false);
  };

  // 3. Hàm Upload Ảnh
  const handleUpload = async (file: File) => {
    const url = await uploadImage(file);
    if (url) setProfile({ ...profile, bio_img: url });
  };

  if (loading) return <div className="p-8 text-gray-500">Đang tải dữ liệu...</div>;

  return (
    <div className="h-full p-8 overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto bg-white p-8 border border-gray-200 shadow-sm">
            
            {/* HEADER */}
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold font-vibe uppercase tracking-tighter">Edit Profile</h2>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-black text-white px-6 py-2 font-vibe uppercase font-bold text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                    <Save size={16} />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* FORM */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* Cột trái: Text Info */}
                <div className="md:col-span-8 space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Display Name</label>
                        <input 
                            value={profile.name} 
                            onChange={e => setProfile({...profile, name: e.target.value})}
                            className="w-full p-2 border border-gray-300 font-bold focus:border-black outline-none" 
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Title / Role</label>
                            <input 
                                value={profile.title} 
                                onChange={e => setProfile({...profile, title: e.target.value})}
                                className="w-full p-2 border border-gray-300 focus:border-black outline-none" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Email</label>
                            <input 
                                value={profile.email} 
                                onChange={e => setProfile({...profile, email: e.target.value})}
                                className="w-full p-2 border border-gray-300 focus:border-black outline-none" 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Skills (Phân cách bởi dấu • )</label>
                        <input 
                            value={profile.skills} 
                            onChange={e => setProfile({...profile, skills: e.target.value})}
                            className="w-full p-2 border border-gray-300 focus:border-black outline-none" 
                            placeholder="REACT • NODE • DESIGN"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Bio Description</label>
                        <textarea 
                            value={profile.description} 
                            onChange={e => setProfile({...profile, description: e.target.value})}
                            className="w-full p-2 border border-gray-300 focus:border-black outline-none h-32 resize-none" 
                        />
                    </div>
                </div>

                {/* Cột phải: Avatar */}
                <div className="md:col-span-4">
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Profile Picture</label>
                    <div className="relative group w-full aspect-[3/4] bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-black overflow-hidden transition-colors">
                        
                        {profile.bio_img ? (
                            <img src={profile.bio_img} className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon className="text-gray-300 w-12 h-12" />
                        )}

                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-white text-xs font-bold uppercase tracking-widest border-b border-white">Upload New</span>
                        </div>
                        
                        <input 
                            type="file" 
                            className="hidden absolute inset-0" 
                            onChange={e => e.target.files && handleUpload(e.target.files[0])} 
                        />
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
}