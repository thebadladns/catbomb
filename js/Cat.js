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

	onCreate: function() {
		this.self.animations.add('left', [2, 3], 6, true);
		this.self.animations.add('right', [0, 1], 6, true);
		this.self.animations.add('dead', [4, 5], 4, true);

		this.game.physics.arcade.enable(this.self);
		this.self.body.gravity.y = 300;
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
			/*if (this.carrying.type != this.TYPE_NONE) {
				this.carrying.reference.body.velocity.x = 0;
			}*/
		}
	},

	onUpdate: function() {
		// Debug
		if (this.debugKey.justPressed())
			this.DEBUG = !this.DEBUG;
		
		if (this.DEBUG)
				this.self.tint = 0x02d3a0;
			else
				this.self.tint = 0xffffff;
	
		document.getElementById('label').textContent = this.facing;

		if (this.isAlive) {

			/*if (this.self.onLadder)
				this.self.tint = 0x9a058c;
			else
				this.self.tint = 0xffffff;*/

			if (!this.self.climbing && this.self.body.velocity.y == 0) {
				if (this.self.onOpenDoor && this.cursors.up.justPressed()) {
					// Exit!
					CBGame.Data.nextLevel(this.scene);
				} else if (this.cursors.left.isDown) {
					this.self.body.velocity.x = -60;
					this.self.animations.play('left');
					this.facing = this.LEFT;
				} else if (this.cursors.right.isDown) {
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
			} else if (this.self.onLadder && this.cursors.up.isDown) {
				this.self.x = this.self.currentLadder.x;
				this.self.y -= 1;
				this.self.body.gravity.y = 0;
				this.self.climbing = true;
			} else if (this.self.onLadder && this.cursors.down.isDown) {
				if (!this.checkForFloor()) {
					this.self.y += 1;
					this.self.body.gravity.y = 0;
					this.self.x = this.self.currentLadder.x;
					this.self.climbing = true;
				} else {
					this.self.climbing = false;
				}
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

		// Move the body temprarily to check for bombs!
		var oldx = this.self.body.x;
		this.self.body.x = testx;

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

		this.self.body.x = oldx;

		return result;
	},

	onHitFire: function(me, fire) {
		// Kill cat!
		if (Math.abs(me.body.overlapX) < me.width / 4 &&
			Math.abs(me.body.overlapY) < me.height/ 4)
			return;

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
		if (Math.abs(me.body.overlapX) < me.width / 4 &&
			Math.abs(me.body.overlapY) < me.height/ 4)
			return;

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
