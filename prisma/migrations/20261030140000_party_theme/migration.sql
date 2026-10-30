-- Ajustes v2 · temas de festa (página Festas e aniversários)

-- CreateTable
CREATE TABLE "PartyTheme" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT[],
    "imageId" TEXT,
    "imageAlt" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL,
    "status" "PublishStatus" NOT NULL DEFAULT 'RASCUNHO',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartyTheme_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PartyTheme_slug_key" ON "PartyTheme"("slug");

-- CreateIndex
CREATE INDEX "PartyTheme_status_order_idx" ON "PartyTheme"("status", "order");

-- AddForeignKey
ALTER TABLE "PartyTheme" ADD CONSTRAINT "PartyTheme_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
