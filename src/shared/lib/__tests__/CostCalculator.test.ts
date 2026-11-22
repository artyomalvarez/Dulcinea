import { describe, it, expect } from 'vitest';
import { CostCalculator } from '../CostCalculator';

describe('CostCalculator', () => {
  it('convierte unidades de masa, volumen y conteo correctamente a unidad base', () => {
    expect(CostCalculator.convertToBaseUnit(2, 'kg')).toEqual({ baseValue: 2000, baseType: 'mass' });
    expect(CostCalculator.convertToBaseUnit(1.5, 'l')).toEqual({ baseValue: 1500, baseType: 'volume' });
    expect(CostCalculator.convertToBaseUnit(2, 'docena')).toEqual({ baseValue: 24, baseType: 'count' });
    expect(CostCalculator.convertToBaseUnit(2, 'cda')).toEqual({ baseValue: 30, baseType: 'mass' });
    expect(CostCalculator.convertToBaseUnit(3, 'cdta')).toEqual({ baseValue: 15, baseType: 'mass' });
  });

  it('calcula el costo de un ingrediente en receta y retorna 0 ante entradas inválidas', () => {
    // 250g de un paquete de 1kg (1000g) que cuesta $40 => $10
    expect(CostCalculator.calculateIngredientRecipeCost(250, 'g', 1, 'kg', 40)).toBe(10);

    // Casos borde: costo 0, paquete 0, cantidad receta <= 0
    expect(CostCalculator.calculateIngredientRecipeCost(0, 'g', 1000, 'g', 40)).toBe(0);
    expect(CostCalculator.calculateIngredientRecipeCost(100, 'g', 0, 'g', 40)).toBe(0);
    expect(CostCalculator.calculateIngredientRecipeCost(100, 'g', 1000, 'g', 0)).toBe(0);
  });

  it('protege contra división por cero en calculateCostPerUnit cuando batchYieldUnits <= 0', () => {
    expect(CostCalculator.calculateCostPerUnit(75, 15)).toBe(5);
    expect(CostCalculator.calculateCostPerUnit(75, 0)).toBe(75);
    expect(CostCalculator.calculateCostPerUnit(75, -5)).toBe(75);
  });

  it('calcula margen, markup, precio sugerido y punto de equilibrio con casos borde', () => {
    expect(CostCalculator.calculateMargin(100, 40)).toBe(60);
    expect(CostCalculator.calculateMargin(0, 40)).toBe(0);

    expect(CostCalculator.calculateMarkup(100, 40)).toBe(150);
    expect(CostCalculator.calculateMarkup(100, 0)).toBe(0);

    expect(CostCalculator.calculateSuggestedPrice(5, 50)).toBe(10);
    expect(CostCalculator.calculateSuggestedPrice(0, 50)).toBe(0);
    expect(CostCalculator.calculateSuggestedPrice(10, 100)).toBe(15); // fallback 1.5x cuando margen >= 100%

    expect(CostCalculator.calculateBreakevenUnits(75, 12)).toBe(7);
    expect(CostCalculator.calculateBreakevenUnits(75, 0)).toBe(0);
    expect(CostCalculator.calculateBreakevenUnits(0, 12)).toBe(0);
  });

  it('calcula métricas de daño y pérdida correctamente con calculateLossMetrics', () => {
    const mockProduct = {
      ingredients: [],
      otherDirectCosts: 50,
      batchYieldUnits: 10,
      sellingPrice: 10,
    };
    // Costo por unidad: 50 / 10 = 5
    // Utilidad por unidad: 10 - 5 = 5
    // Si se dañan 2 panes:
    // directCostLost = 2 * 5 = 10
    // potentialRevenueLost = 2 * 10 = 20
    // potentialProfitLost = 2 * 5 = 10
    // unidades a recuperar: 10 / 5 = 2 panes
    const metrics = CostCalculator.calculateLossMetrics(mockProduct, 2);
    expect(metrics.directCostLost).toBe(10);
    expect(metrics.potentialRevenueLost).toBe(20);
    expect(metrics.potentialProfitLost).toBe(10);
    expect(metrics.unitsToRecoverLoss).toBe(2);
    expect(metrics.adjustedBatchProfit).toBe(30);
  });
});
