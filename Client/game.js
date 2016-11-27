var angularApp = angular.module('GameApp', []);

/**
	Gestion des touches
	Changement des coordonnées de la voiture (Player)
	37 -> Touche gauche
	39 -> Touche droite
*/
angular.element(window).on('keydown', function(e) {
	if (e.keyCode == 37)
	{
		var element = document.getElementById('player'),
		style = window.getComputedStyle(element),
		left = parseInt(style.getPropertyValue('left'));
		if (left == 250)
			left = 70;
		var ans = '' + left + 'px';
		document.getElementById('player').style.left = ans;
	}
	
	if (e.keyCode == 39)
	{
		var element = document.getElementById('player'),
		style = window.getComputedStyle(element),
		left = parseInt(style.getPropertyValue('left'));
		if (left == 70)
			left = 250;
		var ans = '' + left + 'px';
		document.getElementById('player').style.left = ans;
	}
});

/**
	Controleur de l'application
*/

angularApp.controller('GameCtrl', function ($scope, $http,$interval) {
	$scope.move = 0;
	$scope.game = 0;
	$scope.score = 0;
	$scope.begin = 0;
	$scope.rand;
	$scope.collision = 0;
	$scope.high = 0;
	$scope.highScore;
	
	/**
		Fonction qui permet de passer de la div intro à la div game (Afficher le jeu)
	*/
	$scope.play = function () {
        $scope.begin = 1;
		$scope.game = 1;
    };
	
	/**
		Fonction qui interroge le server afin d'avoir les 10 meilleurs scores
		elle permet d'afficher la div "meilleur score"
	*/
	$scope.highScore = function () {
        $scope.high = 1;
		
		$http.get("http://localhost:8080/highscore").
        success(function(data, status) {
            $scope.highScore = data;
        }).
		error(function(data, status) {
            console.log('unknown error');
        });
    };
	
	/**
		Fonction qui permet d'enregistrer son score elle envoie le nom ainsi que le score en parametre à l'URL
	*/
	$scope.registerScore = function () {
		if (document.getElementById('name').value == '')
		{
			$http.get("http://localhost:8080/register?name=No name&score=" + $scope.score).
			success(function(data, status) {
				console.log('score added successfully');
			}).
			error(function(data, status) {
				console.log(status);
			});
			$scope.begin = 0;
			$scope.game = 0;
		}
		else
		{
			$http.get("http://localhost:8080/register?name=" + document.getElementById('name').value + "&score=" + $scope.score).
			success(function(data, status) {
				console.log('score added successfully');
			}).
			error(function(data, status) {
				console.log(status);
			});
			$scope.begin = 0;
			$scope.game = 0;
		}
    };
	    
	/**
		Fonction qui récupérer le nombre aléatoire du server afin de positionner apres la voiture (droite ou gauche)
	*/
    $scope.getNumber = function () {
		$http.get("http://localhost:8080/rand").
        success(function(data, status) {
            $scope.rand = data.rand;
        }).
		error(function(data, status) {
            console.log('unknown error');
        });
	};
	
	/**
		Fonction qui consulte le server si une collision s'est produite ou non
		pour cela elle envoie trois paramétres
		Les coordonnées X et Y de l'ennemi et les coordonnées X du joueur
		Coordonnée X = 70 (gauche), X = 250 (droite)
	*/
	$scope.checkCollision = function () {
		var player = document.getElementById('player'),
		style = window.getComputedStyle(player),
		playerX = parseInt(style.getPropertyValue('left'));
		var enemy = document.getElementById('enemy'),
		style = window.getComputedStyle(enemy),
		enemyX = parseInt(style.getPropertyValue('left'));
		var enemy3 = document.getElementById('enemy'),
		style = window.getComputedStyle(enemy3),
		enemyY = parseInt(style.getPropertyValue('top'));
		
		$http.get("http://localhost:8080/collision?playerX=" + playerX + "&enemyX=" + enemyX + "&enemyY=" +enemyY).
              success(function(data, status) {
                $scope.collision = data.collision;
              }).
              error(function(data, status) {
                console.log('unknown error');
            });
		
		if ($scope.collision == 1)
		{
			var audio = new Audio('beep.mp3');
			audio.play();
			$scope.game = 0;
		}
	};
	
	/**
		Fonction qui met à jour le score et ceci en envoyant le score au serveur qui va l'incrémenter
	*/
	$scope.updateScore = function () {
		$http.get("http://localhost:8080/score?score=" + $scope.score).
        success(function(data, status) {
            $scope.score = data.score;
        }).
        error(function(data, status) {
            console.log('unknown error');
        });
	};
	
	/**
		Fonction qui génére une voiture ennemie
	*/
	$scope.generateCar = function () {
		document.getElementById('enemy').style.top = '-150px';
		if ($scope.rand == 1)
		{
			document.getElementById('enemy').style.left = '250px';
		}
		else
		{
			document.getElementById('enemy').style.left = '70px' ;
		}
	};
	
	/**
		Fonction qui translate la route vers le bas en modifiant son css
	*/
	$scope.moveRoad = function () {
		var element = document.getElementById('road'),
		style = window.getComputedStyle(element),
		top = parseInt(style.getPropertyValue('top'));
		top += 10;
		if (top >= -100)
			top = -500;
		
		document.getElementById('road').style.top = top + 'px';
	};
	
	/**
		Fonction qui translate l'ennemi vers le bas en modifiant son css
	*/
	$scope.moveEnemy = function () {
		var element = document.getElementById('enemy'),
		style = window.getComputedStyle(element),
		top = parseInt(style.getPropertyValue('top'));
		top += 10;

		document.getElementById('enemy').style.top = top + 'px';
	};
	
	/**
		Génération de l'ennemi chaque 3 secondes
	*/
	$interval(function(){
		if ($scope.game == 1)
		{
			$scope.getNumber();
			$scope.generateCar();
		}
	},1500);
	
	/**
		Défilement de l'ennemi et de la route chaque 20 ms
	*/
	$interval(function(){
		if ($scope.game == 1)
		{
			$scope.moveRoad();
			$scope.moveEnemy();
			$scope.checkCollision();
			$scope.updateScore();
		}	
	},20);
});