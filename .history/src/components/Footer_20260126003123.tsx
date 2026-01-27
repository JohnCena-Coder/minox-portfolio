import React, { useState } from 'react';

export default function Footer() {
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Web3Forms Public Access Key (Thay key của bạn vào đây sau)
    formData.append("access_key", "YOUR_WEB3FORMS_ACCESS_KEY"); 

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        setStatus("Đã gửi thành công!");
        (e.target as HTMLFormElement).reset();
        setTimeout(() => setStatus(null), 3000);
      } else {
        setStatus("Lỗi gửi form.");
      }
    } catch (error) {
      setStatus("Lỗi kết nối.");
    }
  };

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-[#18181b] text-white py-3 px-5 z-50 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-gray-800">
      <div className="text-sm text-gray-400">
        Minox Portfolio © {new Date().getFullYear()}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 items-center w-full md:w-auto">
        <input 
          type="text" name="name" placeholder="Tên" required 
          className="bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-2 w-24 focus:outline-none focus:border-blue-500"
        />
        <input 
          type="email" name="email" placeholder="Email" required 
          className="bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-2 w-32 focus:outline-none focus:border-blue-500"
        />
        <input 
          type="text" name="message" placeholder="Idea..." required 
          className="bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-2 flex-1 md:w-48 focus:outline-none focus:border-blue-500"
        />
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded transition-colors">
          Gửi
        </button>
      </form>

      {status && (
        <div className="absolute top-[-40px] right-5 bg-white text-black px-4 py-1 rounded shadow text-sm">
          {status}
        </div>
      )}
    </footer>
  );
}