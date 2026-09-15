-- CreateTable
CREATE TABLE "check_documentos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipoTramite" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
