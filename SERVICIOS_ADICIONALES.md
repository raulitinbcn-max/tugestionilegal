# Diseño: Servicios Adicionales

## 📋 Estructura de BD (Prisma Schema)

### Modelo `ServicioAdicionalConfig` (similar a TasaConfiguracion)
```typescript
model ServicioAdicionalConfig {
  id                    String   @id @default(cuid())
  tramiteConfigId       String
  tramiteConfig         TramiteConfiguracion @relation(fields: [tramiteConfigId], references: [id], onDelete: Cascade)
  nombre                String              // "Traducción de documentos", "Legalización", etc.
  descripcion           String?
  precioBase            Float               // Precio habitual (ej: 150€)
  porcentajeIVA         Float   @default(21) // IVA (ej: 21%)
  suplicosBase          Float   @default(0)  // Suplidos propios (ej: 30€)
  documentosRequeridos  String?             // JSON: IDs de CheckDocumento requeridos
  activo                Boolean @default(true)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  serviciosAnadidos     ServicioAnadido[]
  
  @@unique([tramiteConfigId, nombre])
  @@index([tramiteConfigId])
  @@map("servicios_adicionales_config")
}

model ServicioAnadido {
  id                      String   @id @default(cuid())
  tramiteId               String
  tramite                 Tramite  @relation(fields: [tramiteId], references: [id], onDelete: Cascade)
  servicioConfigId        String
  servicioConfig          ServicioAdicionalConfig @relation(fields: [servicioConfigId], references: [id], onDelete: Cascade)
  nombre                  String              // Copia del nombre (para historial)
  precioBase              Float               // Precio final (puede ser diferente del config)
  porcentajeIVA           Float   @default(21)
  suplicosBase            Float   @default(0)
  montoIVA                Float   @default(0) // Calculado: precioBase * (porcentajeIVA / 100)
  suplicosTotales         Float   @default(0) // Suplidos propios + suplidos del tramite
  total                   Float               // Calculado: precioBase + montoIVA + suplicosTotales
  documentosRequeridos    String?             // JSON: IDs de CheckDocumento
  añadidoPor              String?             // Email del usuario que lo añadió
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt

  @@index([tramiteId])
  @@index([servicioConfigId])
  @@map("servicios_anadidos")
}
```

---

## 🔄 Flujo de Uso

### 1️⃣ CONFIGURACIÓN (Admin)
**Ubicación:** `/admin` → Nueva pestaña **"Servicios Adicionales"**

**Pantalla:**
- Tabla de servicios por tipo de trámite
- Botón "➕ Nuevo Servicio"
- Editar: nombre, descripción, precio base, % IVA, suplidos base, documentos requeridos

**Ejemplo:**
```
Trámite: Residencia
┌─────────────────────────────────────────────────────────────┐
│ Servicio                │ Precio │ IVA % │ Suplidos │ Docs  │
├─────────────────────────────────────────────────────────────┤
│ Traducción              │ 150€   │ 21%   │ 30€      │ [Doc] │
│ Legalización            │ 100€   │ 21%   │ 0€       │ [Doc] │
│ Asesoría adicional      │ 200€   │ 21%   │ 50€      │ □     │
│ Gestión bancaria        │ 80€    │ 21%   │ 0€       │ [Doc] │
└─────────────────────────────────────────────────────────────┘
```

---

### 2️⃣ AÑADIR A EXPEDIENTE
**Ubicación:** `/tramites/[id]/editar` o nuevo apartado `/tramites/[id]/servicios`

**Pantalla A: Selector de servicios**
```
Servicios Disponibles para Residencia:
☐ Traducción (150€ + 31.50€ IVA + 30€ suplidos = 211.50€)
☐ Legalización (100€ + 21€ IVA + 0€ suplidos = 121€)
☐ Asesoría adicional (200€ + 42€ IVA + 50€ suplidos = 292€)
☐ Gestión bancaria (80€ + 16.80€ IVA + 0€ suplidos = 96.80€)

[✅ Añadir seleccionados]
```

**Pantalla B: Servicios del trámite (tabla editables)**
```
┌──────────────────────────────────────────────────────────────┐
│ Servicios Adicionales del Trámite                             │
├──────────────────────────────────────────────────────────────┤
│ Servicio         │ P.Base │ IVA  │ Suplidos │ Total │ Acción │
├──────────────────────────────────────────────────────────────┤
│ Traducción       │ 150€   │ 31.5 │ 30€      │ 211.5 │ ✏️ 🗑️  │
│ Legalización     │ 100€   │ 21€  │ 0€       │ 121€  │ ✏️ 🗑️  │
├──────────────────────────────────────────────────────────────┤
│ TOTAL            │ 250€   │ 52.5 │ 30€      │ 332.5 │        │
└──────────────────────────────────────────────────────────────┘
```

---

### 3️⃣ CÁLCULOS AUTOMÁTICOS

**Al seleccionar un servicio:**
```javascript
precioBase = 150€ (del config, editable)
porcentajeIVA = 21% (del config, editable)
suplicosBase = 30€ (del config, editable)

montoIVA = precioBase * (porcentajeIVA / 100)
         = 150 * 0.21 = 31.50€

suplicosTotales = suplicosBase + suplicosTramite
                = 30€ + 0€ (suplidos generales del trámite)
                = 30€

total = precioBase + montoIVA + suplicosTotales
      = 150 + 31.50 + 30 = 211.50€
```

