import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Sai email hoặc mật khẩu');
      setLoading(false);
    } else {
      window.location.href = '/admin';
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-sm p-6 bg-white border rounded shadow">
        <h2 className="mb-4 text-2xl font-bold text-center">Đăng nhập Admin</h2>
        {error && <div className="p-2 mb-4 text-sm text-red-700 bg-red-100 rounded">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email" placeholder="Email" required
            className="w-full p-2 border rounded"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password" placeholder="Mật khẩu" required
            className="w-full p-2 border rounded"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
          <button disabled={loading} className="w-full p-2 text-white bg-blue-600 rounded hover:bg-blue-700">
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}