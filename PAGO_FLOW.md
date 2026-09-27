# Flujo de Pagos y Vencimientos en TuGestiónLegal

## 📊 Estructura de Base de Datos

### Modelo `Tramite`
```typescript
- id: String (PK)
- codigo: String
- clienteId: String (FK → Cliente)
- tramiteConfigId: String (FK → TramiteConfiguracion)
- honorarios: Float (cantidad base del servicio)
- suplidos: Float (gastos extras)
- formaPago: String ("Efectivo", "Transferencia", "Tarjeta", "Cheque")
- planoPago: String (DEFAULT: "contado", puede ser "Fraccionado")
- estado: String (DEFAULT: "pendiente")
```

### Modelo `Vencimiento`
```typescript
- id: String (PK)
- tramiteId: String (FK → Tramite, CASCADE)
- numeroVencimiento: Int (1, 2, 3, etc.)
- importe: Float (cantidad a pagar en esta cuota)
- formaPago: String (método de pago específico)
- fechaVencimiento: DateTime
- pagado: Boolean (DEFAULT: false)
- fechaPago: DateTime | null (cuándo se pagó realmente)
- notas: String | null
```

### Modelo `FacturaProforma`
```typescript
- id: String (PK)
- tramiteId: String (FK → Tramite, CASCADE)
- numero: String (UNIQUE, ej: "FAC-2024-001")
- estado: String ("proforma", "facturada", "pagada")
- concepto: String
- cantidad: Float
- precioUnitario: Float
- total: Float (calculado: cantidad × precioUnitario)
- driveFileId: String (link al Google Doc generado)
- fechaEmision: DateTime
- fechaVencimiento: DateTime | null
- notas: String | null
```

---

## 🔄 Flujo Completo de Pagos

### 1️⃣ CREAR TRÁMITE
**Ubicación:** `/tramites/nuevo`

- Usuario crea un trámite con:
  - `honorarios` (ej: 500€)
  - `suplidos` (ej: 50€)
  - `formaPago` (ej: "Transferencia")
  
- **BD:** Se crea registro en tabla `tramites` con `planoPago = "contado"` (por defecto)
- **Estado:** Trámite creado, pero SIN vencimientos aún

---

### 2️⃣ DEFINIR VENCIMIENTOS
**Ubicación:** `/tramites/[id]/vencimientos`

**Paso A: Generar automático**
```
1. Usuario define "número de cuotas" (1-12)
2. Sistema calcula: importePorCuota = (honorarios + suplidos) / numCuotas
3. Sistema genera fecha automática: cada cuota vence 1 mes después de la anterior
4. Ejemplo:
   - Cuota 1: 275€ vence 01/11/2024
   - Cuota 2: 275€ vence 01/12/2024
```

**Paso B: Editar manualmente (modo tabla)**
```
- Usuario puede cambiar:
  - Importe de cada cuota
  - Forma de pago individual
  - Fecha de vencimiento
  - Marcar como "pagado" inmediatamente
  - Añadir notas
```

**Paso C: Guardar al BD**
```
POST /api/vencimientos
- Borra todos los vencimientos anteriores del trámite
- Crea nuevos registros en tabla `vencimientos`
- Actualiza `planoPago` automáticamente:
  - 1 vencimiento → "Contado"
  - 2+ vencimientos → "Fraccionado"
```

---

### 3️⃣ REGISTRAR PAGOS
**Ubicación:** `/registrar-pagos`

**Paso A: Listar vencimientos pendientes**
```
GET /api/vencimientos
- Retorna TODOS los vencimientos de TODOS los trámites
- Incluye info del cliente y código del trámite
- Ordena por fechaVencimiento ascendente
- Calcula estado:
  - Pagado: ✅
  - Vencido y pendiente: ⚠️ (fecha < hoy)
  - Pendiente: ⏳
```

**Paso B: Editar vencimiento individual**
```
Usuario hace clic en "✏️ Editar":
1. Modal abre con campos:
   - ☑️ Marcado como pagado (checkbox)
   - 📅 Fecha de pago (date picker)
   - 💳 Forma de pago (dropdown)
   - 💰 Importe (number input)
   - 📝 Notas (textarea)

2. Si marca "pagado" = true:
   - Aparecen campos de Fecha Pago, Forma Pago, Importe
   - Botón "🧾 Recibo" se activa
```

**Paso C: Guardar cambios**
```
PUT /api/vencimientos/[id]
Actualiza en BD:
- pagado: Boolean
- fechaPago: DateTime | null
- formaPago: String
- importe: Float
- notas: String
```

---

### 4️⃣ GENERAR RECIBOS
**Ubicación:** En `/registrar-pagos` o `/tramites/[id]/vencimientos`

**Opción A: Recibo existente**
```
GET /api/vencimientos/[id]/recibo-existente
- Busca si ya existe un recibo para este vencimiento
- Si existe: abre el Google Doc para editar
- Si no existe: genera uno nuevo
```

**Opción B: Generar nuevo recibo**
```
POST /api/vencimientos/[id]/generar-recibo
1. Busca plantilla de "recibo" en BD
2. Copia la plantilla de Google Docs
3. Rellena datos:
   - Número de vencimiento
   - Cliente
   - Importe
   - Fecha
   - Concepto
4. Guarda el Doc generado en Google Drive
5. Retorna driveFileId y abre en nueva pestaña
```

