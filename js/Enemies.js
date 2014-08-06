CBGame.EnemyWalker = function(x, y, game, scene) {
	this.self = scene.enemies.create(x, y, 'fire');
	this.self.wrappedBy = this;
	this.game = game;
	this.scene = scene;
	
	this.self.inputEnabled = true;
	this.self.input.enableDrag();
};

CBGame.EnemyWalker.prototype = {
	LEFT: -1,
	RIGHT: 1,
	
	speed: 30,
	
	onCreate: function() {
		this.self.animations.add('left', [2, 3], 2, true);
		this.self.animations.add('walkleft', [2, 3], 4, true);
		this.self.animations.add('right', [0, 1], 2, true);
		this.self.animations.add('walkright', [0, 1], 4, true);
		this.self.name = "Enemy Walker";
		this.self.body.gravity.y = 300;
		this.self.body.center.setTo(8, 8);
		this.self.body.setSize(14, 15, 1, 1);
		this.self.body.collideWithBounds = true;
		this.self.body.customSeparateX = true;
	
		this.facing = this.RIGHT;
	},
	
	beforeUpdate: function() {
	},
	
	onUpdate: function() {
		// Walk forward until you fall
		if (this.self.body.velocity.y == 0) {
	if (this.self.body.onWall())
		this.onHitWall();
	this.self.body.velocity.x = this.facing * this.speed;
		} else {
	this.self.body.velocity.x = 0;
		}
		
		var anim = "";
		if (this.self.body.velocity.x != 0)
	anim = "walk";
		if (this.facing == this.RIGHT)
	anim += "right";
		else
	anim += "left";
	},
	
	onRender: function() {
	},
	
	onHitWall: function() {
		var that = this;
		if (that.facing == that.LEFT)
	that.facing = that.RIGHT;
		else
	that.facing = that.LEFT;
	}
};