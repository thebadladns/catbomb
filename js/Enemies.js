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
	
	speed: 25,
	
	STATE_WALK: 0,
	STATE_CLIMB: 1,
	UP: -1,
	NONE: 0,
	DOWN: 1,

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
	
		if (Math.random() < 0.5)
			this.facing = this.RIGHT;
		else
			this.facing = this.LEFT;
		this.state = this.STATE_WALK;
		this.self.onLadder = false;
		this.self.currentLadder = undefined;
		this.self.climbing = this.NONE;

		// Avoid climbing just as level starts
		this.endClimb();

		this.pauseStorage = {};
		
		this.KILLME = this.game.input.keyboard.addKey(Phaser.Keyboard.K);
	},
	
	beforeUpdate: function() {
		this.self.onLadder = false;
		this.self.body.velocity.x = 0;
	},
	
	onUpdate: function() {
		if (CBGame.Data.paused) {
			// Store values if any
			if (!this.pauseStorage.body) {
				this.pauseStorage.body = {
					xvelocity: this.self.body.velocity.x,
					yvelocity: this.self.body.velocity.y,
					gravity: this.self.body.gravity.y
				};
			}
			// Pause!
			this.self.body.velocity.x = 0;
			this.self.body.velocity.y = 0;
			this.self.body.gravity.y = 0;
			// Don't move!
			this.self.animations.stop();
			// And don't bother!
			return;
		} else {
			// Restore if we have not done it yet
			if (this.pauseStorage.body) {
				this.self.body.velocity.x = this.pauseStorage.body.xvelocity;
				this.self.body.velocity.y = this.pauseStorage.body.yvelocity;
				this.self.body.gravity.y = this.pauseStorage.body.gravity;
			}
			// Clean
			this.pauseStorage = {};
		}
	
		if (this.KILLME.justPressed()) 
			this.onDeath();

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

		// Check for ladders!
		var ls = this.scene.ladders;
		for (var i = 0; i < ls.length; i++) {
			var l = ls.getAt(i);
			if (!l || !l.body)
				continue;
			if (this.game.physics.arcade.intersects(this.self.body, l.body)) {
				this.onLadder(this, l);
				break;
			}
		}

		if (this.state == this.STATE_WALK) {
			this.self.body.gravity.y = 300;

			// Do we climb that stair??
			if (this.self.onLadder && Math.random() < 0.3 && !this.justClimbed) {
				// We are up, go down
				this.state = this.STATE_CLIMB;
				if (this.self.currentLadder.y == this.self.y + this.self.height - 1) {
					this.climbing = this.DOWN;
				} else {
					this.climbing = this.UP;
				}
			}

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
		} else if (this.state == this.STATE_CLIMB) {
			this.self.body.gravity.y = 0;
			this.self.body.velocity.x = 0;
			this.self.body.velocity.y = 0;
			this.self.body.acceleration.y = 0;
			if (this.self.onLadder && this.climbing != this.NONE) {
				var ladder = this.self.currentLadder;
				if (this.climbing == this.UP) {
					if (Math.abs(this.self.currentLadder.y - 
						(this.self.y + this.self.height - 1)) <= 1) {
						this.endClimb();
					} else {
						this.self.y -= 0.5;
					}
				} else {
					if (Math.abs(ladder.y + ladder.height - 
						(this.self.y + this.self.height)) <= 1)
						this.endClimb();
					else
						this.self.y += 0.5;
				}
			} else {
				this.endClimb();
			}
		}
		

		/*if (this.self.onLadder)
			this.self.tint = 0x02d3a0;
		else
			this.self.tint = 0xffffff;*/

		this.self.animations.play(anim);
	},
	
	endClimb: function() {
		this.state = this.STATE_WALK;
		this.justClimbed = true;
		var timer = this.game.time.create(true);
		timer.add(500, this.onTimer, this);
		timer.start();
	},

	onTimer: function() {
		this.justClimbed = false;
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

	onLadder: function(me, ladder) {
		if (Math.abs(ladder.x - this.self.x) <= 1) {
			this.self.onLadder = true;
			this.self.currentLadder = ladder;
		}
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
		if (CBGame.Data.paused) {
			this.self.animations.paused = true;
		} else {
			if (this.self.animations.paused)
				this.self.animations.paused = false;
		}
	
		if (this.self.animations.currentAnim.isFinished) {
			this.self.destroy();
		}

		this.self.animations.play('dissolve');
	},

	onRender: function() {	

	}
}