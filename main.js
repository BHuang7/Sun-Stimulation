
// GameBoard code below
var socket = io.connect("http://24.16.255.56:8888");
function distance(a, b) {
    var difX = a.x - b.x;
    var difY = a.y - b.y;
    return Math.sqrt(difX * difX + difY * difY);
};

function Circle(game, theElement, isFusing, cap, currEne, x, y, vX, vY) {
	this.colors = ["Red", "Green", "Blue", "Yellow", "White"];
	this.color = 3;
	this.ele = theElement;
	this.game = game;
	this.velocity = {x: 0, y:0};
	this.radius = 15;	
	if (x != undefined) {
		this.x = x;
		this.y = y;
		this.velocity.x = vX;
		this.velocity.y = vY;
		this.energyCap = cap;
		this.currentEnergy = currEne;
		var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
		if (speed > maxSpeed) {
			var ratio = maxSpeed / speed;
			this.velocity.x *= ratio;
			this.velocity.y *= ratio;
		}
		if (!isFusing) Entity.call(this, game, this.x, this.y);
		else  Entity.call(this, game, game.givenX, game.givenY);
	} else {
		this.energyCap = 10;
		this.currentEnergy = 0;
		var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
		if (speed > maxSpeed) {
			var ratio = maxSpeed / speed;
			this.velocity.x *= ratio;
			this.velocity.y *= ratio;
		}
		this.velocity = { x: Math.random() * 100, y: Math.random() * 100 };
		if (!isFusing) Entity.call(this, game, this.radius + Math.random() * (1400 - this.radius * 2), this.radius + Math.random() * (1400 - this.radius * 2));
		else  Entity.call(this, game, game.givenX, game.givenY);	
	}
}

Circle.prototype = new Entity();
Circle.prototype.constructor = Circle;


Circle.prototype.collideRight = function () {
    return this.x + this.radius > 1400;
};
Circle.prototype.collideLeft = function () {
    return this.x - this.radius < 0;
};
Circle.prototype.collideBottom = function () {
    return this.y + this.radius > 1400;
};
Circle.prototype.collideTop = function () {
    return this.y - this.radius < 0;
};

Circle.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Circle.prototype.update = function () {
    Entity.prototype.update.call(this);
    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x;
    }
    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (this != ent && this.collide(ent)) {
			var fuseElement = this.fuse();
			if (this.ele == ent.ele && fuseElement != "No Element") {
				this.game.addElement(fuseElement, this.x , this.y);
				this.removeFromWorld = true;
				ent.removeFromWorld = true;
			}
            var temp = this.velocity;
            this.velocity = ent.velocity;
            ent.velocity = temp;
        };
    };

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (this != ent) {
            var dist = distance(this, ent);
            var difX = (ent.x - this.x) / dist;
            var difY = (ent.y - this.y) / dist;
            this.velocity.x += difX / (dist * dist) * acceleration;
            this.velocity.y += difY / (dist * dist) * acceleration;

            var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
            if (speed > maxSpeed) {
                var ratio = maxSpeed / speed;
                this.velocity.x *= ratio;
                this.velocity.y *= ratio;
            };
        };
    }
	
    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;

}



Circle.prototype.draw = function (ctx) {
    ctx.beginPath();
	if (this.ele == "Hydrogen")  ctx.fillStyle = this.colors[0];
	else if (this.ele == "Helium") ctx.fillStyle = this.colors[1];
	else if (this.ele == "Oxygen") ctx.fillStyle = this.colors[2];
	else if (this.ele == "Carbon") ctx.fillStyle = this.colors[3];
	else if (this.ele == "Iron") ctx.fillStyle = this.colors[4];
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
};

Circle.prototype.fuse = function() {
	var rand = Math.random() * (this.game.random - 1) + 1;
	if (this.currentEnergy >= this.energyCap) {
		//Fused
		if (rand > this.game.random - 1) {
			if (this.ele == "Hydrogen") return "Helium";
			else if (this.ele == "Helium") return "Oxygen";
			else if (this.ele == "Oxygen") return  "Carbon";
			else if (this.ele == "Carbon") return "Iron";
		}
	}
	return "No Element";
};

var friction = 1;
var acceleration = 10000;
var maxSpeed = 2000;

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./960px-Blank_Go_board.png");
ASSET_MANAGER.queueDownload("./black.png");
ASSET_MANAGER.queueDownload("./white.png");
var gameEngine = new GameEngine();
var objectData = null;
function start(value, energy) {
	ASSET_MANAGER.downloadAll(function () {
		var canvas = document.getElementById('gameWorld');
		var ctx = canvas.getContext('2d');


		gameEngine.random = value;
		gameEngine.totalEnergy = energy;
		for (var i = 0; i < 100; i++) {
			circle = new Circle(gameEngine, "Hydrogen", false);
			gameEngine.addEntity(circle);
		};
		for (var i = 0; i < 1; i++) {
			circle = new Circle(gameEngine, "Helium", false);
			gameEngine.addEntity(circle);
		};
		
		// for (var i = 0; i < 7; i++) {
			// circle = new Circle(gameEngine, "Oxygen", false);
			// gameEngine.addEntity(circle);

		// };	

		// for (var i = 0; i < 5; i++) {
			// circle = new Circle(gameEngine, "Carbon", false);
			// gameEngine.addEntity(circle);

		// };	
		// for (var i = 0; i < 3; i++) {
			// circle = new Circle(gameEngine, "Iron", false);
			// gameEngine.addEntity(circle);
		// };	
		gameEngine.init(ctx);
		gameEngine.start();
	});
}


function saveData() {
	var eleArray  = [];
	var eneCap = [];
	var currentEne = [];
	var currX = [];
	var currY = [];
	var veloX = [];
	var veloY = [];
	for (var i = 0; i < gameEngine.entities.length; i++) {
		eleArray.push(gameEngine.entities[i].ele);
		eneCap.push(gameEngine.entities[i].energyCap);
		currentEne.push(gameEngine.entities[i].currentEnergy);
		currX.push(gameEngine.entities[i].x);
		currY.push(gameEngine.entities[i].y);
		veloX.push(gameEngine.entities[i].velocity.x);
		veloY.push(gameEngine.entities[i].velocity.y);
	}
	objectData = {elementName: eleArray, cap: eneCap, currEne: currentEne, cX: currX, cY: currY, vX: veloX, vY: veloY, totalEne: gameEngine.totalEnergy, length: currX.length};
	socket.emit("save", { studentname: "Brian Huang", statename: "firstState", data: objectData });
}

function loadData() {
    socket.emit("load", { studentname: "Brian Huang", statename: "firstState" });
}
	
	
 socket.on("load", function (objectData) {
	if (objectData.data != null) {
		for (var i = 0; i < gameEngine.entities.length; i++) {
			gameEngine.entities[i].removeFromWorld = true;
		}
		for (var j = 0; j < objectData.data.length; j++) {
			gameEngine.addEntity(new Circle(gameEngine, objectData.data.elementName[j], false, objectData.data.cap[j], objectData.data.currEne[j], objectData.data.cX[j], objectData.data.cY[j], objectData.data.vX[j], objectData.data.vY[j]));
		}
		gameEngine.totalEnergy = objectData.data.totalEne;
	}
  });