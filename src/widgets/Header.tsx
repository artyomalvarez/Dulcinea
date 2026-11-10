import React from 'react';
import {
  Cake,
  Receipt,
  TrendingUp,
  Boxes,
  ShoppingBag,
  ChefHat,
  Settings,
  HelpCircle,
  DatabaseBackup
} from 'lucide-react';
import { BusinessProfile } from '../entities';

export type ActiveTab = 'dashboard' | 'products' | 'ingredients' | 'production' | 'sales' | 'invoices' | 'calculator';

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
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Panel Principal', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'products', label: 'Productos y Recetas', icon: <Cake className="w-4 h-4" /> },
    { id: 'production', label: 'Producción (Lotes)', icon: <ChefHat className="w-4 h-4" /> },
    { id: 'sales', label: 'Ventas y Clientes', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'invoices', label: 'Facturación', icon: <Receipt className="w-4 h-4" /> },
    { id: 'ingredients', label: 'Insumos', icon: <Boxes className="w-4 h-4" /> },
    { id: 'calculator', label: 'Simulador de Costeo', icon: <HelpCircle className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-white border-b border-amber-100 shadow-xs sticky top-0 z-30 no-print">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo & Business Name */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-200">
              <Cake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-1.5 font-serif">
                  {business.businessName || 'DulceCosto Repostería'}
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  {business.currencySymbol} {business.currencyCode}
                </span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-1">
                {business.tagline || 'Control de costos, rentabilidad y facturación artesanal'}
              </p>
            </div>
          </div>

          {/* Business Info & Quick Actions */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={onOpenBackup}
              title="Respaldar o Restaurar Datos"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer shadow-2xs"
            >
              <DatabaseBackup className="w-3.5 h-3.5 text-gray-500" />
              <span>Respaldo</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition-colors cursor-pointer shadow-2xs"
            >
              <Settings className="w-3.5 h-3.5 text-amber-700" />
              <span>Ajustes del Negocio</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto mt-3 pt-1 border-t border-gray-100 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-xs font-semibold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-amber-50/70'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
