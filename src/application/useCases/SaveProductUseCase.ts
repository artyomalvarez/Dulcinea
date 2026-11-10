import { Product } from '../../domain/entities';
import { StoragePort } from '../../domain/ports/StoragePort';

export const saveProductUseCase = (product: Product, storage: StoragePort): Product => {
  const currentProducts = storage.getProducts();
  const existingIndex = currentProducts.findIndex((p) => p.id === product.id);

  const cleanProduct: Product = {
    id: product.id,
    name: product.name,
    category: product.category,
    description: product.description,
    ingredients: product.ingredients,
    otherDirectCosts: product.otherDirectCosts,
    batchYieldUnits: product.batchYieldUnits,
    yieldUnitName: product.yieldUnitName,
    suggestedMarginPercent: product.suggestedMarginPercent,
    sellingPrice: product.sellingPrice,
    notes: product.notes,
    imageUrl: product.imageUrl,
  };

  const updatedProducts =
    existingIndex >= 0
      ? currentProducts.map((p) => (p.id === cleanProduct.id ? cleanProduct : p))
      : [cleanProduct, ...currentProducts];

  storage.saveProducts(updatedProducts);
  return cleanProduct;
};

export class SaveProductUseCase {
  constructor(private readonly storage: StoragePort) {}

  execute(product: Product): Product[] {
    saveProductUseCase(product, this.storage);
    return this.storage.getProducts();
  }
}
