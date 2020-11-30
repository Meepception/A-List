const express = require('express');
const bodyParser = require('body-parser');

const dataHandler = require('./modules/dataHandler.js')

const server = express();
const port = (process.env.PORT || 8080);


server.set('port', port);
server.use(express.static('public'));
server.use(bodyParser.json());
// https://expressjs.com/en/guide/routing.html


server.listen(server.get('port'), function () {
  console.log('server running', server.get('port'));
});

//REST STUFF
server.post("/user", async function (req, res) {
  const newUser = new user(req.body.username, req.body.password);
  await newUser.create();
  res.status(200).json(newUser).end();
});



server.post("/todo", async function (req, res) {
  let result = await dataHandler.todoGet();
  if (result === null) {
    res.status(404).json({ msg: "No lists found" }).end();

  } else {
    res.status(200).json(result).end();
  }

});

server.post("/todo", async function (req, res) {
  let result = await dataHandler.todo(req.body.input);
  res.status(200).json(result).end();
});

server.delete("/purgeDatabase", async function (req, res) {
  await dataHandler.purge();
  res.status(200).json({ msg: "Database purged O:<" }).end();
});
