var CBGame = {};

// Data
CBGame.Data = {
	level: 1,
	world: 1,
	lives: 5,
	continues: 2,

	/*LEVELS: 4,
	WORLDS: 4,*/
	LEVELS: 2,
	WORLDS: 1,

	reset: function() {
		this.level = 1;
		this.world = 1;
		this.lives = 5;
		this.continues = 2;
	},

	nextLevel: function(scene) {
		this.level++;
		if (this.level > this.LEVELS) {
			this.world++;
			if (this.world > this.WORLDS) {
				// win!
				scene.game.state.start("GameOver");
				return;
			} else {
				// next world
				this.level = 1;
			}
		}

		scene.game.state.start("PreGameplay");
	}
};

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
		// this.load.atlas('spriteset', 'assets/spritesheet.png', 'assets/spritesheet.json');

		// Images
		this.load.image('logo', 'assets/dummy.png');
		this.load.image('title', 'assets/titletemp.png');
		this.load.image('gameover', 'assets/gameovertemp.png');
		this.load.image('hud', 'assets/hud.png');

		// Tiles
		this.load.image('basic', 'assets/tilesbasic.png');

		// Levels
		this.load.tilemap('stage1-1', 'assets/levelt2.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('stage1-2', 'assets/levelt0.json', null, Phaser.Tilemap.TILED_JSON);

		// Sprites
		this.load.image('ground', 'assets/ground.png');
		this.load.spritesheet('cat', 'assets/cat.png', 16, 16);
		this.load.spritesheet('bomb', 'assets/bomb.png', 20, 20);
		this.load.spritesheet('fire', 'assets/fire.png', 16, 16);
		this.load.spritesheet('explosion', 'assets/boom.png', 32, 32);
		this.load.spritesheet('door', 'assets/door.png', 24, 24);

		// Sounds!!
		// ...
	},

	create: function() {		
		// ...
	},

	update: function() {
		if (/*this.cache.isSoundDecoded('...') && */!this.ready) {
			this.ready = true;
			this.state.start("Title");
		}
	}
};