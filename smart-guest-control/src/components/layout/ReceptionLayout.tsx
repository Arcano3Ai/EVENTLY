import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useEventStore } from '../../store/eventStore';
import { LogOut, Home } from 'lucide-react';

export function ReceptionLayout() {
  const navigate = useNavigate();
  const { role, currentUser } = useEventStore();

  return (
    <div className="flex flex-col h-[100dvh] bg-zinc-950 text-zinc-50 overflow-hidden">
      {/* Topbar for reception - Minimal */}
      <header className="h-14 flex items-center justify-between px-4 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          {role === 'ADMINISTRADOR' && (
             <button onClick={() => navigate('/admin/dashboard')} className="p-2 -ml-2 rounded-full bg-zinc-900 text-zinc-400 hover:text-white">
               <Home className="w-5 h-5" />
             </button>
          )}
          <span className="font-semibold text-sm tracking-widest text-zinc-300">RECEPCIÓN</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-xs text-zinc-400">
             Host: <span className="text-zinc-100">{currentUser}</span>
          </div>
          <button 
             onClick={() => navigate('/login')}
             className="text-zinc-500 hover:text-white"
          >
             <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main scanning area */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
