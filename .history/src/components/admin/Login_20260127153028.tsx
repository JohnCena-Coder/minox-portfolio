import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('Đăng nhập thất bại: ' + error.message);
    } else {
      // Đăng nhập thành công, trang sẽ tự reload nhờ cơ chế của Supabase
      window.location.reload(); 
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f4f6]">
      <div className="w-full max-w-md bg-white p-8 border border-black shadow-xl">
        <div className="text-center mb-8">
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold mx-auto mb-4 font-vibe text-2xl">M</div>
            <h1 className="font-vibe text-3xl font-bold uppercase tracking-tighter">Admin Access</h1>
            <p className="text-xs text-gray-400 font-mono mt-2 uppercase">Please identify yourself</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1 tracking-widest font-vibe">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-200 focus:border-black outline-none font-bold font-vibe"
              placeholder="admin@minox.com"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1 tracking-widest font-vibe">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-200 focus:border-black outline-none font-bold font-vibe"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 font-vibe uppercase font-bold tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Enter System'}
          </button>
        </form>
      </div>
    </div>
  );
}