-- CreateTable
CREATE TABLE "usuarios_autorizados" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT,
    "rol" TEXT NOT NULL DEFAULT 'usuario',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_autorizados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "fechaNacimiento" TIMESTAMP(3),
    "nacionalidad" TEXT,
    "numeroPasaporte" TEXT,
    "direccion" TEXT,
    "codigoPostal" TEXT,
    "poblacion" TEXT,
    "provincia" TEXT,
    "email" TEXT,
    "telefono" TEXT,
    "profesion" TEXT,
    "situacionActual" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias_tramites" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "icono" TEXT,
    "color" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categorias_tramites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tramites" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "tramiteConfigId" TEXT NOT NULL,
    "categoriaId" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "honorarios" DOUBLE PRECISION,
    "formaPago" TEXT,
    "suplidos" DOUBLE PRECISION DEFAULT 0,
    "driveFolderId" TEXT,
    "driveFolderPendiente" BOOLEAN NOT NULL DEFAULT false,
    "planoPago" TEXT DEFAULT 'contado',
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tramites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tramites_configuracion" (
    "id" TEXT NOT NULL,
    "tipoTramite" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoria" TEXT,
    "plantillasDisponibles" TEXT,
    "camposRequeridos" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tramites_configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasas_configuracion" (
    "id" TEXT NOT NULL,
    "tramiteConfigId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "importe" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasas_configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasas" (
    "id" TEXT NOT NULL,
    "tramiteId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "importe" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tasas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_estados" (
    "id" TEXT NOT NULL,
    "tramiteId" TEXT NOT NULL,
    "estadoAnterior" TEXT,
    "estadoNuevo" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_estados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos" (
    "id" TEXT NOT NULL,
    "tramiteId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipoDocumentoId" TEXT,
    "driveFileId" TEXT NOT NULL,
    "origen" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_documento" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "icono" TEXT,
    "color" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "categoriaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipos_documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plantillas" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "tramiteConfigId" TEXT,
    "nombre" TEXT NOT NULL,
    "driveFileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plantillas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos_generados" (
    "id" TEXT NOT NULL,
    "tramiteId" TEXT NOT NULL,
    "plantillaId" TEXT NOT NULL,
    "driveFileId" TEXT NOT NULL,
    "nombreGenerado" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documentos_generados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facturas_proforma" (
    "id" TEXT NOT NULL,
    "tramiteId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'proforma',
    "concepto" TEXT NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL,
    "precioUnitario" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "driveFileId" TEXT,
    "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaVencimiento" TIMESTAMP(3),
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facturas_proforma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vencimientos" (
    "id" TEXT NOT NULL,
    "tramiteId" TEXT NOT NULL,
    "numeroVencimiento" INTEGER NOT NULL,
    "importe" DOUBLE PRECISION NOT NULL,
    "formaPago" TEXT NOT NULL,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "pagado" BOOLEAN NOT NULL DEFAULT false,
    "fechaPago" TIMESTAMP(3),
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vencimientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "check_documentos" (
    "id" TEXT NOT NULL,
    "tramiteConfigId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "tipoVencimiento" TEXT,
    "diasCaducidad" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "check_documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_items" (
    "id" TEXT NOT NULL,
    "tramiteId" TEXT NOT NULL,
    "checkDocumentoId" TEXT NOT NULL,
    "documentoId" TEXT,
    "recibido" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_autorizados_email_key" ON "usuarios_autorizados"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_email_key" ON "clientes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_tramites_clave_key" ON "categorias_tramites"("clave");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_tramites_codigo_key" ON "categorias_tramites"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "tramites_codigo_key" ON "tramites"("codigo");

-- CreateIndex
CREATE INDEX "tramites_clienteId_idx" ON "tramites"("clienteId");

-- CreateIndex
CREATE INDEX "tramites_tramiteConfigId_idx" ON "tramites"("tramiteConfigId");

-- CreateIndex
CREATE UNIQUE INDEX "tramites_configuracion_tipoTramite_key" ON "tramites_configuracion"("tipoTramite");

-- CreateIndex
CREATE INDEX "tasas_configuracion_tramiteConfigId_idx" ON "tasas_configuracion"("tramiteConfigId");

-- CreateIndex
CREATE UNIQUE INDEX "tasas_configuracion_tramiteConfigId_nombre_key" ON "tasas_configuracion"("tramiteConfigId", "nombre");

-- CreateIndex
CREATE INDEX "historial_estados_tramiteId_idx" ON "historial_estados"("tramiteId");

-- CreateIndex
CREATE INDEX "historial_estados_createdAt_idx" ON "historial_estados"("createdAt");

-- CreateIndex
CREATE INDEX "documentos_tramiteId_idx" ON "documentos"("tramiteId");

-- CreateIndex
CREATE INDEX "documentos_tipoDocumentoId_idx" ON "documentos"("tipoDocumentoId");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_documento_nombre_key" ON "tipos_documento"("nombre");

-- CreateIndex
CREATE INDEX "tipos_documento_categoriaId_idx" ON "tipos_documento"("categoriaId");

-- CreateIndex
CREATE INDEX "plantillas_tramiteConfigId_idx" ON "plantillas"("tramiteConfigId");

-- CreateIndex
CREATE INDEX "documentos_generados_tramiteId_idx" ON "documentos_generados"("tramiteId");

-- CreateIndex
CREATE INDEX "documentos_generados_plantillaId_idx" ON "documentos_generados"("plantillaId");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_proforma_numero_key" ON "facturas_proforma"("numero");

-- CreateIndex
CREATE INDEX "vencimientos_tramiteId_idx" ON "vencimientos"("tramiteId");

-- CreateIndex
CREATE INDEX "vencimientos_pagado_idx" ON "vencimientos"("pagado");

-- CreateIndex
CREATE INDEX "check_documentos_tramiteConfigId_idx" ON "check_documentos"("tramiteConfigId");

-- CreateIndex
CREATE UNIQUE INDEX "check_documentos_tramiteConfigId_nombre_key" ON "check_documentos"("tramiteConfigId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "checklist_items_documentoId_key" ON "checklist_items"("documentoId");

-- CreateIndex
CREATE INDEX "checklist_items_tramiteId_idx" ON "checklist_items"("tramiteId");

-- CreateIndex
CREATE INDEX "checklist_items_checkDocumentoId_idx" ON "checklist_items"("checkDocumentoId");

-- AddForeignKey
ALTER TABLE "tramites" ADD CONSTRAINT "tramites_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tramites" ADD CONSTRAINT "tramites_tramiteConfigId_fkey" FOREIGN KEY ("tramiteConfigId") REFERENCES "tramites_configuracion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tramites" ADD CONSTRAINT "tramites_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias_tramites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasas_configuracion" ADD CONSTRAINT "tasas_configuracion_tramiteConfigId_fkey" FOREIGN KEY ("tramiteConfigId") REFERENCES "tramites_configuracion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasas" ADD CONSTRAINT "tasas_tramiteId_fkey" FOREIGN KEY ("tramiteId") REFERENCES "tramites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados" ADD CONSTRAINT "historial_estados_tramiteId_fkey" FOREIGN KEY ("tramiteId") REFERENCES "tramites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_tramiteId_fkey" FOREIGN KEY ("tramiteId") REFERENCES "tramites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_tipoDocumentoId_fkey" FOREIGN KEY ("tipoDocumentoId") REFERENCES "tipos_documento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tipos_documento" ADD CONSTRAINT "tipos_documento_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias_tramites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantillas" ADD CONSTRAINT "plantillas_tramiteConfigId_fkey" FOREIGN KEY ("tramiteConfigId") REFERENCES "tramites_configuracion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_generados" ADD CONSTRAINT "documentos_generados_tramiteId_fkey" FOREIGN KEY ("tramiteId") REFERENCES "tramites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_generados" ADD CONSTRAINT "documentos_generados_plantillaId_fkey" FOREIGN KEY ("plantillaId") REFERENCES "plantillas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas_proforma" ADD CONSTRAINT "facturas_proforma_tramiteId_fkey" FOREIGN KEY ("tramiteId") REFERENCES "tramites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vencimientos" ADD CONSTRAINT "vencimientos_tramiteId_fkey" FOREIGN KEY ("tramiteId") REFERENCES "tramites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_documentos" ADD CONSTRAINT "check_documentos_tramiteConfigId_fkey" FOREIGN KEY ("tramiteConfigId") REFERENCES "tramites_configuracion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_tramiteId_fkey" FOREIGN KEY ("tramiteId") REFERENCES "tramites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_checkDocumentoId_fkey" FOREIGN KEY ("checkDocumentoId") REFERENCES "check_documentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_documentoId_fkey" FOREIGN KEY ("documentoId") REFERENCES "documentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
