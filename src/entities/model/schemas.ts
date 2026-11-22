import { z } from 'zod';

export const UnitOfMeasureSchema = z.enum([
  'g',
  'kg',
  'ml',
  'l',
  'pza',
  'cda',
  'cdta',
  'docena',
]);

export const IngredientCategorySchema = z.enum([
  'Harinas y Polvos',
  'Lácteos y Grasas',
  'Decoraciones y Coberturas',
  'Azúcares y Endulzantes',
  'Chocolates y Cacaos',
  'Huevos',
  'Esencias, Frutas y Sabores',
  'Empaque y Presentación',
  'Otros',
  'Harinas y Granos',
  'Azúcares',
  'Esencias y Frutas',
]);

export const IngredientSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'El nombre del insumo es obligatorio'),
  category: IngredientCategorySchema,
  purchasePackageQuantity: z.number().positive('La cantidad debe ser mayor a 0'),
  purchasePackageUnit: UnitOfMeasureSchema,
  purchaseCost: z.number().positive('El costo debe ser mayor a 0'),
  currentStock: z.number().min(0, 'El stock no puede ser negativo').optional(),
  minStockAlert: z.number().min(0, 'El stock mínimo no puede ser negativo').optional(),
  notes: z.string().optional(),
});

export const ProductCategorySchema = z.enum([
  'Pasteles',
  'Galletas',
  'Cupcakes',
  'Postres Fríos',
  'Panadería',
  'Bocaditos y Tartas',
]);

export const RecipeIngredientSchema = z.object({
  ingredientId: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().positive(),
  recipeUnit: UnitOfMeasureSchema,
  calculatedCost: z.number().min(0),
});

export const ProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, 'El nombre del producto es obligatorio'),
  category: ProductCategorySchema,
  description: z.string().optional(),
  ingredients: z.array(RecipeIngredientSchema),
  otherDirectCosts: z.number().min(0),
  batchYieldUnits: z.number().positive(),
  yieldUnitName: z.string().min(1),
  suggestedMarginPercent: z.number().min(0).max(99.9),
  sellingPrice: z.number().min(0),
  notes: z.string().optional(),
  imageUrl: z.string().optional(),
});

export const ProductionBatchSchema = z.object({
  id: z.string().min(1),
  batchCode: z.string().min(1),
  date: z.string().min(1),
  productId: z.string().min(1),
  productName: z.string().min(1),
  numberOfBatches: z.number().positive(),
  unitsPerBatch: z.number().positive(),
  totalUnitsProduced: z.number().positive(),
  totalSuppliesCost: z.number().min(0),
  costPerUnit: z.number().min(0),
  unitsSold: z.number().min(0),
  notes: z.string().optional(),
  status: z.enum(['completado', 'en_proceso', 'agotado']),
});

export const SaleItemSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  quantity: z.number().positive(),
  unitCost: z.number().min(0),
  unitPrice: z.number().min(0),
  totalPrice: z.number().min(0),
  unitProfit: z.number(),
});

export const PaymentMethodSchema = z.enum([
  'Efectivo',
  'Transferencia',
  'Tarjeta',
  'Link de Pago',
  'Otro',
]);

export const PaymentStatusSchema = z.enum(['Pagado', 'Anticipo', 'Pendiente']);

export const SaleSchema = z.object({
  id: z.string().min(1),
  saleNumber: z.string().min(1),
  date: z.string().min(1, 'La fecha es obligatoria'),
  customerName: z.string().min(1, 'El nombre del cliente es obligatorio'),
  customerPhone: z.string().optional(),
  customerEmail: z.string().optional(),
  items: z.array(SaleItemSchema).min(1, 'Agrega al menos un producto a la venta'),
  subtotal: z.number().min(0),
  taxRatePercent: z.number().min(0),
  taxAmount: z.number().min(0),
  totalAmount: z.number().min(0),
  totalCost: z.number().min(0),
  netProfit: z.number(),
  paymentMethod: PaymentMethodSchema,
  paymentStatus: PaymentStatusSchema,
  notes: z.string().optional(),
  invoiceId: z.string().optional(),
});

export const InvoiceItemSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
  amount: z.number().min(0),
});

export const InvoiceStatusSchema = z.enum(['Emitida', 'Pagada', 'Anulada']);

export const InvoiceSchema = z.object({
  id: z.string().min(1),
  invoiceNumber: z.string().min(1),
  issueDate: z.string().min(1),
  dueDate: z.string().min(1),
  businessName: z.string().min(1),
  businessTaxId: z.string(),
  businessAddress: z.string(),
  businessPhone: z.string(),
  businessEmail: z.string(),
  customerName: z.string().min(1),
  customerTaxId: z.string().optional(),
  customerAddress: z.string().optional(),
  customerPhone: z.string().optional(),
  customerEmail: z.string().optional(),
  items: z.array(InvoiceItemSchema),
  subtotal: z.number().min(0),
  taxRatePercent: z.number().min(0),
  taxAmount: z.number().min(0),
  total: z.number().min(0),
  paymentMethod: z.string(),
  status: InvoiceStatusSchema,
  notes: z.string().optional(),
  saleId: z.string().optional(),
});

export const BusinessProfileSchema = z.object({
  businessName: z.string().min(1),
  tagline: z.string(),
  taxId: z.string(),
  ownerName: z.string(),
  phone: z.string(),
  whatsapp: z.string(),
  email: z.string(),
  address: z.string(),
  city: z.string(),
  currencySymbol: z.string().min(1),
  currencyCode: z.string().min(1),
  defaultTaxRate: z.number().min(0).max(100),
  taxName: z.string(),
  invoicePrefix: z.string(),
  nextInvoiceNumber: z.number().int().min(1),
  invoiceFooterMessage: z.string(),
});

export const WasteTypeSchema = z.enum(['producto_danado', 'insumo_vencido', 'merma_proceso']);

export const WasteReasonSchema = z.enum([
  'quemado',
  'roto_deforme',
  'caducado',
  'derrame_accidente',
  'error_pesaje',
  'merma_horneado',
  'otro',
]);

export const WasteRecordSchema = z.object({
  id: z.string().min(1),
  date: z.string().min(1),
  type: WasteTypeSchema,
  itemId: z.string().optional(),
  itemName: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  directCostLost: z.number().min(0),
  potentialRevenueLost: z.number().min(0),
  reason: WasteReasonSchema,
  notes: z.string().optional(),
});

export const BackupPayloadSchema = z.object({
  version: z.string().optional(),
  exportedAt: z.string().optional(),
  business: BusinessProfileSchema.optional(),
  ingredients: z.array(IngredientSchema).optional(),
  products: z.array(ProductSchema).optional(),
  batches: z.array(ProductionBatchSchema).optional(),
  sales: z.array(SaleSchema).optional(),
  invoices: z.array(InvoiceSchema).optional(),
  wastes: z.array(WasteRecordSchema).optional(),
});
