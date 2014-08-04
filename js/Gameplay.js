CBGame.Gameplay = function(game) {
}

CBGame.Gameplay.prototype = {
	create: function(a, b, c) {

		window.gameplay = this;

		this.stage.smoothed = false;

		this.physics.startSystem(Phaser.Physics.ARCADE);

        map = this.add.tilemap('mapLevel0');
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
        this.bombs = this.add.group();
        this.bombs.enableBody = true;
        this.fire = this.add.group();
        this.fire.enableBody = true;

        var objects = map.objects['Object Layer 1'];
        this.loadMapObjects(objects);

        // HUD
		this.stageLabel = this.renderText(0, 137, "STAGE " + 
			CBGame.Data.world + "-" + CBGame.Data.level, true);
		this.livesLabel = this.renderText(136, 137, 
			"Œ0" + CBGame.Data.lives, true);

        cursors = this.input.keyboard.createCursorKeys();
	},

	update: function() {
		
		this.player.beforeUpdate();

		if (this.player.isAlive) {
			this.physics.arcade.collide(this.player.self, this.ground);
			this.physics.arcade.collide(this.player.self, this.oneways);
			this.physics.arcade.overlap(this.player.self, this.ladders, this.player.onLadder, null, this.player);		
			this.physics.arcade.collide(this.player.self, this.fire, this.player.onHitFire, null, this.player);
			this.physics.arcade.collide(this.player.self, this.bombs);
		}

		this.physics.arcade.collide(this.bombs, this.ground);
		

		this.player.onUpdate();	

		for (var i = 0; i < this.bombs.children.length; i++) {
			this.bombs.getAt(i).wrappedBy.onUpdate();
		}
	},

	render: function() {
		// this.player.onRender();

		/*for (var i = 0; i < this.ladders.children.length; i++)
			this.game.debug.body(this.ladders.children[i]);
		for (var i = 0; i < this.oneways.children.length; i++)
			this.game.debug.body(this.oneways.children[i]);*/

		/*for (var i = 0; i < this.bombs.children.length; i++)
			this.game.debug.body(this.bombs.children[i]);*/
	},

	loadMapObjects: function(objects) {
		for (var index in objects) {
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
			}
        }
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
		this.renderText(40, 40, "WORLD  0" + CBGame.Data.world);
		this.renderText(40, 48, "LEVEL  0" + CBGame.Data.level);

		this.renderText(40, 64, "LIVES  0" + CBGame.Data.lives);

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