-- Ajustes v3 · página de Produtos (pedido pelo WhatsApp, sem preço e sem checkout)

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('RASCUNHO', 'PUBLICADO', 'ESGOTADO');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('LEMBRANCINHA', 'KIT', 'BRINQUEDO_LIVRO');

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "icon" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageId" TEXT,
    "imageAlt" TEXT NOT NULL,
    "minQty" INTEGER NOT NULL DEFAULT 1,
    "personalizavel" BOOLEAN NOT NULL DEFAULT false,
    "nosRestaurantes" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'RASCUNHO',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_status_order_idx" ON "Product"("status", "order");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
