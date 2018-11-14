const { Router } = require('express');

const router = Router();

const staticRouter = require('./staticRouter');
const apiRouter = require('./apiRouter');

router.use('/', staticRouter);
router.use('/api', apiRouter);

module.exports = router;
