import React from 'react';
import {
  Croissant,
  CakeSlice,
  ChefHat,
  Receipt,
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
      icon: <CakeSlice className="w-4 h-4" />,
    },
    {
      id: 'catalog',
      label: 'Mi Catálogo',
      subtitle: 'Recetas e Insumos',
      icon: <Croissant className="w-4 h-4" />,
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
      icon: <Receipt className="w-4 h-4" />,
    },
  ];

  const displayName = (business.businessName || 'Dulcinea')
    .replace(/Dulce Canela/gi, 'Dulcinea')
    .replace(/DulceCosto/gi, 'Dulcinea');

  return (
    <header className="bg-dulcinea-midnight text-white border-b border-[#142433] shadow-md sticky top-0 z-30 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Brand Name */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#142433] border border-dulcinea-copper/50 flex items-center justify-center text-dulcinea-cream shadow-md">
              <ChefHat className="w-6 h-6 text-dulcinea-copper" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-dulcinea-cream! tracking-tight flex items-center gap-1.5 font-serif">
                  {displayName}
                </h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#142433] text-dulcinea-copper border border-dulcinea-copper/35">
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-white/15 text-xs font-semibold text-dulcinea-cream bg-white/5 hover:bg-white/10 hover:border-dulcinea-copper/40 transition-all duration-150 active:scale-95 cursor-pointer"
            >
              <DatabaseBackup className="w-3.5 h-3.5 text-dulcinea-copper" />
              <span>Respaldo</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-dulcinea-copper hover:bg-[#c88a58] text-dulcinea-midnight text-xs font-bold transition-all duration-150 active:scale-95 cursor-pointer shadow-sm"
            >
              <Settings className="w-3.5 h-3.5 text-dulcinea-midnight" />
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
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-left transition-all duration-150 active:scale-95 cursor-pointer border ${
                  isActive
                    ? 'bg-white/15 text-white border-dulcinea-copper shadow-sm'
                    : 'bg-white/5 text-slate-300 border-transparent hover:bg-white/10 hover:text-white'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? 'bg-dulcinea-copper text-dulcinea-midnight' : 'bg-white/10 text-dulcinea-copper'
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
                      isActive ? 'text-dulcinea-cream' : 'text-slate-400'
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
