import React, { useState } from 'react';
import { BookOpen, FileText, Settings, SlidersHorizontal } from 'lucide-react';
import { BusinessProfile, Invoice, Product, ProductionBatch, Sale } from '../entities';
import { InvoiceList } from '../features/invoices/components/InvoiceList';
import { RecipeBookPdfModal } from '../features/products/components/RecipeBookPdfModal';
import { ProfitabilityReportModal } from '../widgets/Dashboard/ProfitabilityReportModal';

interface AdminPageProps {
  invoices: Invoice[];
  products: Product[];
  batches: ProductionBatch[];
  sales: Sale[];
  business: BusinessProfile;
  onOpenCreateInvoice: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onUpdateInvoiceStatus: (id: string, status: Invoice['status']) => void;
  onOpenSettings: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  invoices,
  products,
  batches,
  sales,
  business,
  onOpenCreateInvoice,
  onViewInvoice,
  onDeleteInvoice,
  onUpdateInvoiceStatus,
  onOpenSettings,
}) => {
  const [isRecipeBookOpen, setIsRecipeBookOpen] = useState(false);
  const [isProfitReportOpen, setIsProfitReportOpen] = useState(false);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Action Cards for Reports & Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Recetario PDF */}
        <button
          onClick={() => setIsRecipeBookOpen(true)}
          className="bg-white p-5 rounded-2xl border border-dulcinea-copper/25 shadow-sm hover:shadow-md hover:border-dulcinea-copper transition-all duration-150 active:scale-95 text-left group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-dulcinea-cream/70 group-hover:bg-dulcinea-copper/25 text-dulcinea-midnight flex items-center justify-center transition-colors">
            <BookOpen className="w-5 h-5 text-dulcinea-copper" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-dulcinea-midnight font-serif">
            Exportar Recetario PDF
          </h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Descarga o imprime un catálogo encuadernable con todas tus fórmulas e insumos.
          </p>
        </button>

        {/* Reporte de Rentabilidad PDF */}
        <button
          onClick={() => setIsProfitReportOpen(true)}
          className="bg-white p-5 rounded-2xl border border-dulcinea-copper/25 shadow-sm hover:shadow-md hover:border-dulcinea-copper transition-all duration-150 active:scale-95 text-left group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-dulcinea-cream/70 group-hover:bg-dulcinea-copper/25 text-dulcinea-midnight flex items-center justify-center transition-colors">
            <FileText className="w-5 h-5 text-dulcinea-copper" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-dulcinea-midnight font-serif">
            Reporte de Rentabilidad
          </h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Informe financiero consolidado de ingresos, costos de producción y márgenes.
          </p>
        </button>

        {/* Ajustes y Configuración */}
        <button
          onClick={onOpenSettings}
          className="bg-white p-5 rounded-2xl border border-dulcinea-copper/25 shadow-sm hover:shadow-md hover:border-dulcinea-copper transition-all duration-150 active:scale-95 text-left group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-dulcinea-cream/70 group-hover:bg-dulcinea-midnight/10 text-dulcinea-midnight flex items-center justify-center transition-colors">
            <Settings className="w-5 h-5 text-dulcinea-midnight" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-dulcinea-midnight font-serif">
            Ajustes del Negocio
          </h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Configura moneda, tasa de impuestos (IVA), NIT de emisor y realiza respaldos JSON.
          </p>
        </button>
      </div>

      {/* Invoice List Component */}
      <InvoiceList
        invoices={invoices}
        business={business}
        onOpenCreateModal={onOpenCreateInvoice}
        onViewInvoice={onViewInvoice}
        onDeleteInvoice={onDeleteInvoice}
        onUpdateInvoiceStatus={onUpdateInvoiceStatus}
      />

      {/* PDF Export Modals */}
      <RecipeBookPdfModal
        isOpen={isRecipeBookOpen}
        onClose={() => setIsRecipeBookOpen(false)}
        products={products}
        business={business}
      />

      <ProfitabilityReportModal
        isOpen={isProfitReportOpen}
        onClose={() => setIsProfitReportOpen(false)}
        sales={sales}
        batches={batches}
        products={products}
        business={business}
      />
    </div>
  );
};
