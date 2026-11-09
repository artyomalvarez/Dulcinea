import { BusinessProfile, Ingredient, Invoice, Product, ProductionBatch, Sale } from '../types/bakery';

const STORAGE_KEYS = {
  INGREDIENTS: 'dulcecosto_ingredients_v3',
  PRODUCTS: 'dulcecosto_products_v1',
  BATCHES: 'dulcecosto_batches_v2',
  SALES: 'dulcecosto_sales_v2',
  INVOICES: 'dulcecosto_invoices_v1',
  BUSINESS: 'dulcecosto_business_v1',
};

export const INITIAL_BUSINESS_PROFILE: BusinessProfile = {
  businessName: 'Dulce Canela - Taller de Repostería',
  tagline: 'Pastelería fina y bocadillos artesanales horneados con amor',
  taxId: 'CAN-891023-R55', // RFC / NIT / RUT de ejemplo editable
  ownerName: 'Mariana Valenzuela',
  phone: '+52 55 4123 8900',
  whatsapp: '+52 55 4123 8900',
  email: 'contacto@dulcecanela.com',
  address: 'Av. Las Gardenias #342, Col. Del Valle',
  city: 'Ciudad de México, CP 03100',
  currencySymbol: '$',
  currencyCode: 'MXN',
  defaultTaxRate: 16,
  taxName: 'IVA (16%)',
  invoicePrefix: 'FACT-2026',
  nextInvoiceNumber: 104,
  invoiceFooterMessage: '¡Gracias por su preferencia y por permitirnos endulzar sus mejores momentos!',
};

