-- Ajustes v2 · restaurantes sem regiões (o cliente é de Belo Horizonte).
-- Os restaurantes ficam: só deixam de pertencer a uma região. A ordem, que era por região,
-- passa a ser uma só para a lista inteira (regiões na ordem antiga, depois a ordem de cada uma).

UPDATE "Restaurant" r
   SET "order" = sub.rn
  FROM (
    SELECT x.id,
           ROW_NUMBER() OVER (ORDER BY g."order", x."order", x.name) - 1 AS rn
      FROM "Restaurant" x
      JOIN "Region" g ON g.id = x."regionId"
  ) sub
 WHERE r.id = sub.id;

-- DropIndex
DROP INDEX "Restaurant_regionId_order_idx";
DROP INDEX "Restaurant_status_idx";

-- DropForeignKey
ALTER TABLE "Restaurant" DROP CONSTRAINT "Restaurant_regionId_fkey";

-- AlterTable
ALTER TABLE "Restaurant" DROP COLUMN "regionId";

-- DropTable
DROP TABLE "Region";

-- CreateIndex
CREATE INDEX "Restaurant_status_order_idx" ON "Restaurant"("status", "order");
