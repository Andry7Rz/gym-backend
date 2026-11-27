# Plan Maestro de Lógica Backend - Gym Management API

## Estado Actual (Completado)
- `auth` (`/api/auth`): Registro y login con `users` (`role_code`: `ADM`, `TRN`, `CLI`), `bcryptjs` y JWT.
- `exercise` (`/api/exercises`): CRUD de catálogo de ejercicios.

---

## BLOQUE 1: ANDRY (Rama `feat/andry`)
Responsabilidad: Diseño de rutinas, asignación a clientes, evolución antropométrica y asistente IA.

### Módulo 1A: Rutinas (`src/*/routine.*` -> `/api/routines`)
- **Tablas:** `routine`, `routine_day`, `routine_exercise`.
- **POST `/api/routines` (Solo `TRN`, `ADM`):**
  - Lógica: Crear en una sola petición la rutina completa usando escritura anidada de Prisma (`routine` -> `routine_day` -> `routine_exercise`).
  - Payload esperado: `{ name, description, goal, difficulty_level, estimated_duration_weeks, days: [{ day_name, day_order, exercises: [{ exercise_id, exercise_order, sets, min_reps, max_reps, target_weight_kg, rest_time_seconds }] }] }`.
  - Validación: `trainer_id` se toma de `req.user.id`. Al menos 1 día y 1 ejercicio por día.
- **GET `/api/routines` (Autenticado):**
  - Lógica: Listar rutinas incluyendo días (`orderBy: { day_order: 'asc' }`) y ejercicios con su nombre (`include: { exercise: true }`).
- **GET `/api/routines/:id` (Autenticado):**
  - Lógica: Detalle completo de una rutina específica. Si no existe, devolver `404`.

### Módulo 1B: Asignaciones (`src/*/assignment.*` -> `/api/assignments`)
- **Tablas:** `routine_assignment`.
- **POST `/api/assignments` (Solo `TRN`, `ADM`):**
  - Lógica: Asignar una `routine_id` a un `client_id` (`trainer_id = req.user.id`).
  - Validación: Verificar que el `client_id` exista y tenga `role_code === 'CLI'`. Validar que `end_date > start_date`.
- **GET `/api/assignments/client/:clientId/active` (Autenticado):**
  - Lógica: Devuelve la rutina con `status: 'ACTIVE'` del cliente, incluyendo `routine` -> `routine_day` (ordenados por `day_order`) -> `routine_exercise` (ordenados por `exercise_order`) -> `exercise`.
  - Seguridad (Anti-IDOR): Si `req.user.role_code === 'CLI'`, validar que `req.user.id === Number(clientId)` (si no, `403`).

### Módulo 1C: Historial Físico (`src/*/history.*` -> `/api/history`)
- **Tablas:** `client_history`.
- **POST `/api/history` (`CLI`, `TRN`, `ADM`):**
  - Lógica: Registra medición (`client_id`, `trainer_id` opcional, `recorded_date`, `weight_kg`, `body_fat_percentage`, `client_comment`, `trainer_comment`). Si crea un `CLI`, `client_id = req.user.id`.
- **GET `/api/history/client/:clientId` (Autenticado):**
  - Lógica: Lista registros ordenados por `recorded_date: 'asc'` para graficar evolución. Aplicar validación anti-IDOR si es `CLI`.

### Módulo 1D: Asistente IA (`src/*/ai.*` -> `/api/ai`)
- **Tablas:** `ai_history`.
- **POST `/api/ai/consult` (Autenticado):**
  - Lógica: Recibe `{ request_type, prompt_sent }` (donde `request_type` es `GENERATE_ROUTINE`, `LOAD_RECOMMENDATION` o `GENERAL_INQUIRY`). Genera respuesta (conectado a API externa o respuesta estructurada de respaldo) y guarda el registro en `ai_history` con `user_id = req.user.id`.
- **GET `/api/ai/history` (Autenticado):**
  - Lógica: Devuelve el historial de consultas del usuario autenticado (`where: { user_id: req.user.id }`, `orderBy: { created_at: 'desc' }`).

---

## BLOQUE 2: COMPAÑERO (Rama `feat/companero`)
Responsabilidad: Perfiles por rol, vinculación entrenador-cliente y registro diario de entrenamientos.

### Módulo 2A: Perfiles y Vinculación (`src/*/profile.*` y `src/*/trainerClient.*`)
- **Tablas:** `trainer_profile`, `client_profile`, `trainer_client`.
- **POST `/api/profiles/trainer` (Solo `TRN`):** Crea perfil de entrenador usando `user_id = req.user.id` (`specialty`, `biography`, `years_experience`, `phone`). Capturar `P2002` (`409` si ya tiene perfil).
- **POST `/api/profiles/client` (Solo `CLI`):** Crea perfil de cliente usando `user_id = req.user.id` (`height`, `initial_body_fat_percentage`, `primary_goal`, `experience_level`, `medical_condition`).
- **GET `/api/profiles/me` (Autenticado):** Devuelve los datos de `users` (sin `password_hash`) incluyendo `trainer_profile` o `client_profile`.
- **POST `/api/trainer-client` (Solo `TRN`, `ADM`):** Vincula `trainer_id` con `client_id`. Validar que ambos existan con sus roles correspondientes (`TRN` y `CLI`).
- **GET `/api/trainer-client/my-clients` (Solo `TRN`):** Lista clientes activos del entrenador autenticado.

### Módulo 2B: Sesiones y Series (`src/*/session.*` -> `/api/sessions`)
- **Tablas:** `workout_session`, `set_record`.
- **POST `/api/sessions` (Solo `CLI`):**
  - Lógica crítica: Usar `prisma.$transaction` (o escritura anidada) para guardar la cabecera de `workout_session` (`assignment_id`, `routine_day_id`, `client_id: req.user.id`, `session_date`, `perceived_exertion` 1-10, `notes`) junto con el arreglo `sets` en `set_record` (`routine_exercise_id`, `set_number`, `reps_performed`, `weight_kg`, `completed`). Si falla una serie, revierte toda la sesión.
- **GET `/api/sessions/client/:clientId` (Autenticado):**
  - Lógica: Historial de sesiones del cliente con el detalle de `set_record` y ejercicio realizado. Validar anti-IDOR si `req.user.role_code === 'CLI'`.