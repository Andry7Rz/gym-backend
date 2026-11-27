const { Router } = require('express');
const { createRoutine, getRoutines, getRoutineById } = require('../controllers/routine.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = Router();

router.get('/', verifyToken, getRoutines);
router.get('/:id', verifyToken, getRoutineById);
router.post('/', verifyToken, authorizeRoles('ADM', 'TRN'), createRoutine);

module.exports = router;
