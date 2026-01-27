import React from 'react';
import { Lock } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full h-[60px] bg-white/90 backdrop-blur-sm border-b border-gray-200 z-50 flex items-center justify-between px-5">
      {/* Logo */}
      <a href="/" className="font-bold text-xl tracking-tight text-gray-900 hover:text-primary transition-colors">
        MINOX
      </a>

      {/* Nav Center */}
      <nav className="flex gap-6 font-medium text-gray-600">
        <a href="/" className="hover:text-black transition-colors">Product</a>
        <a href="/info" className="hover:text-black transition-colors">Info</a>
      </nav>

      {/* Lock Icon -> CMS Login */}
      <a href="/login" className="text-gray-500 hover:text-black transition-colors p-2" aria-label="Admin Login">
        <Lock size={18} />
      </a>
    </header>
  );
}