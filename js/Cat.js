// Player class

CBGame.Cat = function(x, y, game, world) {
	this.self = world.add.sprite(x, y, 'cat');
	
	// Ha ha hacking to get an onPostUpdate event
	this.self.wrappedBy = this;
	this.self.oldPostUpdate = this.self.postUpdate;
	this.self.postUpdate = function() {
		this.oldPostUpdate();
		this.wrappedBy.afterUpdate();
	};

	this.game = game;
	this.world = world;

	this.cursors = game.input.keyboard.createCursorKeys();
	this.A = game.input.keyboard.addKey(Phaser.Keyboard.A);
	this.B = game.input.keyboard.addKey(Phaser.Keyboard.S);
}

CBGame.Cat.prototype = {
	RIGHT: 1,
	LEFT: -1,

	TYPE_NONE: 0,
	TYPE_BOMB: 1,
	TYPE_KEY: 2,

	onCreate: function() {
		this.self.animations.add('left', [2, 3], 6, true);
        this.self.animations.add('right', [0, 1], 6, true);

        this.game.physics.arcade.enable(this.self);
        this.self.body.gravity.y = 300;
        this.self.body.center.setTo(8, 8);
        this.self.body.setSize(14, 15, 1, 1);
        this.self.body.collideWithBounds = true;

        this.world.camera.follow(this.self,  Phaser.Camera.PLATFORMER);

        this.facing = this.RIGHT;
        this.carrying = {
        	type: this.TYPE_NONE,
        	reference: null
        }
	},

	beforeUpdate: function() {
		this.self.onLadder = false;
		this.self.body.velocity.x = 0;
		/*if (this.carrying.type != this.TYPE_NONE) {
			this.carrying.reference.body.velocity.x = 0;
		}*/
	},

	onUpdate: function() {

		document.getElementById('label').textContent = this.facing;

		/*if (this.self.onLadder)
			this.self.tint = 0x9a058c;
		else
			this.self.tint = 0xffffff;*/

		if (!this.self.climbing && this.self.body.velocity.y == 0) {
			if (cursors.left.isDown) {
				this.self.body.velocity.x = -60;
				this.self.animations.play('left');
				this.facing = this.LEFT;
			} else if (cursors.right.isDown) {
				this.self.body.velocity.x = 60;
				this.self.animations.play('right');
				this.facing = this.RIGHT;
			} else {
				this.self.animations.stop();
			}
		}

		if (this.B.justPressed(1)) {
			// Pick up
			if (this.carrying.type == this.TYPE_NONE) {
				var carryData = this.checkForBomb(); // Checkforpickable
				if (carryData.type != this.TYPE_NONE) {
					// Got anything
					// Make it portable
					var bomb = carryData.reference;
					bomb.body.immovable = false;
					bomb.body.gravity.y = 0;
					// Lift it
					bomb.oldz = bomb.z;
					bomb.z = this.self.z+1;
					// And remember you got it
					this.carrying.type = carryData.type;
					this.carrying.reference = carryData.reference; 
				}
			} 
			// Drop down
			else {
				// Drop what you got
				// Make it solid
				var bomb = this.carrying.reference;
				bomb.body.immovable = true;
				bomb.body.gravity.y = 300;
				// Drop it
				bomb.z = bomb.oldz;
				bomb.y += 4;
				if (this.facing == this.LEFT) {
					if (this.self.body.onWall()) {
						bomb.x = this.self.x;
						this.self.x += 16;
					} else {
						bomb.x = this.self.x - 16;
					}
				} else if (this.facing == this.RIGHT) {
					if (this.self.body.onWall()) {
						bomb.x = this.self.x;
						this.self.x -= 16;
					} else {
						bomb.x = this.self.x + 16;
					}
				}
				// And forget you got it
				this.carrying.type = this.TYPE_NONE;
				this.carrying.reference = null; 
			}
		}

		if (!this.self.onLadder) {
			this.self.body.gravity.y = 300;
			this.self.climbing = false;
		} else if (this.self.onLadder && cursors.up.isDown) {
			this.self.x = this.self.currentLadder.x;
			this.self.y -= 1;
			this.self.body.gravity.y = 0;
			this.self.climbing = true;
		} else if (this.self.onLadder && cursors.down.isDown) {
			if (!this.checkForFloor()) {
				this.self.y += 1;
				this.self.body.gravity.y = 0;
				this.self.x = this.self.currentLadder.x;
				this.self.climbing = true;
			} else {
				this.self.climbing = false;
			}
		}
	},

	afterUpdate: function() {
		if (this.carrying.type != this.TYPE_NONE) {
			var bomb = this.carrying.reference;
			// Lift it
			bomb.y = this.self.y - 8;
			if (this.facing == this.LEFT) {
				bomb.x = this.self.x - 8;
			} else if (this.facing == this.RIGHT) {
				bomb.x = this.self.x + 8;
			}
		}
	},

	onRender: function() {
		this.game.debug.body(this.self);
	},

	onLadder: function(me, ladder) {
		if (Math.abs(ladder.x + ladder.body.offset.x - (this.self.x + this.self.width/2)) < 2) {
			this.self.onLadder = true;
			this.self.currentLadder = ladder;
		}
	},

	checkForFloor: function() {
		var ladder = this.self.currentLadder;
		if (ladder) {
			return !ladder.body.hitTest(
				ladder.x + ladder.body.offset.x,
				this.self.y + this.self.height + 1
			);
		}

		return true;
	},

	checkForBomb: function() {
		var result = {
			type: this.TYPE_NONE,
			reference: null
		};

		var testx = this.self.body.x;
		if (this.facing == this.LEFT) {
			testx -= 1;
		} else if (this.facing == this.RIGHT) {
			testx += 1;
		}

		// Move the body temprarily to check for bombs!
		var oldx = this.self.body.x;
		this.self.body.x = testx;

		var bombs = this.world.bombs;
		for (var i = 0; i < bombs.length; i++) {
			var bomb = bombs.getAt(i);
			if (!bomb || !bomb.body)
				continue;
			if (this.game.physics.arcade.intersects(this.self.body, bomb.body)) {
				result.type = this.TYPE_BOMB;
				result.reference = bomb;
				break;
			}
		}

		this.self.body.x = oldx;

		return result;
	}
}

CBGame.Bomb = function(x, y, game, world, config) {
	this.self = world.add.sprite(x, y, 'bomb');

	this.self.wrappedBy = this;

	this.game = game;
	this.world = world;

	this.self.state = parseInt(config.state);
}

CBGame.Bomb.prototype = {
	STATE_IDLE: 0,
	STATE_ACTIVE: 1,

	onCreate: function() {
		this.self.animations.add('idle', [0], 1, true);
        this.self.animations.add('active', [1, 2], 3, true);

        this.game.physics.arcade.enable(this.self);
        this.self.body.immovable = true;
        this.self.body.gravity.y = 300;
        this.self.body.center.setTo(8, 8);
        this.self.body.setSize(16, 12, 0, 8);
        this.self.body.collideWithBounds = true;
        this.self.body.bounce.y = 0.2;
	},

	beforeUpdate: function() {

	},

	onUpdate: function() {

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

	}
}