CBGame.EnemyWalker = function(x, y, game, scene) {
	this.self = scene.enemies.create(x, y, 'skeleton');
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

		this.KILLME = this.game.input.keyboard.addKey(Phaser.Keyboard.K);
	},
	
	beforeUpdate: function() {
	},
	
	onUpdate: function() {
		if (this.KILLME.justPressed()) 
			this.onDeath();

		// Walk forward until you fall
		if (this.self.body.velocity.y == 0) {
			if (this.self.body.onWall())
				this.onHitWall();
			this.self.body.velocity.x = this.facing * this.speed;
		} else {
			this.self.body.velocity.x = 0;
		}

		// Check for explosions!
		var es = this.scene.explosions;
		for (var i = 0; i < es.length; i++) {
			var e = es.getAt(i);
			if (!e || !e.body)
				continue;
			if (this.game.physics.arcade.intersects(this.self.body, e.body)) {
				this.onDeath();
				break;
			}
		}
		
		var anim = "";
		if (this.self.body.velocity.x != 0)
			anim = "walk";
		if (this.facing == this.RIGHT)
			anim += "right";
		else
			anim += "left";

		this.self.animations.play(anim);
	},
	
	onRender: function() {
	},
	
	onHitWall: function() {
		var that = this;
		if (that.facing == that.LEFT)
			that.facing = that.RIGHT;
		else
			that.facing = that.LEFT;
	},

	onDeath: function() {
		var fx = new CBGame.DissolveFx(this.self.x, this.self.y, this.game, this.scene);
		fx.onCreate();
		this.self.destroy();
	}
};

CBGame.DissolveFx = function(x, y, game, scene) {
	this.self = scene.add.sprite(x, y, 'dissolve');
	this.self.wrappedBy = this;
	this.self.oldUpdate = this.self.update;
	this.self.update = function() {
		this.wrappedBy.onUpdate();
		this.oldUpdate();
	}
	this.game = game;
	this.scene = scene;
};

CBGame.DissolveFx.prototype = {
	onCreate: function() {
		this.self.animations.add('dissolve', [0,1,2,3], 15, false);
	},

	beforeUpdate: function() {

	},

	onUpdate: function() {
		if (this.self.animations.currentAnim.isFinished) {
			this.self.destroy();
		}

		this.self.animations.play('dissolve');
	},

	onRender: function() {	

	}
}