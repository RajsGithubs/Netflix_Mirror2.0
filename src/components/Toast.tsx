'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, Bookmark, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'info' | 'error' | 'watchlist';
}

export function showToast(text: string, type: 'success' | 'info' | 'error' | 'watchlist' = 'info') {
  if (typeof window === 'undefined') return;
  const event = new CustomEvent('streamverse-toast', {
    detail: { id: `${Date.now()}-${Math.random()}`, text, type },
  });
  window.dispatchEvent(event);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<ToastMessage>;
      if (!customEvent.detail) return;
      const newToast = customEvent.detail;

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 3500);
    };

    window.addEventListener('streamverse-toast', handleToast);
    return () => window.removeEventListener('streamverse-toast', handleToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'success'
            ? CheckCircle2
            : toast.type === 'watchlist'
            ? Bookmark
            : toast.type === 'error'
            ? AlertCircle
            : Info;

        const borderClass =
          toast.type === 'success'
            ? 'border-emerald-500/40 text-emerald-400'
            : toast.type === 'watchlist'
            ? 'border-brand-500/50 text-brand-400'
            : toast.type === 'error'
            ? 'border-rose-500/50 text-rose-400'
            : 'border-zinc-700 text-indigo-400';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-900/95 backdrop-blur-xl border ${borderClass} shadow-2xl shadow-black/80 text-sm text-zinc-100 animate-slide-up transition-all`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="font-medium text-xs sm:text-sm">{toast.text}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-auto p-1 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
