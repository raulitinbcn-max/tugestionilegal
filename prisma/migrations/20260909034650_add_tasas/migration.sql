-- CreateTable
CREATE TABLE "tasas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tramiteId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "importe" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tasas_tramiteId_fkey" FOREIGN KEY ("tramiteId") REFERENCES "tramites" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
