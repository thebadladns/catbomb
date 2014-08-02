window.onload = function() {

    var game = new Phaser.Game(160, 144, Phaser.AUTO, '', { preload: preload }, false, false);

    function preload () {
        
        console.log(game.antialias);
        game.antialias = false;

        game.scale.maxWidth = 160*3;
        game.scale.maxHeight = 144*3;

        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.setScreenSize();

    }

    game.state.add('Preloader', CBGame.Preloader);
    game.state.add('Gameplay', CBGame.Gameplay);

    game.state.start("Preloader");
}