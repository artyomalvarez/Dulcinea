export type WasteType = 'producto_danado' | 'insumo_vencido' | 'merma_proceso';

export type WasteReason =
  | 'quemado'
  | 'roto_deforme'
  | 'caducado'
  | 'derrame_accidente'
  | 'error_pesaje'
  | 'merma_horneado'
  | 'otro';

export interface WasteRecord {
  id: string;
  date: string;
  type: WasteType;
  itemId?: string;
  itemName: string;
  quantity: number;
  unit: string;
  directCostLost: number;
  potentialRevenueLost: number;
  reason: WasteReason;
  notes?: string;
}
