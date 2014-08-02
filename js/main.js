window.onload = function() {

    var game = new Phaser.Game(160, 144, Phaser.AUTO, '', { preload: preload }, false, false);

    function preload () {
        

    }

    game.state.add('Preloader', CBGame.Preloader);
    game.state.add('Gameplay', CBGame.Gameplay);

    game.state.start("Preloader");
}