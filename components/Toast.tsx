
import React from 'react';

interface ToastProps {
  message: string;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 bg-[#333] border border-white/10 rounded-full shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <span className="text-sm tracking-wide text-white/90">{message}</span>
    </div>
  );
};
