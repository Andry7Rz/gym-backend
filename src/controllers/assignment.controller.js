const prisma = require('../config/prisma');
const { createAssignmentSchema, clientIdParamSchema } = require('../schemas/assignment.schema');

const safeUserSelect = {
  id: true,
  first_name: true,
  last_name: true,
  email: true,
  role_code: true,
};

const assignmentInclude = {
  users_routine_assignment_client_idTousers: { select: safeUserSelect },
  users_routine_assignment_trainer_idTousers: { select: safeUserSelect },
  routine: {
    include: {
      routine_day: {
        orderBy: { day_order: 'asc' },
        include: {
          routine_exercise: {
            orderBy: { exercise_order: 'asc' },
            include: { exercise: true },
          },
        },
      },
    },
  },
};

// POST /api/assignments
const createAssignment = async (req, res) => {
  try {
    const validation = createAssignmentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Datos inválidos',
        detalles: validation.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
    }

    const { routine_id, client_id, start_date, end_date } = validation.data;

    const [routine, client] = await Promise.all([
      prisma.routine.findUnique({ where: { id: routine_id }, select: { id: true } }),
      prisma.users.findUnique({ where: { id: client_id }, select: { id: true, role_code: true } }),
    ]);

    if (!routine) {
      return res.status(404).json({ error: 'Rutina no encontrada' });
    }
    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    if (client.role_code !== 'CLI') {
      return res.status(400).json({ error: 'El usuario indicado no tiene rol de cliente (CLI)' });
    }

    const newAssignment = await prisma.routine_assignment.create({
      data: {
        routine_id,
        client_id,
        trainer_id: req.user.id,
        start_date,
        end_date,
        status: 'ACTIVE',
      },
      include: assignmentInclude,
    });

    res.status(201).json({ message: 'Asignación creada', assignment: newAssignment });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Registro duplicado' });
    }
    if (error.code === 'P2003') {
      return res.status(400).json({ error: 'Referencia inválida (routine_id, client_id o trainer_id)' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Registro relacionado no encontrado' });
    }
    res.status(500).json({ error: 'Error al crear la asignación' });
  }
};

// GET /api/assignments/client/:clientId/active
const getActiveAssignmentByClient = async (req, res) => {
  try {
    const params = clientIdParamSchema.safeParse(req.params);
    if (!params.success) {
      return res.status(400).json({
        error: 'ID inválido',
        detalles: params.error.issues.map((i) => i.message),
      });
    }

    const { clientId } = params.data;

    // Anti-IDOR: un cliente solo puede ver su propia asignación
    if (req.user.role_code === 'CLI' && req.user.id !== clientId) {
      return res
        .status(403)
        .json({ error: 'Acceso denegado: solo puedes consultar tu propia asignación activa' });
    }

    const activeAssignment = await prisma.routine_assignment.findFirst({
      where: { client_id: clientId, status: 'ACTIVE' },
      orderBy: [{ start_date: 'desc' }, { id: 'desc' }],
      include: assignmentInclude,
    });

    if (!activeAssignment) {
      return res.status(404).json({ error: 'El cliente no tiene una asignación activa' });
    }
    res.status(200).json(activeAssignment);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }
    res.status(500).json({ error: 'Error al obtener la asignación activa' });
  }
};

module.exports = { createAssignment, getActiveAssignmentByClient };
