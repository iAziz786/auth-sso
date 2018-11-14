const { Router } = require('express');

const { User } = require('../components/user/model')

const apiRouter = Router();

apiRouter.get('/data', (req, res) => {
  res.json({
    message: 'Hello!'
  });
});

apiRouter.post('/signup', async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  const user = await User.create({ email, password });

  res.json({ success: true, user });
})

module.exports = apiRouter;
