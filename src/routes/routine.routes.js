const { Router } = require('express');
const { getRoutinesWithDays } = require('../controllers/routine.controller');

const router = Router();

// Cuando alguien entre a la raíz de este módulo, ejecuta getRoutinesWithDays
router.get('/', getRoutinesWithDays);

module.exports = router;