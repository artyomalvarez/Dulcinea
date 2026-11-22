import React from 'react';
import {
  Bell,
  Settings,
  DatabaseBackup,
  ChefHat,
  AlertTriangle
} from 'lucide-react';
import { BusinessProfile } from '../entities';

export type ActiveTab =
  | 'dashboard'
  | 'products'
  | 'inventory'
  | 'production'
  | 'sales'
  | 'finances'
  | 'invoicing';

const SECTION_META: Record<ActiveTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Inicio del Taller',
    subtitle: 'Resumen operativo, existencias del día y rentabilidad',
  },
  products: {
    title: 'Productos y Recetas',
    subtitle: 'Catálogo de fórmulas, costos por porción y precios de venta',
  },
  inventory: {
    title: 'Inventario de Materias Primas',
    subtitle: 'Existencias actuales, reposición de stock y movimientos',
  },
  production: {
    title: 'Producción y Lotes',
    subtitle: 'Control de horneadas, disponibilidad en vitrina e historial',
  },
  sales: {
    title: 'Ventas y Pedidos',
    subtitle: 'Registro rápido de entregas, ticket promedio e ingresos',
  },
  finances: {
    title: 'Finanzas, Costos y Mermas',
    subtitle: 'Análisis de rentabilidad, simulador de costeo y pérdidas',
  },
  invoicing: {
    title: 'Facturación',
    subtitle: 'Comprobantes fiscales, estados de cobro e impresión PDF',
  },
};

interface HeaderProps {
  activeTab: ActiveTab;
  business: BusinessProfile;
  lowStockCount?: number;
  onNavigateToInventory?: () => void;
  onOpenSettings: () => void;
  onOpenBackup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  business,
  lowStockCount = 0,
  onNavigateToInventory,
  onOpenSettings,
  onOpenBackup,
}) => {
  const meta = SECTION_META[activeTab];
  const displayName = (business.businessName || 'Dulcinea')
    .replace(/Dulce Canela/gi, 'Dulcinea')
    .replace(/DulceCosto/gi, 'Dulcinea');

  return (
    <header className="bg-white/95 backdrop-blur-xs border-b border-dulcinea-copper/25 sticky top-0 z-20 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        {/* Left: Current section context */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="md:hidden w-9 h-9 rounded-xl bg-dulcinea-midnight flex items-center justify-center shrink-0">
            <ChefHat className="w-5 h-5 text-dulcinea-copper" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-dulcinea-midnight font-serif truncate">
                {meta.title}
              </h2>
              <span className="hidden lg:inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-dulcinea-cream text-dulcinea-midnight border border-dulcinea-copper/30">
                {displayName} · {business.currencySymbol} {business.currencyCode}
              </span>
            </div>
            <p className="text-xs text-dulcinea-muted truncate">{meta.subtitle}</p>
          </div>
        </div>

        {/* Right: Notifications, Backup & Settings */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {lowStockCount > 0 && onNavigateToInventory ? (
            <button
              onClick={onNavigateToInventory}
              title="Ver insumos por debajo del stock mínimo"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dulcinea-cherry/10 text-dulcinea-cherry border border-dulcinea-cherry/25 text-xs font-bold hover:bg-dulcinea-cherry/15 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{lowStockCount} alerta{lowStockCount > 1 ? 's' : ''}</span>
            </button>
          ) : (
            <span
              title="Inventario al día"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-dulcinea-success border border-emerald-200 text-xs font-semibold"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Stock al día</span>
            </span>
          )}

          <button
            onClick={onOpenBackup}
            title="Respaldar o Restaurar Datos"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-dulcinea-text bg-white hover:bg-dulcinea-cream/40 hover:border-dulcinea-copper/40 transition-all active:scale-95 cursor-pointer"
          >
            <DatabaseBackup className="w-3.5 h-3.5 text-dulcinea-blue" />
            <span className="hidden sm:inline">Respaldo</span>
          </button>

          <button
            onClick={onOpenSettings}
            title="Ajustes del Negocio"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dulcinea-midnight hover:bg-[#142433] text-dulcinea-cream text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
          >
            <Settings className="w-3.5 h-3.5 text-dulcinea-copper" />
            <span>Ajustes</span>
          </button>
        </div>
      </div>
    </header>
  );
};
