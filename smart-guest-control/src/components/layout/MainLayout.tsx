import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEventStore } from '../../store/eventStore';
import { LayoutDashboard, Users, Grid, ScanLine, Settings, LogOut, Wand2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export function MainLayout() {
  const { role, setRole } = useEventStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    setRole("RECEPCIONISTA");
    navigate('/login');
  };

  const navItems = [
    { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["ADMINISTRADOR", "HOST"] },
    { to: "/admin/tables", icon: Grid, label: "Mapa de Mesas", roles: ["ADMINISTRADOR", "HOST", "COORDINADOR"] },
    { to: "/admin/guests", icon: Users, label: "Invitados", roles: ["ADMINISTRADOR", "HOST", "COORDINADOR", "STAFF"] },
    { to: "/admin/smart-seating", icon: Wand2, label: "Acomodo Inteligente", roles: ["ADMINISTRADOR", "HOST"] },
    { to: "/reception", icon: ScanLine, label: "Recepción (App)", roles: ["ADMINISTRADOR", "HOST", "RECEPCIONISTA"] },
  ];

  const allowedNavItems = navItems.filter(item => item.roles.includes(role));

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-[#0c0c0e] text-zinc-900 dark:text-zinc-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-[#0c0c0e] flex flex-col hidden md:flex shadow-sm">
        <div className="h-20 flex items-center px-8">
          <h1 className="font-display font-black text-xl tracking-wide uppercase bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500">
            Smart Guest
          </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6">
          <nav className="space-y-1 px-4">
            {allowedNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                    isActive 
                      ? "bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 shadow-md" 
                      : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-50"
                  )
                }
              >
                <item.icon className={cn("h-4 w-4", "transition-transform duration-300")} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-950 flex items-center justify-center font-display font-bold text-lg shadow-sm border border-zinc-200/50 dark:border-zinc-800/50">
              {role.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">{role}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium tracking-wide uppercase mt-0.5">Online</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-4">
          <h1 className="font-bold tracking-tight uppercase text-sm">Smart Guest Control</h1>
          <button onClick={handleLogout} className="p-2">
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
