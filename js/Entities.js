CBGame.Bomb = function(x, y, game, scene, config) {
	this.self = scene.add.sprite(x, y, 'bomb');

	this.self.wrappedBy = this;

	this.game = game;
	this.scene = scene;

	this.self.state = parseInt(config.state);
	this.timer = null;

	this.self.inputEnabled = true;
	this.self.input.enableDrag();
}

CBGame.Bomb.prototype = {
	STATE_IDLE: 0,
	STATE_ACTIVE: 1,

	BOMB_TIMER: 3000, // in milliseconds

	onCreate: function() {
		this.self.animations.add('idle', [0], 1, true);
		this.self.animations.add('active', [1, 2], 3, true);

		this.game.physics.arcade.enable(this.self);
		this.self.body.immovable = true;
		this.self.body.gravity.y = 300;
		this.self.body.center.setTo(8, 8);
		this.self.body.setSize(12, 12, 2, 8);
		this.self.body.collideWithBounds = true;
		/*this.self.body.checkCollision.left = false;
		this.self.body.checkCollision.right = false;*/
		this.self.body.bounce.y = 0.3;

		// Spawn the oneway platform of the top
		this.oneway = this.scene.oneways.create(this.self.x, this.self.y+8);
		this.oneway.name = "onewaybomb";
		this.oneway.body.setSize(12, 8);
		this.oneway.body.immovable = true;
		this.oneway.body.checkCollision.down = false;
		this.oneway.body.checkCollision.right = false;
		this.oneway.body.checkCollision.left = false;
		
		this.pauseStorage = {};
	},

	beforeUpdate: function() {

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
			if (this.timer)
				this.timer.pause();
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
				if (this.timer)
					this.timer.resume();
			}
			// Clean
			this.pauseStorage = {};
		}
	
		if (this.self.state == this.STATE_ACTIVE) {
			if (this.timer == null) {
				this.timer = this.game.time.create(true);
				this.timer.add(this.BOMB_TIMER, this.onTimer, this);
				this.timer.start();
			}
		} else {
			// Check for fire!
			var fs = this.scene.fire;
			for (var i = 0; i < fs.length; i++) {
				var f = fs.getAt(i);
				if (!f || !f.body)
					continue;
				if (this.game.physics.arcade.intersects(this.self.body, f.body)) {
					this.self.state = this.STATE_ACTIVE;
					break;
				}
			}

			// Check for explosions!
			var es = this.scene.explosions;
			for (var i = 0; i < es.length; i++) {
				var e = es.getAt(i);
				if (!e || !e.body)
					continue;
				if (this.game.physics.arcade.intersects(this.self.body, e.body)) {
					this.self.state = this.STATE_ACTIVE;
					break;
				}
			}
		}

		if (this.self.body.onFloor()) {
			this.self.body.bounce.y = 0;
		} else {
			this.self.body.bounce.y = 0.3;
		}

		this.oneway.x = this.self.x+2;
		this.oneway.y = this.self.y+8;
		
		if (this.self.body.velocity.y != 0 && this.self.body.velocity.x != 0)
			this.self.body.acceleration.x = CBGame.Utils.sign(this.self.body.velocity.x)*-1*40;
		else
			this.self.body.acceleration.x = 0;
		
		switch (this.self.state) {
			case this.STATE_IDLE:
				this.self.animations.play("idle");
				break;
			case this.STATE_ACTIVE:
				this.self.animations.play("active");
				break;
		}
	},

	onRender: function() {	

	},

	onTimer: function(a, b, c) {
		var boom = new CBGame.Explosion(this.self.x-8, this.self.y-4, this.game, this.scene);
		boom.onCreate();
		this.oneway.destroy();
		this.self.destroy();
	}
}

CBGame.Explosion = function(x, y, game, scene) {
	this.self = scene.explosions.create(x, y, 'explosion');
	this.self.wrappedBy = this;
	this.game = game;
	this.scene = scene;
};

CBGame.Explosion.prototype = {
	onCreate: function() {
		// this.self.animations.add('boom', [0,1,2,0], 15, false);
		this.self.animations.add('boom', [0,1,2,3,4,5], 15, false);
		this.self.body.immovable = true;
		this.self.body.setSize(30, 30, 1, 1);
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
		
		this.self.animations.play('boom');
	},

	onRender: function() {	

	}
}

CBGame.Door = function(x, y, game, scene) {
	this.self = scene.add.sprite(x, y, 'door');
	this.self.wrappedBy = this;
	this.game = game;
	this.scene = scene;
};

