// src/utils/storage.ts (puente de compatibilidad para la UI)
import { storageAdapter } from '../infrastructure/storage/LocalStorageAdapter';

export * from '../infrastructure/seeds/initialData';
export * from '../infrastructure/storage/LocalStorageAdapter';
export const storage = storageAdapter;