export const INITIAL_INGREDIENTS: Ingredient[] = [
  {
    id: 'ing-1',
    name: 'Harina de Trigo Especial Repostería',
    category: 'Harinas y Polvos',
    purchasePackageQuantity: 1000,
    purchasePackageUnit: 'g',
    purchaseCost: 26.00,
    currentStock: 4500,
    minStockAlert: 2000,
  },
  {
    id: 'ing-8',
    name: 'Polvo de Hornear Doble Acción Royal',
    category: 'Harinas y Polvos',
    purchasePackageQuantity: 500,
    purchasePackageUnit: 'g',
    purchaseCost: 45.00,
    currentStock: 800,
    minStockAlert: 300,
  },
  {
    id: 'ing-3',
    name: 'Mantequilla Pura sin Sal Gloria/Lurpak',
    category: 'Lácteos y Grasas',
    purchasePackageQuantity: 1000,
    purchasePackageUnit: 'g',
    purchaseCost: 155.00,
    currentStock: 600, // Bajo stock (mínimo 1500g)
    minStockAlert: 1500,
    notes: 'Insumo crítico: reabastecer antes del fin de semana',
  },
  {
    id: 'ing-9',
    name: 'Queso Crema Tipo Filadelfia',
    category: 'Lácteos y Grasas',
    purchasePackageQuantity: 1000,
    purchasePackageUnit: 'g',
    purchaseCost: 130.00,
    currentStock: 2000,
    minStockAlert: 1000,
  },
  {
    id: 'ing-10',
    name: 'Crema para Batir 35% Grasa',
    category: 'Lácteos y Grasas',
    purchasePackageQuantity: 1000,
    purchasePackageUnit: 'ml',
    purchaseCost: 98.00,
    currentStock: 1800,
    minStockAlert: 1000,
  },
  {
    id: 'ing-12',
    name: 'Perlas Comestibles Doradas y Plateadas',
    category: 'Decoraciones y Coberturas',
    purchasePackageQuantity: 150,
    purchasePackageUnit: 'g',
    purchaseCost: 65.00,
    currentStock: 50, // Bajo stock (mínimo 120g)
    minStockAlert: 120,
    notes: 'Para acabado de cupcakes y pasteles de bodas',
  },
  {
    id: 'ing-13',
    name: 'Granillo y Chispas de Colores (Sprinkles)',
    category: 'Decoraciones y Coberturas',
    purchasePackageQuantity: 500,
    purchasePackageUnit: 'g',
    purchaseCost: 55.00,
    currentStock: 1000,
    minStockAlert: 300,
  },
  {
    id: 'ing-14',
    name: 'Brillo y Matizador Comestible en Polvo',
    category: 'Decoraciones y Coberturas',
    purchasePackageQuantity: 50,
    purchasePackageUnit: 'g',
    purchaseCost: 48.00,
    currentStock: 100,
    minStockAlert: 30,
  },
  {
    id: 'ing-2',
    name: 'Azúcar Refinada Blanca',
    category: 'Azúcares y Endulzantes',
    purchasePackageQuantity: 1000,
    purchasePackageUnit: 'g',
    purchaseCost: 32.00,
    currentStock: 4000,
    minStockAlert: 1500,
  },
  {
    id: 'ing-15',
    name: 'Azúcar Glass / Impalpable Cernida',
    category: 'Azúcares y Endulzantes',
    purchasePackageQuantity: 1000,
    purchasePackageUnit: 'g',
    purchaseCost: 38.00,
    currentStock: 2000,
    minStockAlert: 800,
  },
  {
    id: 'ing-4',
    name: 'Huevos de Granja Clase A',
    category: 'Huevos',
    purchasePackageQuantity: 30,
    purchasePackageUnit: 'pza',
    purchaseCost: 90.00,
    currentStock: 14, // Bajo stock (mínimo 30 pza)
    minStockAlert: 30,
    notes: 'Comprar cono de 30 piezas urgente',
  },
  {
    id: 'ing-5',
    name: 'Chispas de Chocolate Semiamargo 60%',
    category: 'Chocolates y Cacaos',
    purchasePackageQuantity: 1000,
    purchasePackageUnit: 'g',
    purchaseCost: 180.00,
    currentStock: 2000,
    minStockAlert: 800,
  },
  {
    id: 'ing-6',
    name: 'Cacao Puro en Polvo Alcalino',
    category: 'Chocolates y Cacaos',
    purchasePackageQuantity: 500,
    purchasePackageUnit: 'g',
    purchaseCost: 95.00,
    currentStock: 1500,
    minStockAlert: 400,
  },
  {
    id: 'ing-7',
    name: 'Extracto Natural de Vainilla Papantla',
    category: 'Esencias, Frutas y Sabores',
    purchasePackageQuantity: 250,
    purchasePackageUnit: 'ml',
    purchaseCost: 85.00,
    currentStock: 500,
    minStockAlert: 200,
  },
  {
    id: 'ing-11',
    name: 'Cajas Kraft con Ventana y Moño',
    category: 'Empaque y Presentación',
    purchasePackageQuantity: 25,
    purchasePackageUnit: 'pza',
    purchaseCost: 150.00,
    currentStock: 50,
    minStockAlert: 20,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-cookies-15',
    name: 'Galletas Artesanales con Chispas de Chocolate',
    category: 'Galletas',
    description: 'Galletas recién horneadas con mantequilla pura y chispas de chocolate semiamargo. Horneadas en lote de 3 bandejas de 5 unidades.',
    batchYieldUnits: 15,
    yieldUnitName: 'galletas',
    otherDirectCosts: 10.00, // empaque y horneado
    ingredients: [
      {
        ingredientId: 'ing-1',
        name: 'Harina de Trigo Especial Repostería',
        quantity: 350,
        recipeUnit: 'g',
        calculatedCost: 9.10, // 350 * 0.026
      },
      {
        ingredientId: 'ing-2',
        name: 'Azúcar Refinada Blanca',
        quantity: 200,
        recipeUnit: 'g',
        calculatedCost: 6.40, // 200 * 0.032
      },
      {
        ingredientId: 'ing-3',
        name: 'Mantequilla Pura sin Sal',
        quantity: 180,
        recipeUnit: 'g',
        calculatedCost: 27.90, // 180 * 0.155
      },
      {
        ingredientId: 'ing-4',
        name: 'Huevos de Granja Clase A',
        quantity: 2,
        recipeUnit: 'pza',
        calculatedCost: 6.00, // 2 * 3.00
      },
      {
        ingredientId: 'ing-5',
        name: 'Chispas de Chocolate Semiamargo 60%',
        quantity: 80,
        recipeUnit: 'g',
        calculatedCost: 14.40, // 80 * 0.18
      },
      {
        ingredientId: 'ing-7',
        name: 'Extracto Natural de Vainilla Papantla',
        quantity: 3,
        recipeUnit: 'ml',
        calculatedCost: 1.20,
      },
    ],
    // Total insumos = 9.10 + 6.40 + 27.90 + 6.00 + 14.40 + 1.20 + 10.00 = 75.00! Exactamente el ejemplo de usuario.
    totalBatchCost: 75.00,
    costPerUnit: 5.00, // 75 / 15 = 5.00
    suggestedMarginPercent: 58.33,
    sellingPrice: 12.00,
    profitPerUnit: 7.00, // 12.00 - 5.00 = 7.00
    profitMarginPercent: 58.33, // (7.00 / 12.00) * 100
    notes: 'Receta base de referencia: 75 de insumos para 15 galletas. Costo unitario = $5.00.',
  },
  {
    id: 'prod-cake-choc',
    name: 'Pastel Supreme de Chocolate 22cm',
    category: 'Pasteles',
    description: 'Bizcocho húmedo de cacao holandés relleno con ganache de chocolate semiamargo y cubierta brillante.',
    batchYieldUnits: 10,
    yieldUnitName: 'porciones',
    otherDirectCosts: 18.00, // caja alta con domo + base rígida + gas
    ingredients: [
      {
        ingredientId: 'ing-1',
        name: 'Harina de Trigo Especial Repostería',
        quantity: 300,
        recipeUnit: 'g',
        calculatedCost: 7.80,
      },
      {
        ingredientId: 'ing-2',
        name: 'Azúcar Refinada Blanca',
        quantity: 280,
        recipeUnit: 'g',
        calculatedCost: 8.96,
      },
      {
        ingredientId: 'ing-3',
        name: 'Mantequilla Pura sin Sal',
        quantity: 150,
        recipeUnit: 'g',
        calculatedCost: 23.25,
      },
      {
        ingredientId: 'ing-4',
        name: 'Huevos de Granja Clase A',
        quantity: 4,
        recipeUnit: 'pza',
        calculatedCost: 12.00,
      },
      {
        ingredientId: 'ing-6',
        name: 'Cacao Puro en Polvo Alcalino',
        quantity: 90,
        recipeUnit: 'g',
        calculatedCost: 17.10,
      },
      {
        ingredientId: 'ing-10',
        name: 'Crema para Batir 35% Grasa',
        quantity: 250,
        recipeUnit: 'ml',
        calculatedCost: 24.50,
      },
      {
        ingredientId: 'ing-7',
        name: 'Extracto Natural de Vainilla Papantla',
        quantity: 5,
        recipeUnit: 'ml',
        calculatedCost: 1.70,
      },
    ],
    totalBatchCost: 113.31,
    costPerUnit: 11.33, // Costo por porción
    suggestedMarginPercent: 65,
    sellingPrice: 32.00, // Precio por porción ($320 por pastel completo de 10 porciones)
    profitPerUnit: 20.67,
    profitMarginPercent: 64.59,
    notes: 'Venta por porción individual ($32.00) o pastel completo de 10 porciones ($320.00).',
  },
  {
    id: 'prod-cupcakes-rv',
    name: 'Cupcakes Red Velvet con Frosting de Queso Crema (Caja x6)',
    category: 'Cupcakes',
    description: 'Bizcocho terciopelo rojo con suave frosting de queso crema decorado con migajas y perlas comestibles.',
    batchYieldUnits: 6,
    yieldUnitName: 'cupcakes',
    otherDirectCosts: 12.00, // Caja transparente x6 + capacillos metalizados
    ingredients: [
      {
        ingredientId: 'ing-1',
        name: 'Harina de Trigo Especial Repostería',
        quantity: 200,
        recipeUnit: 'g',
        calculatedCost: 5.20,
      },
      {
        ingredientId: 'ing-2',
        name: 'Azúcar Refinada Blanca',
        quantity: 150,
        recipeUnit: 'g',
        calculatedCost: 4.80,
      },
      {
        ingredientId: 'ing-3',
        name: 'Mantequilla Pura sin Sal',
        quantity: 100,
        recipeUnit: 'g',
        calculatedCost: 15.50,
      },
      {
        ingredientId: 'ing-4',
        name: 'Huevos de Granja Clase A',
        quantity: 2,
        recipeUnit: 'pza',
        calculatedCost: 6.00,
      },
      {
        ingredientId: 'ing-9',
        name: 'Queso Crema Tipo Filadelfia',
        quantity: 220,
        recipeUnit: 'g',
        calculatedCost: 28.60,
      },
    ],
    totalBatchCost: 72.10,
    costPerUnit: 12.02,
    suggestedMarginPercent: 60,
    sellingPrice: 28.00,
    profitPerUnit: 15.98,
    profitMarginPercent: 57.07,
    notes: 'Caja con 6 piezas se vende a $168.00 ($28.00 por cupcake individual).',
  },
];

