export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  totalPrice: number; // quantity * unitPrice
  unitProfit: number; // unitPrice - unitCost
}

export type SaleLine = SaleItem;

export type PaymentMethod = 'Efectivo' | 'Transferencia' | 'Tarjeta' | 'Link de Pago' | 'Otro';
export type PaymentStatus = 'Pagado' | 'Anticipo' | 'Pendiente';

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
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes?: string;
  invoiceId?: string; // Linked invoice if created
}
