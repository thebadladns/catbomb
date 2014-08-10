CBGame.TitleScreen = function(game) {

};

CBGame.TitleScreen.prototype = {
	create: function() {
		this.Start = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);

		this.add.sprite(0, 0, 'title');

		CBGame.Data.reset();
	},

	update: function() {
		if (this.Start.justPressed()) {
			this.game.state.start("Intro");
		}
	},

	render: function() {
		pixel.render();
	},

	// Remember to NOT copy this and generalize!!
	renderText: function(x, y, string, fixedToCamera) {
		string = string.toUpperCase();
		var text = this.add.bitmapText(x, y, 'font', string, 8);
		text.setText(string);
		text.fixedToCamera = fixedToCamera;
		return text;
	}
}

CBGame.GameOver = function(game) {

};

CBGame.GameOver.prototype = {
	create: function() {
		this.Start = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);

		this.add.sprite(0, 0, 'gameover');
	},

	update: function() {
		if (this.Start.justPressed()) {
			this.game.state.start("Title");
		}
	},

	render: function() {
		pixel.render();
	},

	// Remember to NOT copy this and generalize!!
	renderText: function(x, y, string, fixedToCamera) {
		string = string.toUpperCase();
		var text = this.add.bitmapText(x, y, 'font', string, 8);
		text.setText(string);
		text.fixedToCamera = fixedToCamera;
		return text;
	}
}

CBGame.Intro = function(game) {
	
};

