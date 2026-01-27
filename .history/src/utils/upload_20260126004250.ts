import { supabase } from '../lib/supabase';

// Hàm upload 1 file ảnh -> Trả về URL
export async function uploadImage(file: File): Promise<string | null> {
  const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`; // Đặt tên file unique
  const { data, error } = await supabase.storage
    .from('portfolio-images')
    .upload(fileName, file);

  if (error) {
    console.error('Upload lỗi:', error);
    return null;
  }

  // Lấy Public URL
  const { data: { publicUrl } } = supabase.storage
    .from('portfolio-images')
    .getPublicUrl(fileName);

  return publicUrl;
}