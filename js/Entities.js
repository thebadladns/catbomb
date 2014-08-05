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
        this.self.body.checkCollision.left = false;
        this.self.body.checkCollision.right = false;
        this.self.body.bounce.y = 0.2;
	},

	beforeUpdate: function() {

	},

	onUpdate: function() {

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
		this.self.animations.add('boom', [0,1,2,0], 15, false);
        this.self.body.immovable = true;
        this.self.body.setSize(30, 30, 1, 1);
	},

	beforeUpdate: function() {

	},

	onUpdate: function() {
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