---

## 🗂️ Endpoints API

### **Vencimientos**
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/vencimientos` | Lista todos (con tramite.cliente) o solo los de un tramiteId |
| POST | `/api/vencimientos` | Crea múltiples vencimientos para un trámite |
| PUT | `/api/vencimientos/[id]` | Actualiza estado de pago de un vencimiento |
| GET | `/api/vencimientos/[id]/recibo-existente` | Busca recibo generado |
| POST | `/api/vencimientos/[id]/generar-recibo` | Genera recibo en Google Docs |

### **Trámites (relacionado)**
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/tramites/[id]` | Obtiene honorarios, suplidos, formaPago, planoPago |
| PUT | `/api/tramites/[id]` | Actualiza planoPago automáticamente |

---

## 📱 Ventanas/Componentes

### **1. `/tramites/[id]/page.tsx`**
- Muestra resumen del trámite
- Botón "Gestionar Vencimientos" → va a `/tramites/[id]/vencimientos`
- Muestra `planoPago` (Contado/Fraccionado)

### **2. `/tramites/[id]/vencimientos/page.tsx`**
- **Generador:** Input para número de cuotas + botón "Generar"
- **Visor:** Tabla o cards mostrando vencimientos
- **Editor:** Modo tabla con inputs editables
- **Guardar:** POST a `/api/vencimientos`

### **3. `/registrar-pagos/page.tsx`**
- **Filtros:** Pendientes / Todos
- **Listado:** Cards de cada vencimiento
- **Edición:** Modal inline para marcar como pagado
- **Recibos:** Botón "🧾 Recibo" cuando pagado=true
- **Alertas:** Muestra pagos vencidos en rojo

---

## 🔗 Relaciones BD

```
Cliente (1) ────→ (n) Tramite
                    ├─→ (n) Vencimiento
                    ├─→ (n) FacturaProforma
                    └─→ (n) DocumentoGenerado
                         └─→ Plantilla
                              └─→ Tipo "recibo"
```

---

## 💡 Lógica de Cálculos

### **Total a cobrar:**
```
Total = honorarios + suplidos
```

### **Importe por cuota (distribución uniforme):**
```
importePorCuota = Math.round((total / numCuotas) * 100) / 100
```
*Nota: Se redondea a 2 decimales para evitar errores de floating point*

### **Fechas de vencimiento (automáticas):**
```
Para cuota i (1-based):
- fecha = hoy + (i-1) meses
Ejemplo:
  - Cuota 1: hoy
  - Cuota 2: hoy + 1 mes
  - Cuota 3: hoy + 2 meses
```

### **Estado de pago:**
```
Si pagado = false y fechaVencimiento < hoy:
  → Estado = "Vencido"
Si pagado = false y fechaVencimiento >= hoy:
  → Estado = "Pendiente"
Si pagado = true:
  → Estado = "Pagado" (color verde)
```

---

## ⚠️ Casos Especiales

### **Cambiar número de cuotas**
- Usuario vuelve a `/tramites/[id]/vencimientos`
- Sistema muestra vencimientos ACTUALES
- Usuario cambia número y regenera
- **Resultado:** Borra viejos, crea nuevos

### **Editar vencimiento individual**
- En modo tabla de `/tramites/[id]/vencimientos`
- Cambios se reflejan en UI localmente
- Al hacer "Guardar Vencimientos" → POST a BD
- Si hay desajustes de total: sistema NO valida, permite guardar como está

### **Pago parcial**
- Usuario edita el importe de un vencimiento
- Ejemplo: vencimiento de 275€ → lo marca como 200€ y pagado
- Sistema permite: no hay validación de total

### **Múltiples formas de pago**
- Cada vencimiento puede tener forma diferente
- Ejemplo: Venc 1 = Transferencia, Venc 2 = Cheque, Venc 3 = Efectivo

---

## 🎯 Resumen de Flujo

```
1. CREAR TRÁMITE (honorarios + suplidos)
   ↓
2. DEFINIR VENCIMIENTOS (generar o editar)
   ↓
3. GUARDAR VENCIMIENTOS (POST /api/vencimientos)
   ↓
4. VER EN REGISTRAR PAGOS (GET /api/vencimientos)
   ↓
5. REGISTRAR PAGO (PUT /api/vencimientos/[id])
   ├→ Marcar pagado=true
   ├→ Establecer fechaPago
   └→ Elegir formaPago e importe
   ↓
6. GENERAR RECIBO (POST /api/vencimientos/[id]/generar-recibo)
   └→ Copia plantilla + rellena datos + genera Google Doc
```

---

## 🔍 Validaciones

**Actuales (lo que SÍ valida):**
- ✅ tramiteId requerido
- ✅ Array de vencimientos requerido
- ✅ Fechas deben ser DateTime válidas
- ✅ Importes deben ser Float

**Faltantes (lo que NO valida):**
- ❌ Suma de vencimientos = Total (honorarios + suplidos)
- ❌ Importes > 0
- ❌ Fechas futuras
- ❌ Sin vencimientos duplicados
