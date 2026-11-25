const prisma = require('../config/prisma');
const { createExerciseSchema } = require('../schemas/exercise.schema');

// operacion get
const getExercises = async (req, res) => {
  try {
    const exercises = await prisma.exercise.findMany({
      orderBy: { id: 'asc' },
    });
    res.status(200).json(exercises);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ejercicios' });
  }
};

// POST para ejerciciosssssss
const createExercise = async (req, res) => {
  try {
    const validation = createExerciseSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Datos inválidos',
        detalles: validation.error.issues.map((i) => i.message),
      });
    }

    const newExercise = await prisma.exercise.create({
      data: {
        ...validation.data,
        created_by_id: req.user.id,
      },
    });

    res.status(201).json({
      message: 'Ejercicio creado',
      exercise: newExercise,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear ejercicio' });
  }
};

module.exports = { getExercises, createExercise };