**Impacto en honorarios totales:**
```
Honorarios base:        500€
Servicios adicionales:  332.50€
────────────────────────────
Total a cobrar:         832.50€
```

---

## 📝 Documentos Requeridos

### Estructura JSON
```json
{
  "servicioConfigId": "srv_123abc",
  "documentosRequeridos": [
    {
      "checkDocumentoId": "chk_456def",
      "nombre": "Certificado de traducción",
      "obligatorio": true
    },
    {
      "checkDocumentoId": "chk_789ghi",
      "nombre": "Comprobante de legalización",
      "obligatorio": true
    }
  ]
}
```

### Flujo en Checklist
1. Usuario añade servicio "Traducción" al expediente
2. Sistema obtiene `documentosRequeridos` del `ServicioAdicionalConfig`
3. Sistema **crea automáticamente** nuevos `ChecklistItem` en el checklist
4. Estos items aparecen en `/tramites/[id]/checklist` con etiqueta "📌 Servicio: Traducción"

---

## 🎯 Endpoints API

### Configuración (Admin)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/servicios-adicionales-config?tramiteConfigId=xxx` | Lista servicios de un trámite |
| POST | `/api/admin/servicios-adicionales-config` | Crea nuevo servicio |
| PUT | `/api/admin/servicios-adicionales-config/[id]` | Edita servicio |
| DELETE | `/api/admin/servicios-adicionales-config/[id]` | Elimina servicio |

### Servicios del Trámite
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/servicios-anadidos?tramiteId=xxx` | Lista servicios del trámite |
| POST | `/api/servicios-anadidos` | Añade servicio a trámite |
| PUT | `/api/servicios-anadidos/[id]` | Edita servicio del trámite |
| DELETE | `/api/servicios-anadidos/[id]` | Quita servicio del trámite |

---

## 🖼️ Ubicación en UI

### Opción A: Nueva pestaña independiente (RECOMENDADO)
```
/tramites/[id]/
├── servicios-adicionales/
│   └── page.tsx
```
Similar a `/tramites/[id]/vencimientos`

### Opción B: Dentro de editar trámite
```
/tramites/[id]/editar/
  - Datos básicos (cliente, formaPago, etc.)
  - Honorarios y Suplidos
  - ➕ Servicios Adicionales (sección expandible)
```

### Opción C: En Panel lateral de trámite
En `/tramites/[id]/page.tsx`, agregar un card "Servicios Adicionales" con:
- Botón "➕ Añadir"
- Listado con resumen de totales

---

## 💡 Integración con Vencimientos

### Escenario 1: Pagos separados
Servicios con sus propios vencimientos:
```
Vencimiento 1: Honorarios = 500€
Vencimiento 2: Servicios = 332.50€
```

### Escenario 2: Pagos combinados (RECOMENDADO)
Total incluye servicios:
```
Total = Honorarios + Servicios = 832.50€
Distribuido en cuotas
```

---

## 📊 Impacto en Facturas/Recibos

Al generar un recibo/factura:
```
═══════════════════════════════════
CONCEPTO                    IMPORTE
═══════════════════════════════════
Honorarios                    500€
  - IVA (21%)                 105€
  - Suplidos                   50€
───────────────────────────────────
Servicios Adicionales:
  • Traducción                150€
    - IVA (21%)              31.50€
    - Suplidos                30€
  • Legalización             100€
    - IVA (21%)                21€
    - Suplidos                  0€
───────────────────────────────────
TOTAL A COBRAR             787.50€
═══════════════════════════════════
```

---

## ✅ Validaciones

- ✅ Servicio no se puede añadir 2 veces al mismo trámite
- ✅ precioBase > 0
- ✅ porcentajeIVA >= 0
- ✅ documentosRequeridos es un array válido
- ❌ No validar suma total (permitir ajustes manuales)

---

## 🔗 Relaciones BD

```
TramiteConfiguracion (1) ────→ (n) ServicioAdicionalConfig
                                       ↓
                          ServicioAnadido (n) ← (1) Tramite
                                       ↓
                          ChecklistItem (auto-creados)
```

---

## 🎬 Resumen de Implementación

1. **Crear modelos Prisma**: `ServicioAdicionalConfig` + `ServicioAnadido`
2. **Endpoints API**: CRUD para ambos modelos
3. **Admin UI**: Nueva pestaña en `/admin` para configurar
4. **Tramite UI**: Nueva pestaña `/tramites/[id]/servicios-adicionales` o apartado en editar
5. **Auto-checklist**: Cuando se añade un servicio, crear ChecklistItems automáticamente
6. **Facturas**: Incluir desglose de servicios en recibos

---

## 🚀 Fase 1 (MVP)
- ✅ Modelos Prisma
- ✅ Endpoints API básicos
- ✅ Admin: crear/editar servicios
- ✅ Tramite: añadir/quitar servicios
- ✅ Cálculos automáticos (IVA, total)

## 🚀 Fase 2 (Mejoras)
- ⏳ Auto-crear ChecklistItems
- ⏳ Integración con vencimientos
- ⏳ Desglose en facturas/recibos
- ⏳ Historial de cambios
