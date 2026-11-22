/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  BusinessProfile,
  Ingredient,
  Invoice,
  Product,
  ProductionBatch,
  Sale,
  WasteRecord,
} from '../entities';
import { useAppStore } from '../shared/store/useAppStore';
import { StockService } from '../shared/lib';
import { Header, ActiveTab } from '../widgets/Header';
import { Sidebar } from '../widgets/Sidebar';
import { SettingsModal } from '../widgets/SettingsModal';
import { ProductList } from '../features/products/components/ProductList';
import { ProductFormModal } from '../features/products/components/ProductFormModal';
import { ProductionList, ProductionBatchModal } from '../features/production/components/ProductionList';
import { SalesList, SaleFormModal } from '../features/sales/components/SalesList';
import { InvoiceList } from '../features/invoices/components/InvoiceList';
import { InvoiceModal } from '../features/invoices/components/InvoiceModal';
import { InvoiceViewer } from '../features/invoices/components/InvoiceViewer';
import { ProfitabilityCalculatorModal } from '../features/profitability/components/ProfitabilityCalculatorModal';
import { LossSimulatorModal } from '../features/loss-simulator/components/LossSimulatorModal';
import {
  DashboardPage,
  InventoryPage,
  FinancesPage,
} from '../pages';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [inventorySubTab, setInventorySubTab] = useState<'existencias' | 'reposicion' | 'movimientos'>('existencias');
  const [financesSubTab, setFinancesSubTab] = useState<'rentabilidad' | 'costos' | 'mermas'>('rentabilidad');

  // Global Zustand Store
  const {
    business,
    ingredients,
    products,
    batches,
    sales,
    invoices,
    wastes,
    saveProduct,
    deleteProduct,
    saveIngredient,
    deleteIngredient,
    updateIngredientStock,
    saveBatch,
    deleteBatch,
    saveSale,
    deleteSale,
    saveInvoice,
    deleteInvoice,
    updateInvoiceStatus,
    saveWaste,
    deleteWaste,
    saveBusiness,
  } = useAppStore();

  // Modal UI States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [preselectedProductForBatch, setPreselectedProductForBatch] = useState<Product | null>(null);

  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [preselectedProductForSale, setPreselectedProductForSale] = useState<Product | null>(null);

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [saleForInvoice, setSaleForInvoice] = useState<Sale | null>(null);

  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'settings' | 'backup'>('settings');

  const [isCalculatorModalOpen, setIsCalculatorModalOpen] = useState(false);
  const [isLossSimulatorOpen, setIsLossSimulatorOpen] = useState(false);

  const handleSaveProduct = (prod: Product) => {
    saveProduct(prod);
    toast.success(`Receta "${prod.name}" guardada correctamente.`);
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id);
    toast.info('Producto eliminado del catálogo.');
  };

  const handleSaveIngredient = (ing: Ingredient) => {
    saveIngredient(ing);
    toast.success(`Insumo "${ing.name}" guardado.`);
  };

  const handleDeleteIngredient = (id: string) => {
    deleteIngredient(id);
    toast.info('Insumo eliminado.');
  };

  const handleUpdateIngredientStock = (id: string, newStock: number) => {
    updateIngredientStock(id, newStock);
    toast.success('Stock de inventario actualizado.');
  };

  const handleSaveBatch = (batch: ProductionBatch) => {
    saveBatch(batch);
    toast.success(`Lote ${batch.batchCode} registrado.`);
  };

  const handleDeleteBatch = (id: string) => {
    deleteBatch(id);
    toast.info('Lote eliminado.');
  };

  const handleSaveSale = (sale: Sale) => {
    saveSale(sale);
    toast.success(`Venta ${sale.saleNumber} guardada con éxito.`);
  };

  const handleDeleteSale = (id: string) => {
    deleteSale(id);
    toast.info('Venta eliminada y stock restaurado.');
  };

  const handleSaveInvoice = (inv: Invoice) => {
    saveInvoice(inv);
    toast.success(`Factura ${inv.invoiceNumber} generada.`);
  };

  const handleDeleteInvoice = (id: string) => {
    deleteInvoice(id);
    toast.info('Factura eliminada.');
  };

  const handleUpdateInvoiceStatus = (id: string, status: Invoice['status']) => {
    updateInvoiceStatus(id, status);
    if (viewingInvoice && viewingInvoice.id === id) {
      setViewingInvoice({ ...viewingInvoice, status });
    }
    toast.success(`Estado actualizado a "${status}".`);
  };

  const handleSaveWaste = (waste: WasteRecord) => {
    saveWaste(waste);
    toast.success(`Merma de "${waste.itemName}" registrada.`);
  };

  const handleDeleteWaste = (id: string) => {
    deleteWaste(id);
    toast.info('Registro de merma eliminado.');
  };

  const handleSaveBusiness = (updated: BusinessProfile) => {
    saveBusiness(updated);
    toast.success('Configuración del negocio actualizada.');
  };

  const lowStockCount = StockService.buildShoppingList(ingredients).items.length;

  return (
    <div className="min-h-screen bg-dulcinea-dots text-dulcinea-text flex flex-col font-sans selection:bg-dulcinea-copper/30 selection:text-dulcinea-midnight">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        business={business}
        lowStockCount={lowStockCount}
        onOpenSettings={() => {
          setSettingsInitialTab('settings');
          setIsSettingsOpen(true);
        }}
        onOpenBackup={() => {
          setSettingsInitialTab('backup');
          setIsSettingsOpen(true);
        }}
      />

      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <Header
          activeTab={activeTab}
          business={business}
          lowStockCount={lowStockCount}
          onNavigateToInventory={() => {
            setInventorySubTab('reposicion');
            setActiveTab('inventory');
          }}
          onOpenSettings={() => {
            setSettingsInitialTab('settings');
            setIsSettingsOpen(true);
          }}
          onOpenBackup={() => {
            setSettingsInitialTab('backup');
            setIsSettingsOpen(true);
          }}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
          {activeTab === 'dashboard' && (
            <DashboardPage
              products={products}
              batches={batches}
              sales={sales}
              ingredients={ingredients}
              wastes={wastes}
              business={business}
              onOpenSaleModal={() => {
                setPreselectedProductForSale(null);
                setIsSaleModalOpen(true);
              }}
              onOpenBatchModal={() => {
                setPreselectedProductForBatch(null);
                setIsBatchModalOpen(true);
              }}
              onNavigateToIngredients={() => {
                setInventorySubTab('reposicion');
                setActiveTab('inventory');
              }}
              onNavigateToCatalog={() => {
                setActiveTab('products');
              }}
              onNavigateToWorkshop={() => {
                setActiveTab('production');
              }}
              onOpenCalculator={() => {
                setFinancesSubTab('costos');
                setActiveTab('finances');
              }}
              onOpenLossSimulator={() => setIsLossSimulatorOpen(true)}
            />
          )}

          {activeTab === 'products' && (
            <ProductList
              products={products}
              onOpenCreateModal={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              onEditProduct={(product) => {
                setEditingProduct(product);
                setIsProductModalOpen(true);
              }}
              onDeleteProduct={handleDeleteProduct}
              onMakeBatch={(product) => {
                setPreselectedProductForBatch(product);
                setIsBatchModalOpen(true);
              }}
              business={business}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryPage
              ingredients={ingredients}
              batches={batches}
              wastes={wastes}
              business={business}
              initialSubTab={inventorySubTab}
              onSaveIngredient={handleSaveIngredient}
              onDeleteIngredient={handleDeleteIngredient}
              onUpdateIngredientStock={handleUpdateIngredientStock}
              onOpenLossSimulator={() => setIsLossSimulatorOpen(true)}
            />
          )}

          {activeTab === 'production' && (
            <ProductionList
              batches={batches}
              products={products}
              business={business}
              onSaveBatch={handleSaveBatch}
              onDeleteBatch={handleDeleteBatch}
              onOpenSaleModalForProduct={(product) => {
                setPreselectedProductForSale(product);
                setIsSaleModalOpen(true);
              }}
              onOpenNewModal={() => {
                setPreselectedProductForBatch(null);
                setIsBatchModalOpen(true);
              }}
            />
          )}

          {activeTab === 'sales' && (
            <SalesList
              sales={sales}
              products={products}
              batches={batches}
              business={business}
              onSaveSale={handleSaveSale}
              onDeleteSale={handleDeleteSale}
              onGenerateInvoiceFromSale={(sale) => {
                setSaleForInvoice(sale);
                setIsInvoiceModalOpen(true);
              }}
              onOpenNewModal={() => {
                setPreselectedProductForSale(null);
                setIsSaleModalOpen(true);
              }}
            />
          )}

          {activeTab === 'finances' && (
            <FinancesPage
              products={products}
              batches={batches}
              sales={sales}
              wastes={wastes}
              business={business}
              initialSubTab={financesSubTab}
              onOpenLossSimulator={() => setIsLossSimulatorOpen(true)}
              onDeleteWaste={handleDeleteWaste}
            />
          )}

          {activeTab === 'invoicing' && (
            <InvoiceList
              invoices={invoices}
              business={business}
              onOpenCreateModal={() => {
                setSaleForInvoice(null);
                setIsInvoiceModalOpen(true);
              }}
              onViewInvoice={(inv) => {
                setViewingInvoice(inv);
                setIsViewerOpen(true);
              }}
              onDeleteInvoice={handleDeleteInvoice}
              onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
            />
          )}
        </main>

        <footer className="bg-white/90 backdrop-blur-xs border-t border-dulcinea-copper/25 py-4 text-center text-xs text-stone-500 no-print">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="font-semibold text-dulcinea-midnight font-serif">
              {business.businessName || 'Dulcinea'} &bull; El control de tu taller, desde la receta hasta la ganancia
            </span>
            <span className="font-mono text-[11px] text-stone-500 bg-dulcinea-cream/50 px-3 py-1 rounded-full border border-dulcinea-copper/20">
              Costo Unitario = Insumos ÷ Rendimiento | Utilidad = Venta - Costo
            </span>
          </div>
        </footer>
      </div>

      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        ingredients={ingredients}
        business={business}
        onSave={handleSaveProduct}
      />

      <ProductionBatchModal
        isOpen={isBatchModalOpen}
        onClose={() => {
          setIsBatchModalOpen(false);
          setPreselectedProductForBatch(null);
        }}
        onSaveBatch={handleSaveBatch}
        products={products}
        batchesCount={batches.length}
        business={business}
        preselectedProduct={preselectedProductForBatch}
      />

      <SaleFormModal
        isOpen={isSaleModalOpen}
        onClose={() => {
          setIsSaleModalOpen(false);
          setPreselectedProductForSale(null);
        }}
        onSaveSale={handleSaveSale}
        products={products}
        salesCount={sales.length}
        business={business}
        preselectedProduct={preselectedProductForSale}
      />

      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSaleForInvoice(null);
        }}
        onSaveInvoice={handleSaveInvoice}
        business={business}
        products={products}
        initialSale={saleForInvoice}
      />

      {viewingInvoice && (
        <InvoiceViewer
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          invoice={viewingInvoice}
          business={business}
          onUpdateStatus={(st) => handleUpdateInvoiceStatus(viewingInvoice.id, st)}
        />
      )}

      {isCalculatorModalOpen && (
        <ProfitabilityCalculatorModal
          business={business}
          products={products}
          isOpen={isCalculatorModalOpen}
          onClose={() => setIsCalculatorModalOpen(false)}
          isStandaloneTab={false}
        />
      )}

      <LossSimulatorModal
        isOpen={isLossSimulatorOpen}
        onClose={() => setIsLossSimulatorOpen(false)}
        products={products}
        ingredients={ingredients}
        wastes={wastes}
        business={business}
        onSaveWaste={handleSaveWaste}
        onDeleteWaste={handleDeleteWaste}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        business={business}
        onSaveBusiness={handleSaveBusiness}
        onDataReload={() => {}}
        initialTab={settingsInitialTab}
      />
    </div>
  );
}
