-- CreateTable
CREATE TABLE "facturas_proforma" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tramiteId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'proforma',
    "concepto" TEXT NOT NULL,
    "cantidad" REAL NOT NULL,
    "precioUnitario" REAL NOT NULL,
    "total" REAL NOT NULL,
    "driveFileId" TEXT,
    "fechaEmision" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaVencimiento" DATETIME,
    "notas" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "facturas_proforma_tramiteId_fkey" FOREIGN KEY ("tramiteId") REFERENCES "tramites" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "facturas_proforma_numero_key" ON "facturas_proforma"("numero");
