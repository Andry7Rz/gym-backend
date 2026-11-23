const prisma = require('../config/prisma');
const { createExerciseSchema, updateExerciseSchema } = require('../schemas/exercise.schema');

// GET: Listar todos los ejercicios (permite filtrar por ?muscle_group=CHEST)
const getExercises = async (req, res) => {
  try {
    const { muscle_group } = req.query;

    const exercises = await prisma.exercise.findMany({
      where: muscle_group ? { muscle_group } : undefined,
      orderBy: { id: 'asc' },
    });

    res.status(200).json(exercises);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ejercicios', detalle: error.message });
  }
};

// POST: Crear un ejercicio (Solo ADM y TRN)
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
        created_by_id: req.user.id, // ID extraído del JWT del entrenador/admin
      },
    });

    res.status(201).json({
      message: 'Ejercicio creado exitosamente',
      exercise: newExercise,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear ejercicio', detalle: error.message });
  }
};

// PUT: Actualizar un ejercicio por ID (Solo ADM y TRN)
const updateExercise = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const validation = updateExerciseSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Datos inválidos',
        detalles: validation.error.issues.map((i) => i.message),
      });
    }

    const existing = await prisma.exercise.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Ejercicio no encontrado' });

    const updatedExercise = await prisma.exercise.update({
      where: { id },
      data: validation.data,
    });

    res.status(200).json({
      message: 'Ejercicio actualizado',
      exercise: updatedExercise,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar ejercicio', detalle: error.message });
  }
};

// DELETE: Eliminar un ejercicio por ID (Solo ADM y TRN)
const deleteExercise = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

    const existing = await prisma.exercise.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Ejercicio no encontrado' });

    await prisma.exercise.delete({ where: { id } });

    res.status(200).json({ message: 'Ejercicio eliminado correctamente' });
  } catch (error) {
    // Error P2003 de Prisma: el ejercicio ya está asignado a una rutina
    if (error.code === 'P2003') {
      return res.status(400).json({
        error: 'No se puede eliminar este ejercicio porque está en uso dentro de una rutina.',
      });
    }
    res.status(500).json({ error: 'Error al eliminar ejercicio', detalle: error.message });
  }
};

module.exports = { getExercises, createExercise, updateExercise, deleteExercise };