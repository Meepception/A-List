const express = require('express');
const bodyParser = require('body-parser');
const {
  Router
} = require('express');
const user = require("./modules/user")

const server = express();
const port = (process.env.PORT || 8080);


server.set('port', port);
server.use(express.static('public'));
server.use(bodyParser.json());
// https://expressjs.com/en/guide/routing.html



server.post("/user", async function (req, res) {
  const newUser = new user(req.body.username, req.body.password);
  await newUser.create();
  res.status(200).json(newUser).end();
});



server.listen(server.get('port'), function () {
  console.log('server running', server.get('port'));
});