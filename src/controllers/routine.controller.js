const prisma = require('../config/prisma');

const getRoutinesWithDays = async (req, res) => {
  try {
    // 👇 AQUÍ VA TU CONSULTA DE PRISMA
    const routines = await prisma.routine.findMany({
      include: {
        routine_day: {
          orderBy: { day_order: 'asc' }
        }
      }
    });

    // 👇 AQUÍ SE ENVÍA EL RESULTADO AL NAVEGADOR / POSTMAN
    res.status(200).json(routines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getRoutinesWithDays };