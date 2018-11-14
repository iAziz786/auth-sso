const http = require('http');
const chalk = require('chalk').default;

const app = require('./app');
const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(app.get('port'), () => {
  console.log(chalk.green(`App is running on port http://localhost:${PORT}`));
});

module.exports = server;
