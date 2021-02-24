const express = require('express')
const bodyParser = require('body-parser')
const dataHandler = require('./modules/datahandler')
const crypto = require('crypto');
const secret = process.env.hashSecret || require("./localenv").hashSecret;

const server = express()
const port = process.env.PORT || 8080

server.set('port', port)
server.use(express.static('public'))
server.use(bodyParser.json())
// https://expressjs.com/en/guide/routing.html

let login = false;


const authenticator = async (req, res, next) => {
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return res.append("WWW-Authenticate", 'Basic realm="User Visible Realm", charset="UTF-8"').status(401).end()
    }

    const credentials = req.headers.authorization.split(' ')[1];
    const [username, password] = Buffer.from(credentials, 'base64').toString('UTF-8').split(":");

	const hash = crypto.createHmac('sha256', secret)
                   .update(password)
                   .digest('hex');

	let passwordFromDatabase = await dataHandler.getPassword(username);

	
	if(passwordFromDatabase === hash){
		login = true;
	} else {
		login = false;
	}

    
    next();
}

//REST STUFF

server.post('/login', authenticator , (req, res)=>{
	if(login){
		console.log("Success");
		res.status(200).end();

	} else {
		console.log("Fail");
		res.status(403).end();
	}
});

server.post('/nyBruker', async (req, res)=>{

	const hash = crypto.createHmac('sha256', secret)
                   .update(req.body.password)
                   .digest('hex');


	let result = await dataHandler.insertUser(req.body.user, hash);
	res.json(result).end();
});

server.post('/createList', async (req, res) =>{
	let result = await dataHandler.createList(req.body.listeNavn, req.body.user);
	
	if(result != null){
		res.status(200).end();
	} else {
		res.status(500).end();
	}
});

server.post('/createItem', async(req, res)=>{
	let result = await dataHandler.createItem(req.body.oppgave, req.body.listeNavn, req.body.user);
	if(result != null){
		res.status(200).end();
	} else {
		res.status(500).end();
	}

});

server.get('/items', async(req, res)=>{
	let result = await dataHandler.itemGet(req.headers.listenavn, req.headers.user);
	
	if (result === null) {
	 	res.status(404).json({ msg: 'No lists found' }).end()
	 } else {
		res.status(200).json(result).end()
	 }
});

server.post('/deleteItem', async (req, res)=>{
	let result = await dataHandler.deleteItem(req.body.id);
	if (result === null) {
	 	res.status(404).json({ msg: 'Cannot delete item' }).end()
	 } else {
		res.status(200).json(result).end()
	 }

});

server.post('/deleteList', async (req, res)=>{
	let result = await dataHandler.deleteList(req.body.listenavn);
	if (result === null) {
	 	res.status(404).json({ msg: 'Cannot delete liste' }).end()
	 } else {
		res.status(200).json(result).end()
	 }
});

server.post('/updateList', async (req, res)=>{
	let result = await dataHandler.updateList(req.body.gammeltNavn, req.body.nyttNavn);
	if (result === null) {
	 	res.status(404).json({ msg: 'Cannot update list' }).end()
	 } else {
		res.status(200).json(result).end()
	 }
});

server.post('/updateItem', async (req, res)=>{
	let result = await dataHandler.updateItem(req.body.id, req.body.nyOppgave);
	if (result === null) {
	 	res.status(404).json({ msg: 'Cannot update item' }).end()
	 } else {
		res.status(200).json(result).end()
	 }
});

server.post('/updatePassword', async (req, res)=>{
	const hash = crypto.createHmac('sha256', secret)
                   .update(req.body.password)
                   .digest('hex');

	let result = await dataHandler.updatePassword(req.body.username, hash);
	if (result === null) {
	 	res.status(404).json({ msg: 'Cannot update password' }).end()
	 } else {
		res.status(200).json(result).end()
	 }
});

server.post('/deleteUser', async (req, res)=>{
	let result = await dataHandler.deleteUser(req.body.username);
	if (result === null) {
	 	res.status(404).json({ msg: 'No lists found' }).end()
	 } else {
		res.status(200).json(result).end()
	 }
});

server.get('/todo', async function (req, res) {
	let result = await dataHandler.todoGet(req.headers.user)
	if (result === null) {
	 	res.status(404).json({ msg: 'No lists found' }).end()
	 } else {
		res.status(200).json(result).end()
	 }
})

server.post('/todo', async function (req, res) {
	let result = await dataHandler.todo(req.body.input)
	res.status(200).json(result).end()
})

server.delete('/purgeDatabase', async function (req, res) {
	await dataHandler.purge()
	res.status(200).json({ msg: 'Database purged O:<' }).end()
})

server.listen(process.env.PORT || 8080, function () {
	console.log('server running', server.get('port'))
})