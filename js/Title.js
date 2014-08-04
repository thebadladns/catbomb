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

	},

	// Remember to NOT copy this and generalize!!
	renderText: function(x, y, string) {
		var text = string.toUpperCase();
    	var style = { font: "8px Press Start", fill: "#282828", align: "left" };

    	this.add.text(x, y, text, style);
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

	},

	// Remember to NOT copy this and generalize!!
	renderText: function(x, y, string) {
		var text = string.toUpperCase();
    	var style = { font: "8px Press Start", fill: "#282828", align: "left" };

    	this.add.text(x, y, text, style);
	}
}