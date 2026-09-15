-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombreCompleto" TEXT NOT NULL,
    "fechaNacimiento" DATETIME,
    "nacionalidad" TEXT,
    "numeroPasaporte" TEXT,
    "direccion" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "situacionActual" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tramites" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "tipoTramite" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "honorarios" REAL,
    "formaPago" TEXT,
    "driveFolderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "tramites_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "historial_estados" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tramiteId" TEXT NOT NULL,
    "estadoAnterior" TEXT,
    "estadoNuevo" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "notas" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "historial_estados_tramiteId_fkey" FOREIGN KEY ("tramiteId") REFERENCES "tramites" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "documentos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tramiteId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipoDocumento" TEXT NOT NULL,
    "driveFileId" TEXT NOT NULL,
    "origen" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "documentos_tramiteId_fkey" FOREIGN KEY ("tramiteId") REFERENCES "tramites" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "plantillas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "tipoTramite" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "driveFileId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "documentos_generados" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tramiteId" TEXT NOT NULL,
    "plantillaId" TEXT NOT NULL,
    "driveFileId" TEXT NOT NULL,
    "nombreGenerado" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "documentos_generados_tramiteId_fkey" FOREIGN KEY ("tramiteId") REFERENCES "tramites" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "documentos_generados_plantillaId_fkey" FOREIGN KEY ("plantillaId") REFERENCES "plantillas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_numeroPasaporte_key" ON "clientes"("numeroPasaporte");

-- CreateIndex
CREATE UNIQUE INDEX "tramites_codigo_key" ON "tramites"("codigo");
