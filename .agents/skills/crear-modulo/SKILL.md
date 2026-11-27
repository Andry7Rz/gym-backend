---
name: crear-modulo
description: Crea un módulo CRUD completo en gym-backend (schema Zod, controller Prisma 6, routes Express) siguiendo la estructura existente.
---

# Instrucciones para Crear un Módulo Backend

Cuando el usuario pida implementar un nuevo módulo o recurso:
1. Lee `@prisma/schema.prisma` para verificar los campos, tipos y `ENUM` exactos de las tablas involucradas.
2. Revisa `@src/controllers/exercise.controller.js`, `@src/routes/exercise.routes.js` y `@src/schemas/exercise.schema.js` como referencia de estilo, importaciones y manejo de errores.
3. Crea los tres archivos del módulo (`schema`, `controller`, `routes`) aplicando:
   - Validación de tipos y coerción numérica en Zod (`z.coerce.number()` para IDs en `req.params`).
   - Manejo de errores de Prisma (`P2002` registro duplicado -> `409`, `P2025` no encontrado -> `404`).
   - Protección de rutas con `authMiddleware` y `roleMiddleware` según el rol requerido.
4. Registra la ruta base en `@src/index.js` manteniendo el orden alfabético de importaciones y `app.use`.