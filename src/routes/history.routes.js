const { Router } = require('express');
const { createHistory, getHistoryByClient } = require('../controllers/history.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = Router();

router.get('/client/:clientId', verifyToken, getHistoryByClient);
router.post('/', verifyToken, authorizeRoles('ADM', 'TRN', 'CLI'), createHistory);

module.exports = router;
