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


// PUT /api/exercises/:id
const updateExercise = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.exercise.update({
      where: { id: Number(id) },
      data: req.body,
    });
    res.status(200).json({ message: 'Ejercicio actualizado', exercise: updated });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Ejercicio no encontrado' });
    }
    res.status(500).json({ error: 'Error al actualizar ejercicio', detalle: error.message });
  }
};

// DELETE /api/exercises/:id
const deleteExercise = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.exercise.delete({
      where: { id: Number(id) },
    });
    res.status(200).json({ message: 'Ejercicio eliminado correctamente' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Ejercicio no encontrado' });
    }
    res.status(500).json({ error: 'Error al eliminar ejercicio', detalle: error.message });
  }
};

module.exports = { getExercises, createExercise, updateExercise, deleteExercise };