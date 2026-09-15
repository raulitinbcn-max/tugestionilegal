# TuGestiónLegal - Índice del Proyecto

## 📁 Estructura de Directorios Esperada

```
tugestionlegal/
├── app/
│   ├── (protected)/
│   │   ├── admin/
│   │   │   ├── page.tsx                    // Admin dashboard con tabs
│   │   │   ├── usuarios/
│   │   │   │   ├── page.tsx                // Gestión de usuarios (whitelist)
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts            // API para actualizar usuario
│   │   │   ├── tramites-config/           // Configuración de tipos de trámites
│   │   │   ├── plantillas/                // Gestión de plantillas Drive
│   │   │   ├── tasas-config/              // Configuración de tasas
│   │   │   ├── checklist/                 // Configuración de checklist
│   │   │   └── tipos-documento/           // Tipos de documentos
│   │   └── [cliente-id]/
│   │       └── tramites/
│   │           └── [tramite-id]/
│   │               └── page.tsx            // Detalle de trámite
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   │   └── route.ts                   // NextAuth.js OAuth handler
│   │   ├── admin/
│   │   │   ├── usuarios/
│   │   │   │   ├── route.ts               // GET/POST usuarios
│   │   │   │   └── [id]/route.ts          // PATCH/DELETE usuario
│   │   │   ├── tramites-config/
│   │   │   ├── plantillas/
│   │   │   ├── tasas/
│   │   │   └── checklist/
│   │   ├── tramites/
│   │   │   ├── route.ts                   // GET/POST trámites
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts               // GET/PUT trámite
│   │   │   │   ├── documentos/
│   │   │   │   ├── clasificacion/
│   │   │   │   └── tasas/
│   │   ├── clientes/
│   │   │   ├── route.ts                   // GET/POST clientes
│   │   │   └── [id]/
│   │   │       └── route.ts               // GET/PUT cliente
│   │   └── google-drive/
│   │       └── route.ts                   // Google Drive sync
│   ├── login/
│   │   └── page.tsx                       // Login con Google OAuth
│   ├── layout.tsx                         // Root layout (navbar, logout button)
│   └── page.tsx                           // Home/dashboard
├── lib/
│   ├── auth.ts                            // NextAuth configuration
│   ├── db.ts                              // Prisma client
│   └── google-drive.ts                    // Google Drive API helpers
├── components/
│   ├── navbar.tsx                         // Navbar con logout button
│   ├── sidebar.tsx                        // Sidebar navigation
│   └── ui/                                // Componentes reutilizables
├── prisma/
│   ├── schema.prisma                      // Database schema
│   └── migrations/                        // Database migrations
├── .env.local                             // Environment variables (NEVER commit)
├── package.json                           // Dependencies
├── tsconfig.json                          // TypeScript config
├── tailwind.config.js                     // Tailwind CSS config
├── next.config.js                         // Next.js config
└── README.md                              // Documentation
```

## 🗄️ Archivos Críticos

### Base de Datos
- `prisma/schema.prisma` - Definición de modelos (Cliente, Tramite, UsuarioAutorizado, etc.)

### Autenticación
- `lib/auth.ts` - Configuración NextAuth.js con Google OAuth
- `app/api/auth/[...nextauth]/route.ts` - NextAuth handler
- `app/login/page.tsx` - Página de login
- `app/layout.tsx` - Navbar con botón logout

### Admin (Whitelist)
- `app/(protected)/admin/usuarios/page.tsx` - Tabla de usuarios
- `app/api/admin/usuarios/route.ts` - GET/POST usuarios
- `app/api/admin/usuarios/[id]/route.ts` - PATCH/DELETE usuario

### API de Datos
- `app/api/tramites/route.ts` - Listar/crear trámites
- `app/api/tramites/[id]/route.ts` - Detalle trámite
- `app/api/clientes/route.ts` - Listar/crear clientes

## ⚠️ IMPORTANTE

### No Eliminar Jamás
- `prisma/schema.prisma` - Base de datos schema
- `app/api/auth/` - Autenticación
- `lib/auth.ts` - Configuración OAuth
- `.env.local` (aunque no se commit, necesario localmente)

### Datos Preservados
- Trámite types: "Arraigo", "Nacionalidad por residencia", "Cambio de nombre"
- Todos los clientes y documentos
- Configuración de tasas, plantillas y checklist

### Restricción de Usuario
**"Sobretodo no borres datos o parte de la configuración, solo cosas obsoletas"**
- Solo eliminar campos/modelos deprecated
- Preservar todos los datos reales

## 🔄 Verificación Rápida

Para verificar si el proyecto está completo:

```bash
# Debería mostrar ~15+ archivos .tsx (no solo 2)
find app -name "*.tsx" | wc -l

# Debería mostrar archivos en lib/, components/, etc.
ls -la lib/
ls -la components/
```

Si ves menos de 15 archivos o directorios faltantes, el proyecto está incompleto.

## 📝 Historial de Recuperaciones

- **2026-09-10**: Refactoring de schema completado
- **2026-09-15**: Git resets múltiples durante debugging - POTENCIAL PÉRDIDA DE CÓDIGO
  - Solución: Recuperar de GitLab o backup si es necesario

