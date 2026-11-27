# Reglas y Arquitectura - gym-backend

## Stack y Restricciones
- Runtime: Node.js + Express (CommonJS `require`/`module.exports`).
- ORM: **Prisma 6** (`@prisma/client` v6). Prohibido usar sintaxis de Prisma 7/8 o crear `prisma.config.ts`.
- Esquema fuente de verdad: `@prisma/schema.prisma` (14 tablas, tabla `users` con `role_code`: `'ADM'`, `'TRN'`, `'CLI'`).
- Validación: **Zod** (`src/schemas/`).
- Auth: JWT en header `Authorization: Bearer <token>`. El middleware inyecta `req.user` (`{ id, email, role_code }`).

## Patrón Modular Obligatorio
Todo módulo nuevo debe respetar la estructura de `exercise`:
1. `src/schemas/<modulo>.schema.js`: Validación Zod para `body` y `params`.
2. `src/controllers/<modulo>.controller.js`: Lógica con `try/catch`, Prisma 6 y manejo de errores (`P2002` -> 409, `P2025` -> 404).
3. `src/routes/<modulo>.routes.js`: Endpoints protegidos con `auth.middleware.js` y `role.middleware.js`.
4. Registrar la ruta en `src/index.js` sin alterar `auth` ni `exercises`.

## Ahorro de Tokens
- Leer únicamente `@prisma/schema.prisma`, `@PLAN.md` y los archivos de `exercise` como plantilla. No escanear todo el proyecto.
- Editar solo las funciones necesarias sin reescribir archivos completos.