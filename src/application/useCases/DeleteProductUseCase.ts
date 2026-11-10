import { Product } from '../../domain/entities/Product';
import { StoragePort } from '../../domain/ports/StoragePort';

export class DeleteProductUseCase {
  constructor(private readonly storage: StoragePort) {}

  execute(productId: string): Product[] {
    const currentProducts = this.storage.getProducts();
    const updatedProducts = currentProducts.filter((p) => p.id !== productId);
    this.storage.saveProducts(updatedProducts);
    return updatedProducts;
  }
}
