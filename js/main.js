window.onload = function() {

    var game = new Phaser.Game(160, 144, Phaser.AUTO, '', { preload: preload, create: create }, false, false);

    function preload () {

        console.log(game.antialias);
        game.antialias = false;

        game.scale.maxWidth = 160*3;
        game.scale.maxHeight = 144*3;

        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.setScreenSize();

        game.load.image('logo', 'assets/phaser.png');

    }

    function create () {

        var logo = game.add.sprite(game.world.centerX, game.world.centerY, 'logo');
        logo.anchor.setTo(0.5, 0.5);

    }
}