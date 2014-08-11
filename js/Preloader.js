var CBGame = {};

// Data
CBGame.Data = {
	level: 1,
	world: 1,
	lives: 5,
	continues: 2,

	paused: false,
	
	/*LEVELS: 4,
	WORLDS: 4,*/
	LEVELS: 9,
	WORLDS: 1,

	reset: function() {
		this.level = 1;
		this.world = 1;
		this.lives = 5;
		this.continues = 2;
		this.paused = false;
	},

	nextLevel: function(scene) {
		this.level++;
		if (this.level > this.LEVELS) {
			this.world++;
			if (this.world > this.WORLDS) {
				// win!
				scene.game.state.start("Ending");
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
		var game = this.game;

		// Hide un-scaled canvas
		game.canvas.style['display'] = 'none';
		
		// Create a scaled canvas
		pixel.canvas = Phaser.Canvas.create(game.width * pixel.scale, game.height * pixel.scale);
		// Store context
		pixel.context = pixel.canvas.getContext('2d');
		// Add to canvas
		Phaser.Canvas.addToDOM(pixel.canvas);
		// Disable smoothing
		Phaser.Canvas.setSmoothingEnabled(pixel.context, false);
		
		pixel.width = pixel.canvas.width;
		pixel.height = pixel.canvas.height;

		// SetBackground and preloadBar

		// Load assets for the game here...
		// this.load.atlas('spriteset', 'assets/spritesheet.png', 'assets/spritesheet.json');

		// Images
		this.load.image('logo', 'assets/badladnslogo.png');
		this.load.image('gameby', 'assets/gameby.png');
		this.load.image('title', 'assets/titletemp.png');
		this.load.image('gameover', 'assets/gameovertemp.png');
		this.load.image('hud', 'assets/hud.png');

		// Font
		game.load.bitmapFont('font', 'assets/font.png', 'assets/font.xml');
		game.load.bitmapFont('fontwhite', 'assets/fontwhite.png', 'assets/fontwhite.xml');

		// Tiles
		this.load.image('basic', 'assets/tilesbasic.png');

		// Levels
		var n = 1;
		// this.load.tilemap('stage1-1', 'assets/test.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('stage1-' + (n++), 'assets/tutorial.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('stage1-' + (n++), 'assets/0.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('stage1-' + (n++), 'assets/1.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('stage1-' + (n++), 'assets/levelt1.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('stage1-' + (n++), 'assets/chaintutorial.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('stage1-' + (n++), 'assets/6.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('stage1-' + (n++), 'assets/chainofbombs.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('stage1-' + (n++), 'assets/5.json', null, Phaser.Tilemap.TILED_JSON);
		this.load.tilemap('stage1-' + (n++), 'assets/lockasplatform.json', null, Phaser.Tilemap.TILED_JSON);
		// this.load.tilemap('stage1-9', 'assets/6.json', null, Phaser.Tilemap.TILED_JSON);

		// Sprites
		this.load.image('ground', 'assets/ground.png');
		this.load.spritesheet('cat', 'assets/cat.png', 16, 16);
		this.load.spritesheet('cateatbomb', 'assets/eatbomb.png', 40, 24);
		this.load.spritesheet('catty', 'assets/catlady.png', 16, 16);
		this.load.spritesheet('bomb', 'assets/bomb.png', 20, 20);
		this.load.spritesheet('fire', 'assets/fire.png', 16, 16);
		this.load.spritesheet('explosion', 'assets/boomv2.png', 32, 32);
		this.load.spritesheet('door', 'assets/door.png', 24, 24);
		this.load.spritesheet('key', 'assets/key.png', 16, 16);
		this.load.image('lock', 'assets/lock.png');

		this.load.spritesheet('skeleton', 'assets/skeleton.png', 16, 16);
		this.load.spritesheet('dissolve', 'assets/dissolve.png', 16, 16);

		// Sounds!!
		// ...
	},

	create: function() {		
		// ...
	},

	update: function() {
		if (/*this.cache.isSoundDecoded('...') && */!this.ready) {
			this.ready = true;
			this.state.start("BadladnsLogo");
		}
	},
	
	render: function() {
		pixel.render();
	}
};