export const INITIAL_BATCHES: ProductionBatch[] = [
  {
    id: 'batch-jun-01',
    batchCode: 'LOTE-2026-050',
    date: '2026-06-14',
    productId: 'prod-cake-choc',
    productName: 'Pastel Supreme de Chocolate 22cm',
    numberOfBatches: 8,
    unitsPerBatch: 10,
    totalUnitsProduced: 80,
    totalSuppliesCost: 890.00,
    costPerUnit: 11.12,
    unitsSold: 80,
    notes: 'Lotes para festejos de mitad de año.',
    status: 'agotado',
  },
  {
    id: 'batch-jul-01',
    batchCode: 'LOTE-2026-062',
    date: '2026-07-18',
    productId: 'prod-cookies-15',
    productName: 'Galletas Artesanales con Chispas de Chocolate',
    numberOfBatches: 18,
    unitsPerBatch: 5,
    totalUnitsProduced: 90,
    totalSuppliesCost: 450.00,
    costPerUnit: 5.00,
    unitsSold: 90,
    notes: 'Producción de vacaciones de julio.',
    status: 'agotado',
  },
  {
    id: 'batch-ago-01',
    batchCode: 'LOTE-2026-075',
    date: '2026-08-20',
    productId: 'prod-cupcakes-rv',
    productName: 'Cupcakes Red Velvet con Frosting de Queso Crema (Caja x6)',
    numberOfBatches: 14,
    unitsPerBatch: 6,
    totalUnitsProduced: 84,
    totalSuppliesCost: 990.00,
    costPerUnit: 11.78,
    unitsSold: 84,
    notes: 'Temporada de regreso a clases y pedidos corporativos.',
    status: 'agotado',
  },
  {
    id: 'batch-sep-01',
    batchCode: 'LOTE-2026-088',
    date: '2026-09-15',
    productId: 'prod-cake-choc',
    productName: 'Pastel Supreme de Chocolate 22cm',
    numberOfBatches: 12,
    unitsPerBatch: 10,
    totalUnitsProduced: 120,
    totalSuppliesCost: 1350.00,
    costPerUnit: 11.25,
    unitsSold: 120,
    notes: 'Pedidos especiales patrios.',
    status: 'agotado',
  },
  {
    id: 'batch-oct-01',
    batchCode: 'LOTE-2026-095',
    date: '2026-10-24',
    productId: 'prod-cookies-15',
    productName: 'Galletas Artesanales con Chispas de Chocolate',
    numberOfBatches: 25,
    unitsPerBatch: 5,
    totalUnitsProduced: 125,
    totalSuppliesCost: 625.00,
    costPerUnit: 5.00,
    unitsSold: 125,
    notes: 'Galletas temáticas de otoño.',
    status: 'agotado',
  },
  {
    id: 'batch-001',
    batchCode: 'LOTE-2026-001',
    date: '2026-11-08',
    productId: 'prod-cookies-15',
    productName: 'Galletas Artesanales con Chispas de Chocolate',
    numberOfBatches: 3, // 3 horneadas de 5 unidades cada una
    unitsPerBatch: 5,
    totalUnitsProduced: 15,
    totalSuppliesCost: 75.00,
    costPerUnit: 5.00,
    unitsSold: 12,
    notes: 'Lote de prueba de galletas. Total insumos 75 / 15 unidades = 5 por unidad.',
    status: 'completado',
  },
  {
    id: 'batch-002',
    batchCode: 'LOTE-2026-002',
    date: '2026-11-09',
    productId: 'prod-cake-choc',
    productName: 'Pastel Supreme de Chocolate 22cm',
    numberOfBatches: 2,
    unitsPerBatch: 10,
    totalUnitsProduced: 20,
    totalSuppliesCost: 226.62,
    costPerUnit: 11.33,
    unitsSold: 10,
    notes: '2 pasteles completos horneados para pedido de fin de semana.',
    status: 'completado',
  },
  {
    id: 'batch-003',
    batchCode: 'LOTE-2026-003',
    date: '2026-11-09',
    productId: 'prod-cupcakes-rv',
    productName: 'Cupcakes Red Velvet con Frosting de Queso Crema (Caja x6)',
    numberOfBatches: 3,
    unitsPerBatch: 6,
    totalUnitsProduced: 18,
    totalSuppliesCost: 216.30,
    costPerUnit: 12.02,
    unitsSold: 12,
    notes: '3 cajas de 6 cupcakes preparadas para cafetería asociada.',
    status: 'completado',
  },
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-jun-01',
    saleNumber: 'VTA-JUN-01',
    date: '2026-06-25',
    customerName: 'Pastelería & Café El Molino',
    customerPhone: '55 2233 4455',
    customerEmail: 'compras@elmolino.com',
    items: [
      {
        productId: 'prod-cake-choc',
        productName: 'Pastel Supreme de Chocolate 22cm',
        quantity: 80,
        unitCost: 11.12,
        unitPrice: 32.00,
        totalCost: 889.60,
        totalPrice: 2560.00,
        unitProfit: 20.88,
        totalProfit: 1670.40,
      },
    ],
    subtotal: 2560.00,
    taxRatePercent: 16,
    taxAmount: 409.60,
    totalAmount: 2969.60,
    totalCost: 889.60,
    netProfit: 1670.40,
    paymentMethod: 'Transferencia',
    paymentStatus: 'Pagado',
    notes: 'Ventas consolidadas de junio.',
  },
  {
    id: 'sale-jul-01',
    saleNumber: 'VTA-JUL-01',
    date: '2026-07-28',
    customerName: 'Eventos Dulces Recuerdos',
    customerPhone: '55 3344 5566',
    customerEmail: 'eventos@dulcesrecuerdos.com',
    items: [
      {
        productId: 'prod-cookies-15',
        productName: 'Galletas Artesanales con Chispas de Chocolate',
        quantity: 90,
        unitCost: 5.00,
        unitPrice: 12.00,
        totalCost: 450.00,
        totalPrice: 1080.00,
        unitProfit: 7.00,
        totalProfit: 630.00,
      },
      {
        productId: 'prod-cake-choc',
        productName: 'Pastel Supreme de Chocolate 22cm',
        quantity: 30,
        unitCost: 11.33,
        unitPrice: 32.00,
        totalCost: 339.90,
        totalPrice: 960.00,
        unitProfit: 20.67,
        totalProfit: 620.10,
      },
    ],
    subtotal: 2040.00,
    taxRatePercent: 16,
    taxAmount: 326.40,
    totalAmount: 2366.40,
    totalCost: 789.90,
    netProfit: 1250.10,
    paymentMethod: 'Transferencia',
    paymentStatus: 'Pagado',
    notes: 'Ventas de julio.',
  },
  {
    id: 'sale-ago-01',
    saleNumber: 'VTA-AGO-01',
    date: '2026-08-28',
    customerName: 'Colegio Monteverde',
    customerPhone: '55 4455 6677',
    customerEmail: 'cafeteria@monteverde.edu.mx',
    items: [
      {
        productId: 'prod-cupcakes-rv',
        productName: 'Cupcakes Red Velvet (84 unidades)',
        quantity: 84,
        unitCost: 11.78,
        unitPrice: 28.00,
        totalCost: 989.52,
        totalPrice: 2352.00,
        unitProfit: 16.22,
        totalProfit: 1362.48,
      },
    ],
    subtotal: 2352.00,
    taxRatePercent: 16,
    taxAmount: 376.32,
    totalAmount: 2728.32,
    totalCost: 989.52,
    netProfit: 1362.48,
    paymentMethod: 'Transferencia',
    paymentStatus: 'Pagado',
    notes: 'Ventas de agosto.',
  },
  {
    id: 'sale-sep-01',
    saleNumber: 'VTA-SEP-01',
    date: '2026-09-29',
    customerName: 'Banquetería Las Flores',
    customerPhone: '55 5566 7788',
    customerEmail: 'banquetes@lasflores.com',
    items: [
      {
        productId: 'prod-cake-choc',
        productName: 'Pastel Supreme de Chocolate 22cm',
        quantity: 120,
        unitCost: 11.25,
        unitPrice: 32.00,
        totalCost: 1350.00,
        totalPrice: 3840.00,
        unitProfit: 20.75,
        totalProfit: 2490.00,
      },
    ],
    subtotal: 3840.00,
    taxRatePercent: 16,
    taxAmount: 614.40,
    totalAmount: 4454.40,
    totalCost: 1350.00,
    netProfit: 2490.00,
    paymentMethod: 'Transferencia',
    paymentStatus: 'Pagado',
    notes: 'Ventas de septiembre.',
  },
  {
    id: 'sale-oct-01',
    saleNumber: 'VTA-OCT-01',
    date: '2026-10-30',
    customerName: 'Corporativo Santa Fe',
    customerPhone: '55 6677 8899',
    customerEmail: 'eventos@corpsantafe.com',
    items: [
      {
        productId: 'prod-cookies-15',
        productName: 'Galletas Artesanales con Chispas de Chocolate',
        quantity: 125,
        unitCost: 5.00,
        unitPrice: 12.00,
        totalCost: 625.00,
        totalPrice: 1500.00,
        unitProfit: 7.00,
        totalProfit: 875.00,
      },
      {
        productId: 'prod-cupcakes-rv',
        productName: 'Cupcakes Red Velvet',
        quantity: 60,
        unitCost: 12.02,
        unitPrice: 28.00,
        totalCost: 721.20,
        totalPrice: 1680.00,
        unitProfit: 15.98,
        totalProfit: 958.80,
      },
    ],
    subtotal: 3180.00,
    taxRatePercent: 16,
    taxAmount: 508.80,
    totalAmount: 3688.80,
    totalCost: 1346.20,
    netProfit: 1833.80,
    paymentMethod: 'Transferencia',
    paymentStatus: 'Pagado',
    notes: 'Ventas de octubre.',
  },
  {
    id: 'sale-001',
    saleNumber: 'VTA-001',
    date: '2026-11-08',
    customerName: 'Carolina Méndez',
    customerPhone: '55 1234 5678',
    customerEmail: 'carolina.mendez@gmail.com',
    items: [
      {
        productId: 'prod-cookies-15',
        productName: 'Galletas Artesanales con Chispas de Chocolate',
        quantity: 12,
        unitCost: 5.00,
        unitPrice: 12.00,
        totalCost: 60.00,
        totalPrice: 144.00,
        unitProfit: 7.00,
        totalProfit: 84.00,
      },
    ],
    subtotal: 144.00,
    taxRatePercent: 16,
    taxAmount: 23.04,
    totalAmount: 167.04,
    totalCost: 60.00,
    netProfit: 84.00,
    paymentMethod: 'Transferencia',
    paymentStatus: 'Pagado',
    notes: 'Entrega para reunión familiar. Facturada con éxito.',
    invoiceId: 'inv-001',
  },
  {
    id: 'sale-002',
    saleNumber: 'VTA-002',
    date: '2026-11-09',
    customerName: 'Restaurante Bistro San Ángel',
    customerPhone: '55 9876 5432',
    customerEmail: 'compras@bistrosanangel.com',
    items: [
      {
        productId: 'prod-cake-choc',
        productName: 'Pastel Supreme de Chocolate 22cm (Pastel Completo 10 porciones)',
        quantity: 10,
        unitCost: 11.33,
        unitPrice: 32.00,
        totalCost: 113.30,
        totalPrice: 320.00,
        unitProfit: 20.67,
        totalProfit: 206.70,
      },
      {
        productId: 'prod-cupcakes-rv',
        productName: 'Cupcakes Red Velvet (12 unidades)',
        quantity: 12,
        unitCost: 12.02,
        unitPrice: 28.00,
        totalCost: 144.24,
        totalPrice: 336.00,
        unitProfit: 15.98,
        totalProfit: 191.76,
      },
    ],
    subtotal: 656.00,
    taxRatePercent: 16,
    taxAmount: 104.96,
    totalAmount: 760.96,
    totalCost: 257.54,
    netProfit: 398.46,
    paymentMethod: 'Transferencia',
    paymentStatus: 'Pagado',
    notes: 'Pedido corporativo recurrente.',
    invoiceId: 'inv-002',
  },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    invoiceNumber: 'FACT-2026-101',
    issueDate: '2026-11-08',
    dueDate: '2026-11-15',
    businessName: INITIAL_BUSINESS_PROFILE.businessName,
    businessTaxId: INITIAL_BUSINESS_PROFILE.taxId,
    businessAddress: INITIAL_BUSINESS_PROFILE.address,
    businessPhone: INITIAL_BUSINESS_PROFILE.phone,
    businessEmail: INITIAL_BUSINESS_PROFILE.email,
    customerName: 'Carolina Méndez',
    customerTaxId: 'MEN-920415-X11',
    customerAddress: 'Calle Roble #56, Benito Juárez, CDMX',
    customerPhone: '55 1234 5678',
    customerEmail: 'carolina.mendez@gmail.com',
    items: [
      {
        id: 'item-1',
        description: 'Galletas Artesanales con Chispas de Chocolate (Docena horneada)',
        quantity: 12,
        unitPrice: 12.00,
        amount: 144.00,
      },
    ],
    subtotal: 144.00,
    taxRatePercent: 16,
    taxAmount: 23.04,
    total: 167.04,
    paymentMethod: 'Transferencia Bancaria (SPEI)',
    status: 'Pagada',
    notes: 'Servicio entregado a conformidad. Gracias por su compra.',
    saleId: 'sale-001',
  },
  {
    id: 'inv-002',
    invoiceNumber: 'FACT-2026-102',
    issueDate: '2026-11-09',
    dueDate: '2026-11-20',
    businessName: INITIAL_BUSINESS_PROFILE.businessName,
    businessTaxId: INITIAL_BUSINESS_PROFILE.taxId,
    businessAddress: INITIAL_BUSINESS_PROFILE.address,
    businessPhone: INITIAL_BUSINESS_PROFILE.phone,
    businessEmail: INITIAL_BUSINESS_PROFILE.email,
    customerName: 'Restaurante Bistro San Ángel S.A. de C.V.',
    customerTaxId: 'BSA-180402-9A4',
    customerAddress: 'Plaza San Jacinto #12, Álvaro Obregón, CDMX',
    customerPhone: '55 9876 5432',
    customerEmail: 'facturacion@bistrosanangel.com',
    items: [
      {
        id: 'item-1',
        description: 'Pastel Supreme de Chocolate 22cm (Pastel Completo / 10 porciones)',
        quantity: 10,
        unitPrice: 32.00,
        amount: 320.00,
      },
      {
        id: 'item-2',
        description: 'Cupcakes Red Velvet Gourmet (Cajas con 12 piezas)',
        quantity: 12,
        unitPrice: 28.00,
        amount: 336.00,
      },
    ],
    subtotal: 656.00,
    taxRatePercent: 16,
    taxAmount: 104.96,
    total: 760.96,
    paymentMethod: 'Transferencia Electrónica',
    status: 'Pagada',
    notes: 'Suministro semanal de postres y pasteles finos.',
    saleId: 'sale-002',
  },
];

