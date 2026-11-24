const { Router } = require('express');
const {
  getMyProfile,
  getUsers,
  updateMyUser,
  upsertRoleProfile,
} = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = Router();

// Rutas del propio usuario autenticado
router.get('/me', verifyToken, getMyProfile);
router.put('/me', verifyToken, updateMyUser);
router.put('/profile', verifyToken, upsertRoleProfile);

// Listar usuarios (Solo Administradores y Entrenadores)
router.get('/', verifyToken, authorizeRoles('ADM', 'TRN'), getUsers);

module.exports = router;