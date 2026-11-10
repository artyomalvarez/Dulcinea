import { Ingredient } from '../../domain/entities/Ingredient';
import { StoragePort } from '../../domain/ports/StoragePort';

export class SaveIngredientUseCase {
  constructor(private readonly storage: StoragePort) {}

  execute(ingredient: Ingredient): Ingredient[] {
    const currentIngredients = this.storage.getIngredients();
    const existingIndex = currentIngredients.findIndex((i) => i.id === ingredient.id);

    const updatedIngredients =
      existingIndex >= 0
        ? currentIngredients.map((i) => (i.id === ingredient.id ? ingredient : i))
        : [ingredient, ...currentIngredients];

    this.storage.saveIngredients(updatedIngredients);
    return updatedIngredients;
  }
}

export class DeleteIngredientUseCase {
  constructor(private readonly storage: StoragePort) {}

  execute(ingredientId: string): Ingredient[] {
    const currentIngredients = this.storage.getIngredients();
    const updatedIngredients = currentIngredients.filter((i) => i.id !== ingredientId);
    this.storage.saveIngredients(updatedIngredients);
    return updatedIngredients;
  }
}
