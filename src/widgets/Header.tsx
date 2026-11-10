import React from 'react';
import {
  Cake,
  TrendingUp,
  BookOpen,
  ChefHat,
  Briefcase,
  Settings,
  DatabaseBackup
} from 'lucide-react';
import { BusinessProfile } from '../entities';

export type ActiveTab = 'dashboard' | 'catalog' | 'workshop' | 'admin';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  business: BusinessProfile;
  onOpenSettings: () => void;
  onOpenBackup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  business,
  onOpenSettings,
  onOpenBackup,
}) => {
  const navItems: { id: ActiveTab; label: string; subtitle: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'Inicio',
      subtitle: 'Resumen y métricas',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'catalog',
      label: 'Mi Catálogo',
      subtitle: 'Recetas e Insumos',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'workshop',
      label: 'Mi Taller',
      subtitle: 'Producción y Ventas',
      icon: <ChefHat className="w-4 h-4" />,
    },
    {
      id: 'admin',
      label: 'Administración',
      subtitle: 'Facturación y Reportes',
      icon: <Briefcase className="w-4 h-4" />,
    },
  ];

  const displayName = (business.businessName || 'Dulcinea')
    .replace(/Dulce Canela/gi, 'Dulcinea')
    .replace(/DulceCosto/gi, 'Dulcinea');

  return (
    <header className="bg-[#1A2E40] text-white border-b border-[#142433] shadow-md sticky top-0 z-30 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Brand Name */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#142433] border border-[#D4A373]/40 flex items-center justify-center text-[#FAF8F5] shadow-md">
              <ChefHat className="w-6 h-6 text-[#FAF8F5]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-[#FAF8F5] tracking-tight flex items-center gap-1.5 font-serif">
                  {displayName}
                </h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#142433] text-[#D4A373] border border-[#D4A373]/30">
                  {business.currencySymbol} {business.currencyCode}
                </span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-1">
                {business.tagline || 'Repostería artesanal, costeo de recetas y gestión de taller'}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={onOpenBackup}
              title="Respaldar o Restaurar Datos"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
            >
              <DatabaseBackup className="w-3.5 h-3.5 text-[#D4A373]" />
              <span>Respaldo</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#D4A373] hover:bg-[#c88a58] text-[#1A2E40] text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Settings className="w-3.5 h-3.5 text-[#1A2E40]" />
              <span>Ajustes</span>
            </button>
          </div>
        </div>

        {/* 4-Section Navigation Bar */}
        <nav className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3.5 pt-2.5 border-t border-white/10">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-left transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-white/15 text-white border-[#D4A373] shadow-xs'
                    : 'bg-white/5 text-slate-300 border-transparent hover:bg-white/10 hover:text-white'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-[#D4A373] text-[#1A2E40]' : 'bg-white/10 text-[#D4A373]'
                  }`}
                >
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold leading-tight truncate">
                    {item.label}
                  </div>
                  <div
                    className={`text-[10px] truncate hidden sm:block ${
                      isActive ? 'text-[#D4A373]' : 'text-slate-400'
                    }`}
                  >
                    {item.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
