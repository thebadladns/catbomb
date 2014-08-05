CBGame.Gameplay = function(game) {
}

CBGame.Gameplay.prototype = {
	create: function(a, b, c) {

		window.gameplay = this;

		this.stage.smoothed = false;

		this.physics.startSystem(Phaser.Physics.ARCADE);

        map = this.add.tilemap('stage' + CBGame.Data.world + '-' + CBGame.Data.level);
        map.addTilesetImage('basic');
        layer = map.createLayer('Tile Layer 1');
        layer.resizeWorld();
        // layer.debug = true;

		this.ground = layer;
		map.setCollision([32, 33], true, layer);
		this.physics.arcade.enable(map);
        
        this.map = map;

        this.physics.arcade.setBounds(map.x, map.y, map.width, map.height);

        // Load entities
        this.player = undefined;
        this.ladders = this.add.group();
        this.ladders.enableBody = true;
        this.oneways = this.add.group();
        this.oneways.enableBody = true;
        this.fire = this.add.group();
        this.fire.enableBody = true;
        this.bombs = this.add.group();
        this.bombs.enableBody = true;
        this.explosions = this.add.group();
        this.explosions.enableBody = true;

        var objects = map.objects['Object Layer 1'];
        this.loadMapObjects(objects);

        // Time limit
        this.stageTime = 300;
        this.stageTimeCounter = this.game.time.create();
		this.stageTimeCounter.loop(1000, this.onStageTimerCounter, this);
		this.stageTimeCounter.start();

        // HUD
        this.hud = this.add.image(0, 136, "hud");
        this.hud.fixedToCamera = true;
		this.stageLabel = this.renderText(0, 137, "STAGE " + 
			CBGame.Data.world + "-" + CBGame.Data.level, true);
		this.livesLabel = this.renderText(136, 137, 
			"Œ" + CBGame.Utils.pad(CBGame.Data.lives, 2), true);
		this.timerLabel = this.renderText(88, 137, "T" + CBGame.Utils.pad(this.stageTime, 3), true);

        this.debugNextLevel = this.game.input.keyboard.addKey(Phaser.Keyboard.N);
	},

	update: function() {

		this.player.beforeUpdate();

		if (this.player.isAlive) {
			this.physics.arcade.collide(this.player.self, this.ground);
			this.physics.arcade.collide(this.player.self, this.oneways);
			this.physics.arcade.overlap(this.player.self, this.ladders, this.player.onLadder, null, this.player);		
			this.physics.arcade.collide(this.player.self, this.fire, this.player.onHitFire, null, this.player);
			this.physics.arcade.collide(this.player.self, this.bombs);
			this.physics.arcade.overlap(this.player.self, this.explosions, this.player.onHitExplosion, null, this.player);
		}

		this.physics.arcade.collide(this.bombs, this.ground);
		// this.physics.arcade.overlap(this.bombs, this.explosions, CBGame.Bomb.onHitExplosion, null);
		
		if (this.door)
			this.door.onUpdate();

		this.player.onUpdate();	

		for (var i = 0; i < this.bombs.children.length; i++) {
			this.bombs.getAt(i).wrappedBy.onUpdate();
		}

		for (var i = 0; i < this.explosions.children.length; i++) {
			if (this.explosions.getAt(i).wrappedBy)
				this.explosions.getAt(i).wrappedBy.onUpdate();
		}

		if (this.debugNextLevel.justPressed()) {
			CBGame.Data.nextLevel(this);
		}
	},

	render: function() {
		//this.player.onRender();

		/*for (var i = 0; i < this.ladders.children.length; i++)
			this.game.debug.body(this.ladders.children[i]);
		for (var i = 0; i < this.oneways.children.length; i++)
			this.game.debug.body(this.oneways.children[i]);*/

		/*for (var i = 0; i < this.bombs.children.length; i++)
			this.game.debug.body(this.bombs.children[i]);*/
		/*for (var i = 0; i < this.explosions.children.length; i++)
			this.game.debug.body(this.explosions.children[i]);*/
	},

	loadMapObjects: function(objects) {
		for (var index = objects.length-1; index >= 0; index--) {
			var o = objects[index];
			switch (o.name) {
				case "Cat":
					// this.player = this.add.sprite(o.x, o.y, 'cat');
					this.player = new CBGame.Cat(o.x, o.y, this.game, this);
					this.player.onCreate();
					break;
				case "Ladder":
					// Spawn the ladder
					var ladder = this.ladders.create(o.x, o.y-1);
					ladder.name = "ladder" + index;
					ladder.body.setSize(2, o.height+1, o.width/2-1);
					ladder.body.immovable = true;
		            ladder.body.customSeparateX = true;
		            ladder.body.customSeparateY = true;
		            // Spawn the oneway platform of the top
		            var oneway = this.oneways.create(o.x, o.y);
		            oneway.name = "oneway" + index;
		            oneway.body.setSize(o.width, 8);
		            oneway.body.immovable = true;
		            oneway.body.checkCollision.down = false;
		            oneway.body.checkCollision.right = false;
		            oneway.body.checkCollision.left = false;
					break;
				case "Bomb":
					var bomb = new CBGame.Bomb(o.x, o.y, this.game, this, {
						state: o.properties.active
					});
					bomb.self.name = "bomb"+index;
					bomb.onCreate();
					this.bombs.add(bomb.self);
					break;
				case "Fire":
					var fire = this.fire.create(o.x, o.y, "fire");
					fire.animations.add('idle', [0, 1], 4, true);
					fire.animations.play('idle');
					fire.name = "fire" + index;
					fire.body.customSeparateX = true;
					fire.body.customSeparateY = true;
					break;
				case "Door":
					var door = new CBGame.Door(o.x, o.y, this.world, this);
					this.door = door;
					break;
			}
        }
	},

	onStageTimerCounter: function(a, b, c) {
		this.stageTime--;
		if (this.stageTime < 0) {
			this.stageTimeCounter.stop();
			this.player.onTimeout();
		} else {
			this.timerLabel.text = "T"+CBGame.Utils.pad(this.stageTime,3);
		}
	},

	onStageExit: function() {
		CBGame.Data.nextLevel(this);
	},

	renderText: function(x, y, string, fixedToCamera) {
		var text = string.toUpperCase();
    	var style = { font: "8px Press Start", fill: "#282828", align: "left" };

    	var text = this.add.text(x, y, text, style);
    	text.fixedToCamera = fixedToCamera;
    	return text;
	}
}

CBGame.PreGameplay = function(game) {

};

CBGame.PreGameplay.prototype = {
	create: function() {
		this.Start = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);

		this.stage.backgroundColor = 0xf8fcf8;
		this.renderText(40, 40, "WORLD  " + CBGame.Utils.pad(CBGame.Data.world, 2));
		this.renderText(40, 48, "LEVEL  " + CBGame.Utils.pad(CBGame.Data.level, 2));

		this.renderText(40, 64, "LIVES  " + CBGame.Utils.pad(CBGame.Data.lives, 2));

		this.renderText(40, 80, " - GO! - ");
	},

	update: function() {
		if (this.Start.justPressed()) {
			this.game.state.start("Gameplay");
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
};