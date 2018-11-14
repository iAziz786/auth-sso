const { Router } = require('express');

const router = Router();

const apiRouter = require('./apiRouter');

router.use('/api', apiRouter);

module.exports = router;
