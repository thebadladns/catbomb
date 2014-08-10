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
			this.game.state.start("PreGameplay");
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
	create: function() {

	},

	update: function() {

	},

	render: function() {

	},

	renderText: function(x, y, string, fixedToCamera) {
		string = string.toUpperCase();
		var text = this.add.bitmapText(x, y, 'font', string, 8);
		text.setText(string);
		text.fixedToCamera = fixedToCamera;
		return text;
	}
}