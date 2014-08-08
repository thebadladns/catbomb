// Player class

CBGame.Cat = function(x, y, game, scene) {
	this.self = scene.add.sprite(x, y, 'cat');
	
	// Ha ha hacking to get an onPostUpdate event
	this.self.wrappedBy = this;
	this.self.oldPostUpdate = this.self.postUpdate;
	this.self.postUpdate = function() {
		this.oldPostUpdate();
		this.wrappedBy.afterUpdate();
	};

	this.game = game;
	this.scene = scene;

	this.cursors = game.input.keyboard.createCursorKeys();
	this.A = game.input.keyboard.addKey(Phaser.Keyboard.A);
	this.B = game.input.keyboard.addKey(Phaser.Keyboard.S);

	// Debug
	this.self.inputEnabled = true;
	this.self.input.enableDrag();
	
	this.debugKey = game.input.keyboard.addKey(Phaser.Keyboard.J);
	this.DEBUG = false;
}

CBGame.Cat.prototype = {
	RIGHT: 1,
	LEFT: -1,

	TYPE_NONE: 0,
	TYPE_BOMB: 1,
	TYPE_KEY: 2,

	GRAVITY: 300,
	HSPEED: 40,
	VSPEED: 1,


	onCreate: function() {
		this.self.animations.add('left', [2, 3], 3, true);
		this.self.animations.add('walkleft', [2, 3], 6, true);
		this.self.animations.add('right', [0, 1], 3, true);
		this.self.animations.add('walkright', [0, 1], 6, true);
		this.self.animations.add('climb', [6, 7], 4, true);
		this.self.animations.add('dead', [4, 5], 4, true);

		this.game.physics.arcade.enable(this.self);
		this.self.body.gravity.y = this.GRAVITY;
		this.self.body.center.setTo(8, 8);
		this.self.body.setSize(14, 15, 1, 1);
		this.self.body.collideWithBounds = true;

		this.scene.camera.follow(this.self,  Phaser.Camera.PLATFORMER);

		this.isAlive = true;
		this.facing = this.RIGHT;
		this.self.onOpenDoor = false;
		this.carrying = {
			type: this.TYPE_NONE,
			reference: null
		}
		this.pauseStorage = {};
	},

	beforeUpdate: function() {
		if (this.DEBUG) {
			this.isAlive = true;
			this.storedVelocityX = 0;
			this.storedVelocityY = 0;
		}

		if (this.isAlive) {
			this.self.onLadder = false;
			this.self.onOpenDoor = false;
			this.self.body.velocity.x = 0;
		}
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
			
	
		// Debug
		if (this.debugKey.justPressed())
			this.DEBUG = !this.DEBUG;
		
		if (this.DEBUG)
				this.self.tint = 0x02d3a0;
			else
				this.self.tint = 0xffffff;

		if (this.isAlive) {

			/*if (this.self.onLadder)
				this.self.tint = 0x9a058c;
			else
				this.self.tint = 0xffffff;*/

			// Check for enemies!
			/*var es = this.scene.enemies;
			for (var i = 0; i < es.length; i++) {
				var e = es.getAt(i);
				if (!e || !e.body)
					continue;
				if (this.game.physics.arcade.intersects(this.self.body, e.body)) {
					this.onHitEnemy(this.self, e);
					break;
				}
			}*/

			if (!this.self.climbing && this.self.body.velocity.y == 0) {
				var anim = "";
				if (this.self.onOpenDoor && this.cursors.up.justPressed()) {
					// Exit!
					CBGame.Data.nextLevel(this.scene);
				} else if (this.cursors.left.isDown) {
					this.self.body.velocity.x = -this.HSPEED;
					anim = 'walkleft';
					this.facing = this.LEFT;
				} else if (this.cursors.right.isDown) {
					this.self.body.velocity.x = this.HSPEED;
					anim = 'walkright';
					this.facing = this.RIGHT;
				} else {
					if (this.facing == this.LEFT)
						anim = "left";
					else
						anim = "right";
				}

				this.self.animations.play(anim);
			} else if (this.self.body.velocity.y != 0) {
				this.self.animations.stop();
			}

			if (this.B.justPressed(1)) {
				// Pick up
				if (this.carrying.type == this.TYPE_NONE) {
					var carryData = this.checkForBomb(); // Checkforpickable
					if (carryData.type != this.TYPE_NONE) {
						// Got anything
						// Make it portable
						var bomb = carryData.reference;
						bomb.bringToTop();
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
					bomb.body.gravity.y = this.GRAVITY;
					// Drop it
					bomb.z = bomb.oldz;
					// bomb.y += 4;
					if (this.facing == this.LEFT) {
						/*if (this.self.body.onWall()) {
							bomb.x = this.self.x;
							this.self.x += 16;
						} else {
							bomb.x = this.self.x - 16;
						}*/
						bomb.body.velocity.x = -30;
					} else if (this.facing == this.RIGHT) {
						/*if (this.self.body.onWall()) {
							bomb.x = this.self.x;
							this.self.x -= 16;
						} else {
							bomb.x = this.self.x + 16;
						}*/
						bomb.body.velocity.x = 30;
					}
					// And forget you got it
					this.carrying.type = this.TYPE_NONE;
					this.carrying.reference = null; 
				}
			}

			var oldY = this.self.y;

			if (!this.self.onLadder) {
				this.self.body.gravity.y = this.GRAVITY;
				this.self.climbing = false;
			} else if (this.self.onLadder && this.cursors.up.isDown) {
				if (this.self.currentLadder.y < this.self.y + this.self.height - 1) {
					this.self.x = this.self.currentLadder.x;
					this.self.y -= this.VSPEED;
					this.self.body.gravity.y = 0;
					this.self.climbing = true;
				}
			} else if (this.self.onLadder && this.cursors.down.isDown) {
				if (!this.checkForFloor()) {
					this.self.y += this.VSPEED;
					this.self.body.gravity.y = 0;
					this.self.x = this.self.currentLadder.x;
					this.self.climbing = true;
				} else {
					this.self.climbing = false;
				}
			} else {
				// If we are just on the top and not pressing buttons, just drop dude
				if (this.self.currentLadder.y == this.self.y + this.self.height - 1) {
					this.self.body.gravity.y = this.GRAVITY;
					this.self.climbing = false;
				}
			}

			if (this.self.climbing) {
				this.self.animations.play("climb");
				if (this.self.y == oldY)
					this.self.animations.stop();
			}

			if (this.carrying.type != this.TYPE_NONE) {
				var bomb = this.carrying.reference;
				bomb.wrappedBy.facing = this.facing;
			}

		} else {
			// DEAD CAT!!
			
			if (this.justDead) {
				this.self.body.velocity.x = this.storedVelocityX;
				this.self.body.velocity.y = this.storedVelocityY;
				this.justDead = false;
			}
			this.self.body.acceleration.x = 
				-1 * CBGame.Utils.sign(this.self.body.velocity.x) * 30;
			this.self.body.gravity.y = this.GRAVITY;
			this.self.animations.play('dead');

			// Check out of bounds!
			if (this.self.x < this.scene.world.bounds.left || 
				this.self.x - this.self.width >= this.scene.world.bounds.right + 2 ||
				this.self.y < this.scene.world.bounds.top || 
				this.self.y - this.self.height >= this.scene.world.bounds.bottom + 2) {
				this.onDeath();
			}
		}
	},

	afterUpdate: function() {
		this.self.x = Math.round(this.self.x);
		this.self.y = Math.round(this.self.y);
		if (this.carrying.type != this.TYPE_NONE) {
			var bomb = this.carrying.reference;
			var xoffset, yoffset;
			switch (this.carrying.type) {
				case this.TYPE_BOMB: 	xoffset = 8; yoffset = -8; break;
				case this.TYPE_KEY: 	xoffset = 10; yoffset = -1; break;
			}
			
			// Lift it
			bomb.y = this.self.y + yoffset;
			if (this.facing == this.LEFT) {
				bomb.x = this.self.x - xoffset;
			} else if (this.facing == this.RIGHT) {
				bomb.x = this.self.x + xoffset;
			}

			bomb.wrappedBy.facing = this.facing;
		}
	},

	onRender: function() {
		this.game.debug.body(this.self);
	},

	onLadder: function(me, ladder) {
		if (Math.abs(ladder.x + ladder.body.offset.x - (this.self.x + this.self.width/2)) < ladder.width) {
			this.self.onLadder = true;
			this.self.currentLadder = ladder;
		}
	},

	onDoor: function(me, door) {
		this.self.onOpenDoor = false;
		if (door.wrappedBy.state == CBGame.Door.prototype.OPEN) {
			if (Math.abs(door.x + door.width/2 - (this.self.x + this.self.width/2)) < 8) {
				this.self.onOpenDoor = true;
			}
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

		// Move the body temprarily to check for pickables
		var oldx = this.self.body.x;
		this.self.body.x = testx;

		// We would like to lift a bomb, yo
		var bombs = this.scene.bombs;
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
		// If no bomb found, check those keys bro
		if (result.type == this.TYPE_NONE) {
			var keys = this.scene.keys;
			for (var i = 0; i < keys.length; i++) {
				var key = keys.getAt(i);
				if (!key || !key.body)
					continue;
				if (this.game.physics.arcade.intersects(this.self.body, key.body)) {
					result.type = this.TYPE_KEY;
					result.reference = key;
					break;
				}
			}
		}
		
		this.self.body.x = oldx;

		return result;
	},

	onHitFire: function(me, fire) {
		// Kill cat!
		/*if (Math.abs(me.body.overlapX) < me.width / 4 &&
			Math.abs(me.body.overlapY) < me.height/ 4)
			return;*/

		if (this.isAlive) {
			console.log("death by fire");
			this.isAlive = false;
			this.justDead = true;

			this.storedVelocityX = CBGame.Utils.sign(me.x - fire.x) * 50;
			this.storedVelocityY = -70;
		}
	},
	
	onHitEnemy: function(me, enemy) {
		// Kill cat!
		/*if (Math.abs(me.body.overlapX) < me.width / 4 &&
			Math.abs(me.body.overlapY) < me.height/ 4)
			return;*/

		if (this.isAlive) {
			console.log("death by enemy");
			this.isAlive = false;
			this.justDead = true;

			this.storedVelocityX = CBGame.Utils.sign(me.x - enemy.x) * 50;
			this.storedVelocityY = -70;
	
	if (enemy.wrappedBy && enemy.wrappedBy.onHitWall) {
		var other = enemy.wrappedBy;
		// Enemy will walk the other way if he has killed the cat
		if (other.facing == other.LEFT && other.self.x >= this.self.x + this.self.width/2 ||
			other.facing == other.RIGHT && other.self.x + other.self.width/2 < this.self.x)
		enemy.wrappedBy.onHitWall();
			}
		}
	},

	onHitExplosion: function(me, explosion) {
		if (this.isAlive) {
			console.log("death by explosion");
			this.isAlive = false;
			this.justDead = true;

			this.storedVelocityX = CBGame.Utils.sign(me.x - explosion.x) * 50;
			this.storedVelocityY = -70;
		}
	},

	onTimeout: function() {
		// Kill cat!
		if (this.isAlive) {
			console.log("death by timeout");
			this.isAlive = false;
			this.justDead = true;

			this.storedVelocityX = 0;
			this.storedVelocityY = -70;
		}
	},

	onDeath: function() {
		CBGame.Data.lives -= 1;
		if (CBGame.Data.lives < 0) {
			this.game.state.start("GameOver");
		} else {
			this.game.state.start("PreGameplay");
		}
	}
}
