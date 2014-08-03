window.onload = function() {

    var game = new Phaser.Game(160, 144, Phaser.CANVAS, 'gameframe', false, false);

    game.state.add('Preloader', CBGame.Preloader);
    game.state.add('Gameplay', CBGame.Gameplay);

    game.state.start("Preloader");
}