/** Categorias fixas dos produtos (enum do banco). Módulo neutro: site, painel e seed usam. */
export const PRODUCT_CATEGORIES = ['LEMBRANCINHA', 'KIT', 'BRINQUEDO_LIVRO'] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_CATEGORY_LABEL: Record<ProductCategory, string> = {
  LEMBRANCINHA: 'Lembrancinhas de festa',
  KIT: 'Kits de atividade',
  BRINQUEDO_LIVRO: 'Brinquedos e livros',
};

/** "Kits de atividade" (rótulo do JSON/canvas) → enum. */
export const productCategoryFromLabel = (label: string): ProductCategory | undefined =>
  PRODUCT_CATEGORIES.find((c) => PRODUCT_CATEGORY_LABEL[c] === label);
