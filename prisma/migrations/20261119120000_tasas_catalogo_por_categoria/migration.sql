-- Las tasas pasan a ser un catálogo por categoría, asignable a varios trámites.

-- AlterTable: categoría de la tasa
ALTER TABLE "tasas_configuracion" ADD COLUMN "categoriaId" TEXT;

-- CreateTable
CREATE TABLE "tasas_asignadas" (
    "id" TEXT NOT NULL,
    "tasaId" TEXT NOT NULL,
    "tramiteConfigId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tasas_asignadas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tasas_asignadas_tramiteConfigId_idx" ON "tasas_asignadas"("tramiteConfigId");

-- CreateIndex
CREATE UNIQUE INDEX "tasas_asignadas_tasaId_tramiteConfigId_key" ON "tasas_asignadas"("tasaId", "tramiteConfigId");

-- CreateIndex
CREATE INDEX "tasas_configuracion_categoriaId_idx" ON "tasas_configuracion"("categoriaId");

-- AddForeignKey
ALTER TABLE "tasas_configuracion" ADD CONSTRAINT "tasas_configuracion_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias_tramites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasas_asignadas" ADD CONSTRAINT "tasas_asignadas_tasaId_fkey" FOREIGN KEY ("tasaId") REFERENCES "tasas_configuracion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasas_asignadas" ADD CONSTRAINT "tasas_asignadas_tramiteConfigId_fkey" FOREIGN KEY ("tramiteConfigId") REFERENCES "tramites_configuracion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrar datos: cada tasa existente queda asignada a su trámite actual...
INSERT INTO "tasas_asignadas" ("id", "tasaId", "tramiteConfigId", "createdAt")
SELECT gen_random_uuid()::text, t."id", t."tramiteConfigId", t."createdAt"
FROM "tasas_configuracion" t;

-- ...y su categoría es la del trámite al que pertenecía.
UPDATE "tasas_configuracion" t
SET "categoriaId" = c."id"
FROM "tramites_configuracion" tc
JOIN "categorias_tramites" c ON c."clave" = tc."categoria"
WHERE tc."id" = t."tramiteConfigId";

-- Quitar la relación antigua con un único trámite
ALTER TABLE "tasas_configuracion" DROP CONSTRAINT "tasas_configuracion_tramiteConfigId_fkey";

-- DropIndex
DROP INDEX "tasas_configuracion_tramiteConfigId_idx";

-- DropIndex
DROP INDEX "tasas_configuracion_tramiteConfigId_nombre_key";

-- AlterTable
ALTER TABLE "tasas_configuracion" DROP COLUMN "tramiteConfigId";
