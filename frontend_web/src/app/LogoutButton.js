'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function LogoutButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    localStorage.removeItem('smiic_perfil');
    localStorage.removeItem('smiic_secretaria_cor');
    localStorage.removeItem('smiic_secretaria_nome');
    localStorage.removeItem('smiic_secretaria_id');
    window.location.href = '/';
  };

  return (
    <div className="relative shrink-0 ml-4 h-[60px] flex items-center">
      {!showConfirm ? (
        <button 
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-2 px-5 py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-all shadow-sm"
          title="Sair do Sistema"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          SAIR
        </button>
      ) : (
        <div className="absolute top-1/2 -translate-y-1/2 right-0 flex items-center gap-2 bg-white border border-slate-300 rounded-xl p-1.5 shadow-lg z-50">
          <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap pl-2 pr-1 uppercase tracking-wider">Sair do sistema?</span>
          <button 
            onClick={handleLogout}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-black transition-all shadow-sm disabled:opacity-50"
          >
            {loading ? '...' : 'SIM'}
          </button>
          <button 
            onClick={() => setShowConfirm(false)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all"
          >
            NÃO
          </button>
        </div>
      )}
    </div>
  );
}
