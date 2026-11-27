const { z } = require('zod');

const smallInt = z.number().int().min(1).max(32767);

const routineExerciseSchema = z
  .object({
    exercise_id: z.number().int().positive(),
    exercise_order: smallInt,
    sets: smallInt,
    min_reps: smallInt.nullable().optional(),
    max_reps: smallInt.nullable().optional(),
    target_weight_kg: z.number().min(0).max(999.99).nullable().optional(),
    rest_time_seconds: z.number().int().min(0).max(32767).nullable().optional(),
  })
  .refine(
    (ex) => ex.min_reps == null || ex.max_reps == null || ex.max_reps >= ex.min_reps,
    { message: 'max_reps debe ser mayor o igual a min_reps', path: ['max_reps'] }
  );

const hasDuplicates = (arr) => new Set(arr).size !== arr.length;

const routineDaySchema = z
  .object({
    day_name: z.string().trim().min(2).max(100),
    day_order: smallInt,
    exercises: z.array(routineExerciseSchema).min(1, 'Cada día debe tener al menos 1 ejercicio'),
  })
  .refine((day) => !hasDuplicates(day.exercises.map((e) => e.exercise_order)), {
    message: 'exercise_order duplicado dentro del día',
    path: ['exercises'],
  });

const createRoutineSchema = z
  .object({
    name: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
    description: z.string().trim().nullable().optional(),
    goal: z.enum(['HYPERTROPHY', 'STRENGTH', 'FAT_LOSS', 'HEALTH']),
    difficulty_level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
    estimated_duration_weeks: smallInt.nullable().optional(),
    days: z.array(routineDaySchema).min(1, 'La rutina debe tener al menos 1 día'),
  })
  .refine((r) => !hasDuplicates(r.days.map((d) => d.day_order)), {
    message: 'day_order duplicado en la rutina',
    path: ['days'],
  });

const routineIdParamSchema = z.object({
  id: z.coerce.number().int().positive('El ID de rutina debe ser un entero positivo'),
});

module.exports = { createRoutineSchema, routineIdParamSchema };
