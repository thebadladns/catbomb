var CBGame = {};

// Preload state
// Will load resources and ready things!
CBGame.Preloader = function(game) {

	this.background = null;
	this.preloadBar = null;
	this.ready = false;
};

CBGame.Preloader.prototype = {
	preload: function() {

        this.scale.maxWidth = 160*3;
        this.scale.maxHeight = 144*3;

        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.setScreenSize();

        // this.stage.smoothed = false;

		// SetBackground and preloadBar

		// Load assets for the game here...
		this.load.image('logo', 'assets/dummy.png');
		this.load.image('basic', 'assets/tilesbasic.png');

		this.load.tilemap('mapLevel0', 'assets/levelt0.json', null, Phaser.Tilemap.TILED_JSON)
		// this.load.atlas('spriteset', 'assets/spritesheet.png', 'assets/spritesheet.json');
		// this.load.spritesheet('play','assets/play.png',400,110);

		this.load.image('ground', 'assets/ground.png');
		this.load.spritesheet('cat', 'assets/cat.png', 16, 16);
		this.load.spritesheet('bomb', 'assets/bomb.png', 20, 20);
	},

	create: function() {		
		// ...
	},

	update: function() {
		if (/*this.cache.isSoundDecoded('...') && */!this.ready) {
			this.ready = true;
			this.state.start("Gameplay");
		}
	}
};