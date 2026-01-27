import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import CoreControl from './CoreControl';
import Login from './Login';

export default function AdminGuard() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Kiểm tra xem user có đang đăng nhập không
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Lắng nghe sự kiện đăng nhập/đăng xuất
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-vibe uppercase animate-pulse">Checking Security...</div>;

  // LOGIC QUAN TRỌNG:
  // Nếu không có session (chưa đăng nhập) -> Hiện trang Login
  if (!session) {
    return <Login />;
  }

  // Nếu có session -> Cho vào trang quản trị
  return <CoreControl />;
}