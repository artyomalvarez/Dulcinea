import React from 'react';
import {
  LayoutDashboard,
  CakeSlice,
  Boxes,
  ChefHat,
  ShoppingBag,
  TrendingUp,
  Receipt,
  Settings,
  DatabaseBackup,
} from 'lucide-react';
import { BusinessProfile } from '../entities';
import { ActiveTab } from './Header';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  business: BusinessProfile;
  lowStockCount: number;
  onOpenSettings: () => void;
  onOpenBackup: () => void;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  business,
  lowStockCount,
  onOpenSettings,
  onOpenBackup,
}) => {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Inicio', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'products', label: 'Productos', icon: <CakeSlice className="w-4 h-4" /> },
    {
      id: 'inventory',
      label: 'Inventario',
      icon: <Boxes className="w-4 h-4" />,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
    },
    { id: 'production', label: 'Producción', icon: <ChefHat className="w-4 h-4" /> },
    { id: 'sales', label: 'Ventas', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'finances', label: 'Finanzas', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'invoicing', label: 'Facturación', icon: <Receipt className="w-4 h-4" /> },
  ];

  const displayName = (business.businessName || 'Dulcinea')
    .replace(/Dulce Canela/gi, 'Dulcinea')
    .replace(/DulceCosto/gi, 'Dulcinea');

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-dulcinea-midnight text-white border-r border-[#142433] z-30 no-print">
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#142433] border border-dulcinea-copper/50 flex items-center justify-center shrink-0 shadow-sm">
              <ChefHat className="w-5 h-5 text-dulcinea-copper" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-dulcinea-cream! font-serif truncate">
                {displayName}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-dulcinea-copper">
                {business.currencySymbol} {business.currencyCode}
              </span>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-slate-300 leading-relaxed">
            El control de tu taller, desde la receta hasta la ganancia.
          </p>
        </div>

        {/* 7 Modules Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Navegación principal">
          <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Flujo del Taller
          </div>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-dulcinea-copper text-dulcinea-midnight font-bold shadow-sm'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={isActive ? 'text-dulcinea-midnight' : 'text-dulcinea-copper'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </span>
                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                      isActive
                        ? 'bg-dulcinea-midnight text-dulcinea-cream'
                        : 'bg-dulcinea-cherry text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Configuration Shortcuts */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Sistema
          </div>
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 text-dulcinea-copper" />
            <span>Configuración del Negocio</span>
          </button>
          <button
            onClick={onOpenBackup}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <DatabaseBackup className="w-4 h-4 text-dulcinea-blue" />
            <span>Respaldos y Restauración</span>
          </button>
        </div>
      </aside>

      {/* Mobile Horizontal Module Bar */}
      <nav
        className="md:hidden bg-dulcinea-midnight text-white border-b border-[#142433] px-3 py-2 overflow-x-auto flex items-center gap-1.5 sticky top-0 z-30 no-print"
        aria-label="Navegación móvil"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-dulcinea-copper text-dulcinea-midnight shadow-xs'
                  : 'bg-white/5 text-slate-200 hover:bg-white/10'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-dulcinea-cherry text-white font-mono">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
