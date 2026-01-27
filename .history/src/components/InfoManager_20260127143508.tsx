import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadImage } from '../../utils/upload';
import { Image as ImageIcon } from 'lucide-react';

// Tái sử dụng Style Vibe
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

export default function InfoManager() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    // Lấy dòng đầu tiên (vì web chỉ có 1 profile)
    const { data } = await supabase.from('profile').select('*').single();
    if (data) setProfile(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    const { error } = await supabase
        .from('profile')
        .update({
            name: profile.name,
            title: profile.title,
            skills: profile.skills,
            description: profile.description,
            email: profile.email,
            bio_img: profile.bio_img
        })
        .eq('id', profile.id);

    if (!error) alert("Profile Updated Successfully!");
    else alert("Error saving profile");
    
    setIsSaving(false);
  };

  const handleUpload = async (file: File) => {
    const url = await uploadImage(file);
    if (url) setProfile({ ...profile, bio_img: url });
  };

  if (loading) return <div>Loading Profile...</div>;
  if (!profile) return <div>No Profile Found</div>;

  return (
    <div className="h-full bg-gray-50 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto bg-white border border-gray-200 shadow-sm p-8">
            <div className="flex justify-between items-center mb-8 border-b border-black pb-4">
                <h2 className="font-vibe uppercase tracking-tighter text-3xl font-bold">Edit Profile Info</h2>
                <button 
                    onClick={handleSave}
                    className="bg-black text-white px-6 py-2 font-vibe uppercase tracking-tighter font-bold hover:bg-gray-800 transition-colors"
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Cột trái: Form nhập liệu */}
                <div className="space-y-6">
                    <div>
                        <VibeLabel>Display Name</VibeLabel>
                        <VibeInput value={profile.name} onChange={(e:any) => setProfile({...profile, name: e.target.value})} />
                    </div>
                    <div>
                        <VibeLabel>Job Title / Role</VibeLabel>
                        <VibeInput value={profile.title} onChange={(e:any) => setProfile({...profile, title: e.target.value})} />
                    </div>
                    <div>
                        <VibeLabel>Skills (Phân cách bằng dấu • hoặc ,)</VibeLabel>
                        <VibeInput value={profile.skills} onChange={(e:any) => setProfile({...profile, skills: e.target.value})} />
                    </div>
                    <div>
                        <VibeLabel>Short Bio / Description</VibeLabel>
                        <textarea 
                            value={profile.description || ''} 
                            onChange={(e:any) => setProfile({...profile, description: e.target.value})}
                            className="w-full p-2 border border-gray-200 font-vibe font-medium outline-none focus:border-black text-sm h-24 resize-none"
                        />
                    </div>
                    <div>
                        <VibeLabel>Contact Email</VibeLabel>
                        <VibeInput value={profile.email} onChange={(e:any) => setProfile({...profile, email: e.target.value})} />
                    </div>
                </div>

                {/* Cột phải: Ảnh đại diện */}
                <div>
                    <VibeLabel>Bio Image (Portrait)</VibeLabel>
                    <div className="aspect-[4/5] border-2 border-dashed border-gray-300 bg-gray-50 relative group cursor-pointer hover:border-black transition-colors flex flex-col items-center justify-center overflow-hidden">
                        {profile.bio_img ? (
                            <img src={profile.bio_img} className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-gray-400 flex flex-col items-center">
                                <ImageIcon size={32} />
                                <span className="font-vibe text-xs mt-2 uppercase">No Image</span>
                            </div>
                        )}
                        
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-vibe font-bold uppercase tracking-widest text-sm border-b border-white pb-1">Upload New</span>
                        </div>
                        <input type="file" className="hidden absolute inset-0 cursor-pointer" onChange={(e) => e.target.files && handleUpload(e.target.files[0])} />
                    </div>
                    <p className="mt-2 text-[10px] text-gray-400 font-vibe uppercase text-center">Recommended: Vertical Image</p>
                </div>
            </div>
        </div>
    </div>
  );
}