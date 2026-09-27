# Placeholders de Facturas / Invoice Placeholders

Este documento describe todos los placeholders disponibles que se pueden usar en las plantillas de Google Docs para generar facturas, mandatos y otros documentos.

## Datos del Cliente / Client Data

- `{{NOMBRE Y APELLIDOS}}` - Nombre completo en mayúsculas
- `{{TIPO, PAÍS Y NÚMERO DE DOCUMENTO}}` - Pasaporte o documento de identidad
- `{{CALLE, NÚMERO, PISO Y PORTAL}}` - Dirección completa
- `{{CÓDIGO POSTAL}}` - Código postal
- `{{POBLACIÓN}}` - Población/Ciudad
- `{{PROVINCIA}}` - Provincia/Estado
- `{{DIRECCIÓN COMPLETA}}` - Dirección formateada completa
- `{{DIRECCIÓN}}` - Solo la calle
- `{{TELÉFONO}}` - Número de teléfono
- `{{E-MAIL}}` - Correo electrónico

## Datos del Expediente / Case Data

- `{{NOMBRE DEL TRÁMITE}}` - Tipo de trámite (Residencia, Trabajo, etc.)
- `{{NÚMERO DE EXPEDIENTE}}` - Código único del expediente
- `{{FECHA}}` - Fecha actual en formato es-ES (ej: "27 de septiembre de 2026")
- `{{FORMA DE PAGO}}` - Forma de pago (Efectivo, Transferencia, etc.)
- `{{PLAN DE PAGO}}` - Plan de pago (Contado, etc.)

## Detalles de Precios / Pricing Details

### Honorarios y Servicios
- `{{IMPORTE SIN IMPUESTO}}` - Honorarios (formateado con €)
- `{{IMPORTE SIN IMPUESTO EN LETRAS}}` - Honorarios en letras
- `{{SERVICIOS ADICIONALES}}` - Total de servicios adicionales
- `{{SERVICIOS ADICIONALES EN LETRAS}}` - Servicios en letras
- `{{DETALLE SERVICIOS ADICIONALES}}` - Lista detallada de servicios
- `{{SUBTOTAL}}` - Subtotal (honorarios + servicios)
- `{{SUBTOTAL EN LETRAS}}` - Subtotal en letras

### IVA
- `{{PORCENTAJE IVA}}` - Porcentaje de IVA (0, 4, 10 o 21)
- `{{IMPORTE IVA}}` - Cantidad a pagar por IVA
- `{{IMPORTE IVA EN LETRAS}}` - IVA en letras

### Suplidos y Total
- `{{SUPLIDOS}}` - Suma de todas las tasas/suplidos
- `{{SUPLIDOS EN LETRAS}}` - Suplidos en letras
- `{{DETALLE SUPLIDOS}}` - Lista detallada de tasas individuales
- `{{TOTAL A PAGAR}}` - Total final (Subtotal + IVA + Suplidos)
- `{{TOTAL A PAGAR EN LETRAS}}` - Total en letras

## Vencimientos / Payment Installments

### Tabla de Vencimientos
- `{{TABLA_VENCIMIENTOS}}` - Tabla formateada con todos los vencimientos
- `{{DETALLE VENCIMIENTOS}}` - Detalle de vencimientos en formato texto

### Vencimientos Individuales
Para cada vencimiento (1-12), están disponibles estos placeholders:
- `{{VENCIMIENTO_1_IMPORTE}}` - Importe del vencimiento 1
- `{{VENCIMIENTO_1_IMPORTE_LETRAS}}` - Importe en letras
- `{{VENCIMIENTO_1_FORMA_PAGO}}` - Forma de pago del vencimiento
- `{{VENCIMIENTO_1_FECHA}}` - Fecha de vencimiento

(Reemplaza "1" con 2, 3, 4, etc., hasta 12)

## Ejemplos de Uso / Usage Examples

### En una factura típica:
```
FACTURA

Expediente: {{NÚMERO DE EXPEDIENTE}}
Fecha: {{FECHA}}

Cliente:
{{NOMBRE Y APELLIDOS}}
{{DIRECCIÓN COMPLETA}}
{{E-MAIL}}
{{TELÉFONO}}

DETALLE DE SERVICIOS:

Honorarios: {{IMPORTE SIN IMPUESTO}}
Servicios Adicionales: {{SERVICIOS ADICIONALES}}
Subtotal: {{SUBTOTAL}}
IVA ({{PORCENTAJE IVA}}%): {{IMPORTE IVA}}
Suplidos: {{SUPLIDOS}}
─────────────────────────────
TOTAL A PAGAR: {{TOTAL A PAGAR}}
```

### Con detalles de servicios:
```
DETALLE DE SERVICIOS:
{{DETALLE SERVICIOS ADICIONALES}}

DETALLE DE TASAS:
{{DETALLE SUPLIDOS}}

PLAN DE PAGO:
{{TABLA_VENCIMIENTOS}}
```

## Notas Importantes / Important Notes

1. **Formato de moneda**: Todos los importes se formatea automáticamente con €
2. **Separadores decimales**: Se usa coma (,) como separador decimal en el texto
3. **Mayúsculas**: El nombre del cliente se convierte a mayúsculas automáticamente
4. **Servicios**: Los servicios adicionales deben estar marcados como "añadidos" en el expediente
5. **IVA variable**: El porcentaje de IVA se configura al crear/editar el expediente
6. **Suplidos**: Se sumarizan todas las tasas individuales en el campo {{SUPLIDOS}}

## Requerimientos de Base de Datos / Database Requirements

Para que los placeholders funcionen correctamente:

- El expediente debe tener un cliente asociado
- Los honorarios deben estar especificados
- El porcentajeIVA debe estar configurado en el expediente
- Los vencimientos deben estar definidos (si se usa {{TABLA_VENCIMIENTOS}})
- Los servicios adicionales deben estar asociados al expediente (si se usa {{DETALLE SERVICIOS ADICIONALES}})
- Las tasas deben estar creadas (si se usa {{DETALLE SUPLIDOS}})
