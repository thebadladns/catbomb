window.onload = function() {

	var game = new Phaser.Game(160, 144, Phaser.CANVAS, '');
	window.pixel = { 
		scale: 3, 
		canvas: null, 
		context: null, 
		width: 0, 
		height: 0,
		render: function render() {
			var pixel = this;
			pixel.context.drawImage(game.canvas, 0, 0, game.width, game.height, 0, 0, pixel.width, pixel.height);
		}
	};
	
	game.state.add('Preloader', CBGame.Preloader);
	game.state.add('BadladnsLogo', CBGame.BadladnsLogo);
	game.state.add('Title', CBGame.TitleScreen);
	game.state.add('Intro', CBGame.Intro);
	game.state.add('PreGameplay', CBGame.PreGameplay);
	game.state.add('Gameplay', CBGame.Gameplay);
	game.state.add('Ending', CBGame.Ending);
	game.state.add('GameOver', CBGame.GameOver);

	game.state.start("Preloader");
}