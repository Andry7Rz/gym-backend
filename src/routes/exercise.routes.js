const { Router } = require('express');
const { getExercises, createExercise } = require('../controllers/exercise.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = Router();

router.get('/', verifyToken, getExercises);
router.post('/', verifyToken, authorizeRoles('ADM', 'TRN'), createExercise);

module.exports = router;