// Storage Helper Functions
export const storage = {
  getIngredients(): Ingredient[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INGREDIENTS);
    return raw ? JSON.parse(raw) : INITIAL_INGREDIENTS;
  },
  saveIngredients(data: Ingredient[]) {
    localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(data));
  },

  getProducts(): Product[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return raw ? JSON.parse(raw) : INITIAL_PRODUCTS;
  },
  saveProducts(data: Product[]) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data));
  },

  getBatches(): ProductionBatch[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BATCHES);
    return raw ? JSON.parse(raw) : INITIAL_BATCHES;
  },
  saveBatches(data: ProductionBatch[]) {
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(data));
  },

  getSales(): Sale[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SALES);
    return raw ? JSON.parse(raw) : INITIAL_SALES;
  },
  saveSales(data: Sale[]) {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(data));
  },

  getInvoices(): Invoice[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return raw ? JSON.parse(raw) : INITIAL_INVOICES;
  },
  saveInvoices(data: Invoice[]) {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(data));
  },

  getBusinessProfile(): BusinessProfile {
    const raw = localStorage.getItem(STORAGE_KEYS.BUSINESS);
    return raw ? JSON.parse(raw) : INITIAL_BUSINESS_PROFILE;
  },
  saveBusinessProfile(data: BusinessProfile) {
    localStorage.setItem(STORAGE_KEYS.BUSINESS, JSON.stringify(data));
  },

  exportBackup(): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      business: this.getBusinessProfile(),
      ingredients: this.getIngredients(),
      products: this.getProducts(),
      batches: this.getBatches(),
      sales: this.getSales(),
      invoices: this.getInvoices(),
    };
    return JSON.stringify(backup, null, 2);
  },

  importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.business) this.saveBusinessProfile(data.business);
      if (data.ingredients) this.saveIngredients(data.ingredients);
      if (data.products) this.saveProducts(data.products);
      if (data.batches) this.saveBatches(data.batches);
      if (data.sales) this.saveSales(data.sales);
      if (data.invoices) this.saveInvoices(data.invoices);
      return true;
    } catch (err) {
      console.error('Error importing backup:', err);
      return false;
    }
  },

  resetToDefaults() {
    this.saveIngredients(INITIAL_INGREDIENTS);
    this.saveProducts(INITIAL_PRODUCTS);
    this.saveBatches(INITIAL_BATCHES);
    this.saveSales(INITIAL_SALES);
    this.saveInvoices(INITIAL_INVOICES);
    this.saveBusinessProfile(INITIAL_BUSINESS_PROFILE);
  },
};
