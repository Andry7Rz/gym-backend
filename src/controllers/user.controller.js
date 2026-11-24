const prisma = require('../config/prisma');
const {
  updateUserSchema,
  upsertTrainerProfileSchema,
  upsertClientProfileSchema,
} = require('../schemas/user.schema');

// GET /api/users/me -> Ver mi propio perfil con datos extendidos
const getMyProfile = async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        role_code: true,
        first_name: true,
        last_name: true,
        email: true,
        gender: true,
        birth_date: true,
        profile_status: true,
        trainer_profile: true,
        client_profile: true,
      },
    });

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener perfil', detalle: error.message });
  }
};

// GET /api/users -> Listar usuarios (permite filtrar por ?role_code=CLI o ?role_code=TRN)
const getUsers = async (req, res) => {
  try {
    const { role_code } = req.query;

    const users = await prisma.users.findMany({
      where: role_code ? { role_code } : undefined,
      select: {
        id: true,
        role_code: true,
        first_name: true,
        last_name: true,
        email: true,
        profile_status: true,
        trainer_profile: true,
        client_profile: true,
      },
      orderBy: { id: 'asc' },
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar usuarios', detalle: error.message });
  }
};

// PUT /api/users/me -> Actualizar datos básicos del usuario logueado
const updateMyUser = async (req, res) => {
  try {
    const validation = updateUserSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Datos inválidos',
        detalles: validation.error.issues.map((i) => i.message),
      });
    }

    const updated = await prisma.users.update({
      where: { id: req.user.id },
      data: {
        ...validation.data,
        updated_at: new Date(),
      },
      select: {
        id: true,
        role_code: true,
        first_name: true,
        last_name: true,
        email: true,
        gender: true,
        updated_at: true,
      },
    });

    res.status(200).json({ message: 'Datos actualizados', user: updated });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar usuario', detalle: error.message });
  }
};

// PUT /api/users/profile -> Crear o actualizar ficha técnica (trainer_profile o client_profile)
const upsertRoleProfile = async (req, res) => {
  try {
    const { id: userId, role_code } = req.user;

    if (role_code === 'TRN') {
      const validation = upsertTrainerProfileSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: 'Datos inválidos para perfil de entrenador',
          detalles: validation.error.issues.map((i) => i.message),
        });
      }

      const profile = await prisma.trainer_profile.upsert({
        where: { user_id: userId },
        update: validation.data,
        create: { user_id: userId, ...validation.data },
      });

      return res.status(200).json({ message: 'Perfil de entrenador guardado', profile });
    }

    if (role_code === 'CLI') {
      const validation = upsertClientProfileSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: 'Datos inválidos para perfil de cliente',
          detalles: validation.error.issues.map((i) => i.message),
        });
      }

      const profile = await prisma.client_profile.upsert({
        where: { user_id: userId },
        update: validation.data,
        create: { user_id: userId, ...validation.data },
      });

      return res.status(200).json({ message: 'Perfil de cliente guardado', profile });
    }

    return res.status(400).json({ error: 'Los administradores no requieren ficha física/entrenador' });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar ficha de perfil', detalle: error.message });
  }
};

module.exports = { getMyProfile, getUsers, updateMyUser, upsertRoleProfile };