import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadImage } from '../../utils/upload';
import { Upload, Save } from 'lucide-react';

export default function InfoManager() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 1. Lấy ảnh hiện tại khi vào trang
  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = async () => {
    const { data } = await supabase.from('info_content').select('*').limit(1).single();
    if (data) setImageUrl(data.image_url);
  };

  // 2. Xử lý Upload và Lưu
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('Bạn có muốn thay thế ảnh Info hiện tại?')) return;

    setLoading(true);
    try {
      // B1: Upload ảnh mới lên Storage
      const newUrl = await uploadImage(file);
      if (!newUrl) throw new Error('Upload thất bại');

      // B2: Xóa dữ liệu cũ trong bảng info_content (Để đảm bảo chỉ có 1 row)
      await supabase.from('info_content').delete().neq('id', 0); // Xóa tất cả

      // B3: Thêm dòng mới
      const { error } = await supabase.from('info_content').insert({ image_url: newUrl });
      
      if (error) throw error;

      setImageUrl(newUrl);
      alert('Cập nhật ảnh Info thành công!');
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Quản lý Trang Info</h2>
      
      <div className="bg-white p-6 rounded-lg shadow border text-center">
        <p className="text-gray-500 mb-4">Trang Info chỉ hiển thị duy nhất 1 ảnh (CV, Bio, hoặc Skills).</p>

        {/* Khu vực hiển thị ảnh */}
        <div className="mb-6 flex justify-center">
          {imageUrl ? (
            <img src={imageUrl} alt="Current Info" className="max-h-[500px] w-auto rounded shadow-lg border" />
          ) : (
            <div className="w-64 h-64 bg-gray-100 flex items-center justify-center rounded border border-dashed text-gray-400">
              Chưa có ảnh
            </div>
          )}
        </div>

        {/* Nút Upload */}
        <div className="flex justify-center">
          <label className={`flex items-center gap-2 px-6 py-3 rounded-lg cursor-pointer transition-colors ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>
            {loading ? (
              <span>Đang xử lý...</span>
            ) : (
              <>
                <Upload size={20} />
                <span>{imageUrl ? 'Thay ảnh khác' : 'Upload ảnh mới'}</span>
              </>
            )}
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              disabled={loading}
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>
    </div>
  );
}