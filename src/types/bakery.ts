export type UnitOfMeasure = 'g' | 'kg' | 'ml' | 'l' | 'pza' | 'cda' | 'cdta' | 'docena';

export type IngredientCategory =
  | 'Harinas y Polvos'
  | 'Lácteos y Grasas'
  | 'Decoraciones y Coberturas'
  | 'Azúcares y Endulzantes'
  | 'Chocolates y Cacaos'
  | 'Huevos'
  | 'Esencias, Frutas y Sabores'
  | 'Empaque y Presentación'
  | 'Otros'
  | 'Harinas y Granos'
  | 'Azúcares'
  | 'Esencias y Frutas';

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  purchasePackageQuantity: number; // e.g. 1000 for 1kg flour
  purchasePackageUnit: UnitOfMeasure; // 'g', 'kg', 'ml', 'l', 'pza'
  purchaseCost: number; // e.g. $35.00 for 1000g
  currentStock?: number; // current stock in purchasePackageUnit
  minStockAlert?: number; // minimum stock threshold to trigger low stock purchase alert
  notes?: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  name: string;
  quantity: number; // quantity in recipeUnit
  recipeUnit: UnitOfMeasure;
  calculatedCost: number; // automatically computed based on ingredient's purchase unit cost
}

export interface Product {
  id: string;
  name: string;
  category: 'Pasteles' | 'Galletas' | 'Cupcakes' | 'Postres Fríos' | 'Panadería' | 'Bocaditos y Tartas';
  description?: string;
  ingredients: RecipeIngredient[];
  otherDirectCosts: number; // Empaque, cintas, capacillos, gas/luz estimado por lote
  batchYieldUnits: number; // How many sellable units/portions the recipe yields (e.g., 15 galletas, o 1 pastel de 12 porciones)
  yieldUnitName: string; // e.g., 'unidades', 'porciones', 'cajas', 'docenas'
  totalBatchCost: number; // Sum of ingredients + otherDirectCosts
  costPerUnit: number; // totalBatchCost / batchYieldUnits
  suggestedMarginPercent: number; // e.g., 50%
  sellingPrice: number; // Established selling price per unit
  profitPerUnit: number; // sellingPrice - costPerUnit
  profitMarginPercent: number; // (profitPerUnit / sellingPrice) * 100
  notes?: string;
  imageUrl?: string;
}

export interface ProductionBatch {
  id: string;
  batchCode: string; // e.g. LOTE-2026-001
  date: string;
  productId: string;
  productName: string;
  numberOfBatches: number; // e.g. 3 recetas preparadas
  unitsPerBatch: number; // e.g. 5 unidades por receta
  totalUnitsProduced: number; // 3 * 5 = 15 unidades
  totalSuppliesCost: number; // e.g. $75 total cost
  costPerUnit: number; // totalSuppliesCost / totalUnitsProduced = $5
  unitsSold: number; // how many from this batch are sold
  notes?: string;
  status: 'completado' | 'en_proceso' | 'agotado';
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  totalCost: number; // quantity * unitCost
  totalPrice: number; // quantity * unitPrice
  unitProfit: number; // unitPrice - unitCost
  totalProfit: number; // totalPrice - totalCost
}

export interface Sale {
  id: string;
  saleNumber: string; // e.g. VTA-001
  date: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  items: SaleItem[];
  subtotal: number;
  taxRatePercent: number; // e.g. 16% or 0%
  taxAmount: number;
  totalAmount: number;
  totalCost: number;
  netProfit: number;
  paymentMethod: 'Efectivo' | 'Transferencia' | 'Tarjeta' | 'Link de Pago' | 'Otro';
  paymentStatus: 'Pagado' | 'Anticipo' | 'Pendiente';
  notes?: string;
  invoiceId?: string; // Linked invoice if created
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. FACT-2026-001
  issueDate: string;
  dueDate: string;
  businessName: string;
  businessTaxId: string; // RFC / NIT / RUT / CUIT
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  customerName: string;
  customerTaxId?: string;
  customerAddress?: string;
  customerPhone?: string;
  customerEmail?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRatePercent: number;
  taxAmount: number;
  total: number;
  paymentMethod: string;
  status: 'Emitida' | 'Pagada' | 'Anulada';
  notes?: string;
  saleId?: string;
}

export interface BusinessProfile {
  businessName: string;
  tagline: string;
  taxId: string; // RFC / RUT / NIT
  ownerName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  currencySymbol: string; // '$', 'S/.', '€', 'Q', etc.
  currencyCode: string; // 'MXN', 'USD', 'EUR', 'COP', 'PEN', etc.
  defaultTaxRate: number; // 0, 16, 19, 21, etc.
  taxName: string; // 'IVA', 'IGV', 'Impuesto', etc.
  invoicePrefix: string; // 'FACT'
  nextInvoiceNumber: number; // 1
  invoiceFooterMessage: string;
}
