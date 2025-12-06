import React, { useState, useEffect } from 'react';
import { LayoutDashboard, FileSpreadsheet, DollarSign, Settings, LogOut, FolderOpen, Package, Layers, ListChecks, Menu, X, Sun, Moon } from 'lucide-react';

export type AdminRoute = 
  | 'admin-dashboard' 
  | 'admin-import' 
  | 'admin-finance'
  | 'admin-settings'
  | 'admin-systems'
  | 'admin-plans'
  | 'admin-addons'
  | 'admin-resources';

interface AdminSidebarProps {
  currentRoute: string;
  onNavigate: (route: AdminRoute) => void;
  onLogout: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentRoute, onNavigate, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Sync theme state on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
  
  const navGroups = [
    {
      title: 'Painel Administrativo',
      items: [
        { label: 'Visão Geral', route: 'admin-dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Catálogo',
      items: [
        { label: 'Sistemas', route: 'admin-systems', icon: FolderOpen },
        { label: 'Planos', route: 'admin-plans', icon: Package },
        { label: 'Recursos', route: 'admin-resources', icon: ListChecks },
        { label: 'Adicionais', route: 'admin-addons', icon: Layers },
        { label: 'Importar Excel', route: 'admin-import', icon: FileSpreadsheet },
      ]
    },
    {
      title: 'Gestão',
      items: [
        { label: 'Financeiro', route: 'admin-finance', icon: DollarSign },
        { label: 'Configurações', route: 'admin-settings', icon: Settings },
      ]
    }
  ];

  const handleMobileNavigate = (route: AdminRoute) => {
    onNavigate(route);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Top Header (Replacer for Public Header) */}
      <div className="lg:hidden sticky top-0 z-[60] bg-dark-surface border-b border-dark-border px-4 h-16 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-white hover:bg-white/10 rounded-md transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span className="font-bold text-white text-lg">Área Restrita</span>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="p-2 text-gray-400 hover:text-primary transition-colors"
        >
           {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[50]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        bg-dark-surface border-r border-dark-border flex flex-col 
        h-[calc(100vh-4rem)] lg:h-screen
        transition-transform duration-300 ease-in-out
        
        // Mobile Styles (Fixed Drawer)
        fixed top-16 lg:top-0 left-0 bottom-0 w-72 z-[55]
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}

        // Desktop Styles (Sticky Sidebar)
        lg:translate-x-0 lg:sticky lg:w-64 lg:shadow-none lg:flex lg:h-screen
      `}>
         {/* Desktop Logo Area */}
         <div className="hidden lg:flex items-center gap-2 p-6 border-b border-dark-border">
            <div className="w-8 h-8 bg-primary rounded-btn flex items-center justify-center">
              <span className="text-black font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Click <span className="text-primary">Admin</span>
            </span>
         </div>

         <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
            {navGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="mb-8 last:mb-0">
                 {group.title && (
                   <h2 className="text-gray-400 uppercase text-[11px] font-bold tracking-wider mb-4 px-3 opacity-80">
                     {group.title}
                   </h2>
                 )}
                 <nav className="space-y-1">
                   {group.items.map((item) => {
                     const isActive = currentRoute === item.route;
                     return (
                       <button 
                         key={item.route}
                         onClick={() => handleMobileNavigate(item.route as AdminRoute)}
                         className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-btn transition-all duration-200 group
                           ${isActive 
                             ? 'bg-primary text-black shadow-[0_0_15px_rgba(204,255,0,0.15)]' 
                             : 'text-gray-400 hover:bg-white/5 hover:text-white'
                           }
                         `}
                       >
                         <item.icon 
                           size={18} 
                           className={`transition-colors ${isActive ? 'text-black' : 'text-gray-500 group-hover:text-primary'}`} 
                          /> 
                         {item.label}
                       </button>
                     );
                   })}
                 </nav>
              </div>
            ))}
         </div>
         
         <div className="p-4 border-t border-dark-border bg-black/20 space-y-2">
            {/* Desktop Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="hidden lg:flex w-full items-center gap-2 justify-center px-4 py-2 text-gray-400 hover:text-white font-medium rounded-btn transition-colors text-sm border border-transparent hover:border-white/10"
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              <span>{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
            </button>

            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-2 justify-center px-4 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 font-medium rounded-btn transition-all text-sm group"
            >
              <LogOut size={16} className="group-hover:scale-110 transition-transform" /> 
              Encerrar Sessão
            </button>
         </div>
      </aside>
    </>
  );
};
