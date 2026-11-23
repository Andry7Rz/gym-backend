const { Router } = require('express');
const {
  getExercises,
  createExercise,
  updateExercise,
  deleteExercise,
} = require('../controllers/exercise.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = Router();

// Cualquier usuario autenticado (ADM, TRN o CLI) puede ver los ejercicios
router.get('/', verifyToken, getExercises);

// Solo Administradores y Entrenadores pueden crear, editar o eliminar ejercicios
router.post('/', verifyToken, authorizeRoles('ADM', 'TRN'), createExercise);
router.put('/:id', verifyToken, authorizeRoles('ADM', 'TRN'), updateExercise);
router.delete('/:id', verifyToken, authorizeRoles('ADM', 'TRN'), deleteExercise);

module.exports = router;