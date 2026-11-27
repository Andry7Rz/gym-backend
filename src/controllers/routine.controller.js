const prisma = require('../config/prisma');
const { createRoutineSchema, routineIdParamSchema } = require('../schemas/routine.schema');

const routineInclude = {
  users: {
    select: { id: true, first_name: true, last_name: true, email: true, role_code: true },
  },
  routine_day: {
    orderBy: { day_order: 'asc' },
    include: {
      routine_exercise: {
        orderBy: { exercise_order: 'asc' },
        include: { exercise: true },
      },
    },
  },
};

// POST /api/routines
const createRoutine = async (req, res) => {
  try {
    const validation = createRoutineSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Datos inválidos',
        detalles: validation.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
    }

    const { name, description, goal, difficulty_level, estimated_duration_weeks, days } =
      validation.data;

    const exerciseIds = [...new Set(days.flatMap((d) => d.exercises.map((e) => e.exercise_id)))];
    const found = await prisma.exercise.findMany({
      where: { id: { in: exerciseIds } },
      select: { id: true },
    });
    const foundIds = new Set(found.map((e) => e.id));
    const missing = exerciseIds.filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
      return res.status(404).json({
        error: 'Ejercicios no encontrados',
        exercise_ids: missing,
      });
    }

    const newRoutine = await prisma.routine.create({
      data: {
        trainer_id: req.user.id,
        name,
        description: description ?? null,
        goal,
        difficulty_level,
        estimated_duration_weeks: estimated_duration_weeks ?? null,
        routine_day: {
          create: days.map((day) => ({
            day_name: day.day_name,
            day_order: day.day_order,
            routine_exercise: {
              create: day.exercises.map((ex) => ({
                exercise_id: ex.exercise_id,
                exercise_order: ex.exercise_order,
                sets: ex.sets,
                min_reps: ex.min_reps ?? null,
                max_reps: ex.max_reps ?? null,
                target_weight_kg: ex.target_weight_kg ?? null,
                rest_time_seconds: ex.rest_time_seconds ?? null,
              })),
            },
          })),
        },
      },
      include: routineInclude,
    });

    res.status(201).json({ message: 'Rutina creada', routine: newRoutine });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Registro duplicado' });
    }
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'Referencia inválida (exercise_id o trainer_id)' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Registro relacionado no encontrado' });
    }
    res.status(500).json({ error: 'Error al crear rutina' });
  }
};

// GET /api/routines
const getRoutines = async (req, res) => {
  try {
    const routines = await prisma.routine.findMany({
      orderBy: { id: 'asc' },
      include: routineInclude,
    });
    res.status(200).json(routines);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener rutinas' });
  }
};

// GET /api/routines/:id
const getRoutineById = async (req, res) => {
  try {
    const params = routineIdParamSchema.safeParse(req.params);
    if (!params.success) {
      return res.status(400).json({
        error: 'ID inválido',
        detalles: params.error.issues.map((i) => i.message),
      });
    }

    const routine = await prisma.routine.findUnique({
      where: { id: params.data.id },
      include: routineInclude,
    });
    if (!routine) {
      return res.status(404).json({ error: 'Rutina no encontrada' });
    }
    res.status(200).json(routine);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Rutina no encontrada' });
    }
    res.status(500).json({ error: 'Error al obtener la rutina' });
  }
};

module.exports = { createRoutine, getRoutines, getRoutineById };
