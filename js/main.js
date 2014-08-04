window.onload = function() {

    var game = new Phaser.Game(160, 144, Phaser.CANVAS, 'gameframe', false, false);

    game.state.add('Preloader', CBGame.Preloader);
    game.state.add('Title', CBGame.TitleScreen);
    game.state.add('PreGameplay', CBGame.PreGameplay);
    game.state.add('Gameplay', CBGame.Gameplay);
    game.state.add('GameOver', CBGame.GameOver);

    game.state.start("Preloader");
}