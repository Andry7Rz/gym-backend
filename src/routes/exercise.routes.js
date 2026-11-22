const { Router } = require('express');
const { getExercises } = require('../controllers/exercise.controller');

const router = Router();

router.get('/', getExercises);

module.exports = router;