const prisma = require('../config/prisma');
const { createHistorySchema, clientIdParamSchema } = require('../schemas/history.schema');

const safeUserSelect = {
  id: true,
  first_name: true,
  last_name: true,
  email: true,
  role_code: true,
};

const historyInclude = {
  users_client_history_client_idTousers: { select: safeUserSelect },
  users_client_history_trainer_idTousers: { select: safeUserSelect },
};

// POST /api/history
const createHistory = async (req, res) => {
  try {
    const validation = createHistorySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Datos inválidos',
        detalles: validation.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
    }

    const { client_id, recorded_date, weight_kg, body_fat_percentage, client_comment, trainer_comment } =
      validation.data;

    let targetClientId;
    let trainerId;

    if (req.user.role_code === 'CLI') {
      targetClientId = req.user.id;
      trainerId = null;
    } else {
      if (client_id === undefined) {
        return res
          .status(400)
          .json({ error: 'El campo client_id es obligatorio para entrenadores y administradores' });
      }
      const client = await prisma.users.findUnique({
        where: { id: client_id },
        select: { id: true, role_code: true },
      });
      if (!client) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }
      if (client.role_code !== 'CLI') {
        return res.status(400).json({ error: 'El usuario indicado no tiene rol de cliente (CLI)' });
      }
      targetClientId = client_id;
      trainerId = req.user.id;
    }

    const newRecord = await prisma.client_history.create({
      data: {
        client_id: targetClientId,
        trainer_id: trainerId,
        recorded_date,
        weight_kg: weight_kg ?? null,
        body_fat_percentage: body_fat_percentage ?? null,
        client_comment: client_comment ?? null,
        trainer_comment: trainer_comment ?? null,
      },
      include: historyInclude,
    });

    res.status(201).json({ message: 'Registro de historial creado', history: newRecord });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Registro duplicado' });
    }
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'Referencia inválida (client_id o trainer_id)' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Registro relacionado no encontrado' });
    }
    res.status(500).json({ error: 'Error al registrar el historial físico' });
  }
};

// GET /api/history/client/:clientId
const getHistoryByClient = async (req, res) => {
  try {
    const params = clientIdParamSchema.safeParse(req.params);
    if (!params.success) {
      return res.status(400).json({
        error: 'ID inválido',
        detalles: params.error.issues.map((i) => i.message),
      });
    }

    const { clientId } = params.data;

    // Anti-IDOR: un cliente solo puede ver su propio historial
    if (req.user.role_code === 'CLI' && req.user.id !== Number(clientId)) {
      return res
        .status(403)
        .json({ error: 'Acceso denegado: solo puedes consultar tu propio historial físico' });
    }

    const history = await prisma.client_history.findMany({
      where: { client_id: clientId },
      orderBy: [{ recorded_date: 'asc' }, { id: 'asc' }],
      include: historyInclude,
    });

    res.status(200).json(history);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Historial no encontrado' });
    }
    res.status(500).json({ error: 'Error al obtener el historial físico' });
  }
};

module.exports = { createHistory, getHistoryByClient };