CBGame.Door.prototype = {
	CLOSED: 1,
	OPEN: 2,

	onCreate: function() {
		this.self.animations.add('closed', [0], 15, true);
		this.self.animations.add('open', [1], 15, true);
		this.self.name = "Door";
		this.game.physics.arcade.enable(this.self);
		this.self.body.immovable = true;
		this.self.body.customSeparateX = true;
		this.self.body.customSeparateY = true;
		this.self.body.setSize(20, 20, 2, 4);
		this.self.move
		this.state = this.CLOSED;
	},

	beforeUpdate: function() {

	},

	onUpdate: function() {
		switch (this.state) {
			case this.CLOSED:
				// Check for explosions!
				var es = this.scene.explosions;
				for (var i = 0; i < es.length; i++) {
					var e = es.getAt(i);
					if (!e || !e.body)
						continue;
					if (this.game.physics.arcade.intersects(this.self.body, e.body)) {
						this.onHitExplosion();
						break;
					}
				}

				this.self.animations.play('closed');
				break;
			case this.OPEN:
				this.self.animations.play('open');
				break;
		}
	},

	onRender: function() {	

	},

	onHitExplosion: function(me, explosion) {
		// Effects!
		if (this.state == this.CLOSED)
			this.state = this.OPEN;
	}
}

CBGame.Key = function(x, y, game, scene, config) {
	this.self = scene.add.sprite(x, y, 'key');

	this.self.wrappedBy = this;

	this.game = game;
	this.scene = scene;

	this.facing = this.LEFT;

	this.self.inputEnabled = true;
	this.self.input.enableDrag();
}

CBGame.Key.prototype = {
	LEFT: -1,
	RIGHT: 1,
	
	onCreate: function() {
		this.self.animations.add('right', [0], 1, true);
		this.self.animations.add('left', [1], 1, true);

		this.self.oldUpdate = this.self.update;
		this.self.update = function() {
			this.wrappedBy.onUpdate();
			this.oldUpdate();
		};
		
		this.game.physics.arcade.enable(this.self);
		this.self.body.immovable = true;
		this.self.body.gravity.y = 300;
		this.self.body.center.setTo(8, 8);
		this.self.body.setSize(14, 14, 1, 1);
		this.self.body.collideWithBounds = true;
		this.self.body.checkCollision.left = false;
		this.self.body.checkCollision.right = false;
		this.self.body.bounce.y = 0.3;

		// Spawn the oneway platform of the top
		this.oneway = this.scene.oneways.create(this.self.x, this.self.y+10);
		this.oneway.name = "onewaybomb";
		this.oneway.body.setSize(14, 4);
		this.oneway.body.immovable = true;
		this.oneway.body.checkCollision.down = false;
		this.oneway.body.checkCollision.right = false;
		this.oneway.body.checkCollision.left = false;
		
		this.pauseStorage = {};
	},

	beforeUpdate: function() {

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
		
		/*// Check for fire!
		var fs = this.scene.fire;
		for (var i = 0; i < fs.length; i++) {
			var f = fs.getAt(i);
			if (!f || !f.body)
				continue;
			if (this.game.physics.arcade.intersects(this.self.body, f.body)) {
				this.self.state = this.STATE_ACTIVE;
				break;
			}
		}*/

		// Check for explosions!
		/*var es = this.scene.explosions;
		for (var i = 0; i < es.length; i++) {
			var e = es.getAt(i);
			if (!e || !e.body)
				continue;
			if (this.game.physics.arcade.intersects(this.self.body, e.body)) {
				this.self.state = this.STATE_ACTIVE;
				break;
			}
		}*/
		
		// Check for locks
		var ls = this.scene.locks;
		for (var i = 0; i < ls.length; i++) {
			var l = ls.getAt(i);
			if (!l || !l.body)
				continue;
			if (this.game.physics.arcade.intersects(this.self.body, l.body)) {
				var fx = new CBGame.DissolveFx(l.x, l.y, this.game, this.scene);
				fx.onCreate();
				l.destroy();
				this.onOpenLock();
				break;
			}
		}

		if (this.self.body.onFloor()) {
			this.self.body.bounce.y = 0;
		} else {
			this.self.body.bounce.y = 0.3;
		}

		this.oneway.x = this.self.x + 1;
		this.oneway.y = this.self.y + 4;

		if (this.self.body.velocity.y != 0 && this.self.body.velocity.x != 0)
			this.self.body.acceleration.x = CBGame.Utils.sign(this.self.body.velocity.x)*-1*40;
		else
			this.self.body.acceleration.x = 0;
		
		if (this.facing == this.LEFT)
			this.self.animations.play("left");
		else
			this.self.animations.play("right");
	},

	onRender: function() {	

	},
	
	onOpenLock: function(lock) {
		var fx = new CBGame.DissolveFx(this.self.x, this.self.y, this.game, this.scene);
		fx.onCreate();
		this.oneway.destroy();
		this.self.destroy();
	}
}