CBGame.Intro.prototype = {
	ENTER: 0,
	LOOK: 1,
	EAT: 2,
	JUMP: 3,

	WHITE: 0xf8fcf8,
	BLACK: 0x282828,

	create: function() {
		this.Start = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);

		this.bomb = this.add.sprite(72, 68, "bomb");
		this.bomb.animations.add('active', [1, 2], 3, true);
		this.bomb.animations.play("active");

		this.cat = this.add.sprite(16, 72, "cat");
		this.cat.animations.add('walkright', [0, 1], 6, true);
		this.cat.animations.add('lookleft', [3], 3, true);
		this.cat.animations.add('right', [0, 1], 3, true);
		this.cat.animations.add('lookright', [1], 3, true);
		this.cat.animations.play('walkright');
		this.game.physics.arcade.enable(this.cat);
		this.cat.body.gravity.y = 0;
		this.cat.body.velocity.x = 40;

		this.cat.z = this.bomb.z+1;

		this.stage.backgroundColor = this.WHITE;

		this.phase = this.ENTER;

		this.world.sort();
	},

	update: function() {
		if (this.phase == this.ENTER) {
			if (this.cat.x >= 56) {
				this.cat.x = 56;
				this.cat.body.velocity.x = 0;
				this.cat.animations.play("lookright");
				this.phase = this.LOOK;
			}
		} else if (this.phase == this.LOOK) {
			this.phase = this.EAT;
			this.done = false;
			this.timer = this.game.time.create();
			this.timer.add(1500, this.faceLeft, this);
			this.timer.add(3000, this.faceRight, this);
			this.timer.add(4300, this.faceLeft, this);
			this.timer.add(4600, this.faceRight, this);
			this.timer.add(6000, this.eatBall, this);
			this.timer.start();
		} else if (this.phase == this.EAT) {
			if (this.cat.animations.currentAnim.isFinished && !this.done) {

				var x = this.cat.x;
				var y = this.cat.y;
				this.cat.destroy();

				this.cat = this.add.sprite(x+16, y+8, "cat");
				this.cat.animations.add('right', [0, 1], 6, true);
				this.cat.animations.play('right');
				this.game.physics.arcade.enable(this.cat);
				this.cat.body.gravity.y = 0;
				this.cat.body.velocity.x = 30;
				this.cat.body.velocity.y = 0;

				this.timer = this.game.time.create();
				this.timer.add(500, this.doPunishCat, this);
				this.timer.start();

				this.done = true;

			} else if (
				this.cat.animations.currentFrame && 
				this.cat.animations.currentFrame.index == 5 &&
				this.bomb) {
				this.bomb.destroy();
				this.bomb = null;
			}
		} else if (this.phase == this.JUMP) {
			if (this.cat.y > 72) {
				this.cat.y = 72;
				this.cat.body.velocity.y = 0;
				this.cat.body.velocity.x = 0;
				this.cat.body.gravity.y = 0;
				this.cat.animations.play("cryslow");
			}

			this.text1 = "  OH NO! BAD CAT!!  ";
			this.text2 = " THAT BOMB  WAS NOT ";
			this.text3 = "  FOR TOU TO EAT!!  ";
			this.text4 = "   TO THE DUNGEON   ";
			this.text5 = "       WITH YOU!!   ";

			this.label1 = this.renderText(0,  24, this.text1, this.WHITE);
			this.label2 = this.renderText(0,  40, this.text2, this.WHITE);
			this.label3 = this.renderText(0,  48, this.text3, this.WHITE);
			this.label4 = this.renderText(0, 104, this.text4, this.WHITE);
			this.label5 = this.renderText(0, 112, this.text5, this.WHITE);

			this.timer = this.game.time.create();
			this.timer.add(1000, this.dungeonizeCat, this);
			this.timer.start();
		}

		if (this.Start.justPressed(1)) {
			this.game.state.start("PreGameplay");
		}
	},

	render: function() {
		pixel.render();
	},

	renderText: function(x, y, string, color) {
		string = string.toUpperCase();
		var text = this.add.bitmapText(x, y, 'fontwhite', string, 8);
		text.setText(string);
		/*if (color)
			text.tint = color;*/
		return text;
	},

	faceLeft: function() {
		this.cat.animations.play("lookleft");
	},

	faceRight: function() {
		this.cat.animations.play("lookright");
	},

	eatBall: function() {
		var x = this.cat.x;
		var y = this.cat.y;
		this.cat.destroy();
		this.cat = this.add.sprite(x, y-8, "cateatbomb");
		this.cat.animations.add("eatbomb", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], 20, false);
		this.cat.animations.play("eatbomb");

		this.cat.z = this.bomb.z+1;

		this.world.sort();
	},

	switchBg: function() {
		if (this.stage.backgroundColor == this.BLACK)
			this.stage.backgroundColor = this.WHITE;
		else
			this.stage.backgroundColor = this.BLACK;
	},

	doPunishCat: function() {
		var x = this.cat.x;
		var y = this.cat.y;
		this.cat.destroy();

		this.cat = this.add.sprite(x, y, "cat");
		this.cat.animations.add('cry', [4, 5], 4, true);
		this.cat.animations.add('cryslow', [4, 5], 2, true);
		this.cat.animations.play('cry');
		this.game.physics.arcade.enable(this.cat);
		this.cat.body.gravity.y = 200;
		this.cat.body.velocity.x = -25;
		this.cat.body.velocity.y = -90;

		this.stage.backgroundColor = this.BLACK;

		this.timer = this.game.time.create();
		this.timer.add(50, this.switchBg, this);
		this.timer.add(100, this.switchBg, this);
		this.timer.add(150, this.switchBg, this);
		this.timer.add(200, this.switchBg, this);
		this.timer.add(250, this.switchBg, this);
		this.timer.add(300, this.switchBg, this);
		this.timer.add(350, this.switchBg, this);
		this.timer.add(400, this.switchBg, this);
		this.timer.add(450, this.switchBg, this);
		this.timer.add(500, this.switchBg, this);
		this.timer.add(550, this.switchBg, this);
		this.timer.add(600, this.switchBg, this);
		this.timer.add(650, this.switchBg, this);
		this.timer.add(700, this.switchBg, this);
		this.timer.start();

		this.phase = this.JUMP;
	},

	dungeonizeCat: function() {
		this.cat.animations.play('cry');
		this.game.physics.arcade.enable(this.cat);
		this.cat.body.gravity.y = 200;
		this.cat.body.velocity.x = -25;
		this.cat.body.velocity.y = -90;
	}
}
