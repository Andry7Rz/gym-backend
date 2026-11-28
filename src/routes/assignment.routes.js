const { Router } = require('express');
const {
  createAssignment,
  getActiveAssignmentByClient,
} = require('../controllers/assignment.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = Router();

router.get('/client/:clientId/active', verifyToken, getActiveAssignmentByClient);
router.post('/', verifyToken, authorizeRoles('ADM', 'TRN'), createAssignment);

module.exports = router;
