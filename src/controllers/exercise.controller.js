const prisma = require('../config/prisma');

const getExercises = async (req, res) => {
  try {
    const exercises = await prisma.exercise.findMany({
      orderBy: { id: 'asc' }
    });
    res.status(200).json(exercises);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ejercicios', detalle: error.message });
  }
};

module.exports = { getExercises };