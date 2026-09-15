-- AlterTable
ALTER TABLE "tramites" ADD COLUMN "planoPago" TEXT DEFAULT 'contado';
ALTER TABLE "tramites" ADD COLUMN "suplidos" REAL DEFAULT 0;

-- CreateTable
CREATE TABLE "vencimientos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tramiteId" TEXT NOT NULL,
    "numeroVencimiento" INTEGER NOT NULL,
    "importe" REAL NOT NULL,
    "formaPago" TEXT NOT NULL,
    "fechaVencimiento" DATETIME NOT NULL,
    "pagado" BOOLEAN NOT NULL DEFAULT false,
    "fechaPago" DATETIME,
    "notas" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "vencimientos_tramiteId_fkey" FOREIGN KEY ("tramiteId") REFERENCES "tramites" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
