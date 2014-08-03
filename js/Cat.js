// Player class

CBGame.Cat = function(x, y, game, world) {
	this.self = world.add.sprite(x, y, 'cat');
	this.game = game;
	this.world = world;

	this.cursors = game.input.keyboard.createCursorKeys();
}

CBGame.Cat.prototype = {
	onCreate: function() {
		this.self.animations.add('left', [2, 3], 6, true);
        this.self.animations.add('right', [0, 1], 6, true);

        this.game.physics.arcade.enable(this.self);
        this.self.body.gravity.y = 300;
        this.self.body.center.setTo(8, 8);
        this.self.body.setSize(14, 15, 1, 1);
        this.self.body.collideWithBounds = true;

        this.world.camera.follow(this.self,  Phaser.Camera.PLATFORMER);
	},

	beforeUpdate: function() {
		this.self.onLadder = false;
		this.self.body.velocity.x = 0;
	},

	onUpdate: function() {

		document.getElementById('label').textContent = this.checkForFloor();

		/*if (this.self.onLadder)
			this.self.tint = 0x9a058c;
		else
			this.self.tint = 0xffffff;*/

		if (!this.self.climbing && this.self.body.velocity.y == 0) {
			if (cursors.left.isDown) {
				this.self.body.velocity.x = -60;
				this.self.animations.play('left');
			} else if (cursors.right.isDown) {
				this.self.body.velocity.x = 60;
				this.self.animations.play('right');
			} else {
				this.self.animations.stop();
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
	}
}

CBGame.Bomb = function(x, y, game, world, config) {
	this.self = world.add.sprite(x, y, 'bomb');
	this.game = game;
	this.world = world;

	this.self.state = config.state | config.state;
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
	},

	beforeUpdate: function() {

	},

	onUpdate: function() {
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