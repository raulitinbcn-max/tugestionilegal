-- CreateTable
CREATE TABLE "checklist_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tramiteId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "recibido" BOOLEAN NOT NULL DEFAULT 0,
    "documentoId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "checklist_items_tramiteId_fkey" FOREIGN KEY ("tramiteId") REFERENCES "tramites" ("id") ON DELETE CASCADE,
    CONSTRAINT "checklist_items_documentoId_fkey" FOREIGN KEY ("documentoId") REFERENCES "documentos" ("id") ON DELETE SET NULL
);

-- CreateIndex
CREATE INDEX "checklist_items_tramiteId_idx" ON "checklist_items"("tramiteId");
CREATE INDEX "checklist_items_documentoId_idx" ON "checklist_items"("documentoId");
