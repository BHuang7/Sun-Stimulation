
// GameBoard code below

function distance(a, b) {
    var difX = a.x - b.x;
    var difY = a.y - b.y;
    return Math.sqrt(difX * difX + difY * difY);
};

function Circle(game, theElement, isFusing) {
	this.ele = theElement;
	this.game = game;
	this.energyCap = 10;
	this.currentEnergy = 0;
    this.radius = 15;
    this.colors = ["Red", "Green", "Blue", "Yellow", "White"];
    this.color = 3;
	if (!isFusing) Entity.call(this, game, this.radius + Math.random() * (1400 - this.radius * 2), this.radius + Math.random() * (1400 - this.radius * 2));
	else  Entity.call(this, game, game.givenX, game.givenY);
    this.velocity = { x: Math.random() * 100, y: Math.random() * 100 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    };
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

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
ASSET_MANAGER.queueDownload("./img/black.png");
ASSET_MANAGER.queueDownload("./img/white.png");

function start(value, energy) {
	ASSET_MANAGER.downloadAll(function () {
		var canvas = document.getElementById('gameWorld');
		var ctx = canvas.getContext('2d');

		var gameEngine = new GameEngine();
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
// submitMe(3000);