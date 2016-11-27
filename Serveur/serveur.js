var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var urlBDD = 'mongodb://localhost:27017/test';
var rand;

setInterval(function(){
	rand = Math.random();
}, 1000);  

app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Content-Type', 'text/plain');
    
	next();
});

/**
	-> Meilleur score
	-> Enregistrement score
	-> Gestion du score
	-> Gestion de la collision
*/

app.get('/', function(req, res) {
	res.end('Welcome to route 66');
});

app.get('/highscore', function(req, res) {
    /**
		Code qui revoie un tableau de JSON les 10 meilleurs scores triés selon un ordre (du plus haut au plus bas)
		Les scores sont stockés dans la base de données MongoDB
	*/
	MongoClient.connect(urlBDD, function(err, db) {
		var jsonArr = [];
		if (err) 
			throw err;
		
		console.log("Connected to Database.");	
		var collection = db.collection('test');			
		collection.find({}, {'limit':10}).sort({score: -1}).toArray(function(err, docs) {            
			docs.forEach(function(doc) {
				jsonArr.push({
					name: doc.name,
					score: doc.score
				});
			});
			  
			res.end(JSON.stringify(jsonArr));
		});
	});
});

app.get('/register', function(req, res) {
	/**
		Code qui enregistre le score dans la base de données MongoDB
		Les paramétres sont passés par l'URL
	*/
	if (req.query.name && req.query.score) {
		var entity = new Object();
		entity.name = req.query.name;
		entity.score = parseInt(req.query.score);
			
		MongoClient.connect(urlBDD, function(err, db) {
			if (err) 
				throw err;
			
			console.log("Connected to Database.");
			var collection = db.collection('test');	
			collection.insertOne(entity, function(err, r) {});
		});
			
		res.end('Added');
	}
	else {
		res.write('Error');
	}
});

app.get('/collision', function(req, res) {
	/**
		Code qui vérifie si une collision est suceptible de se produire et envoie le résultat sous format JSON
		Explication :
		Axe Y
		^
		|    V2
		| 
		| V1
		|-----------> Axe X
		
		Si la voiture V1 et V2 ont le même x0 on vérifie si la distance entre V1 et V2 est inférieur à la dimension de V1 (ici 145px)
		Si c'est le cas une collision va nécessairement se produire
	*/
	if (req.query.playerX && req.query.enemyX && req.query.enemyY) {
		var collision = 0;
		var playerY = 455;
		var playerX = parseInt(req.query.playerX);
		var enemyX = parseInt(req.query.enemyX);
		var enemyY = parseInt(req.query.enemyY);

		if (playerX == enemyX && playerY - enemyY <= 145 && enemyY <= 600)
			collision = 1;
			
		var c = new Object();
		c.collision = collision;
		res.write(JSON.stringify(c));
	}
	else {
		res.write('Error');
	}
	res.end();
});

app.get('/rand', function(req, res) {
    /**
		Code qui revoie un JSON contenant le nombre aléatoire rand
	*/
	var r = new Object();
	(rand > 0.50) ? r.rand = 0 : r.rand = 1;
	res.end(JSON.stringify(r));
});

app.get('/score', function(req, res) {
    /**
		Code qui revoie un JSON du score incrémenté de 10
	*/
	if (req.query.score) {
		var c = new Object();
		c.score = parseInt(req.query.score) + 10;
		res.end(JSON.stringify(c));
	}
});

console.log("Server is running.");
app.listen(8080);