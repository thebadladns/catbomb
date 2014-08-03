CBGame.Gameplay = function(game) {
}

CBGame.Gameplay.prototype = {
	create: function() {

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

        var objects = map.objects['Object Layer 1'];
        this.loadMapObjects(objects);
        
        this.player.animations.add('left', [2, 3], 6, true);
        this.player.animations.add('right', [0, 1], 6, true);

        this.physics.arcade.enable(this.player);
        this.player.body.gravity.y = 300;
        this.player.body.center.setTo(8, 8);
        this.player.body.setSize(14, 15, 1, 1);
        this.player.body.collideWithBounds = true;

        this.camera.follow(this.player,  Phaser.Camera.PLATFORMER);

        cursors = this.input.keyboard.createCursorKeys();
	},

	update: function() {
		this.player.onLadder = false;

		this.physics.arcade.collide(this.player, this.ground);
		this.physics.arcade.overlap(this.player, this.ladders, this.playerOnLadder, null, this);

		this.player.body.velocity.x = 0;

		if (cursors.left.isDown) {
			this.player.body.velocity.x = -60;
			this.player.animations.play('left');
		} else if (cursors.right.isDown) {
			this.player.body.velocity.x = 60;
			this.player.animations.play('right');
		} else {
			this.player.animations.stop();
		}

		if (this.player.onLadder)
			this.player.tint = 0x9a058c;
		else
			this.player.tint = 0xffffff;

		/*if (cursors.up.isDown) {
			this.player.body.velocity.y = -120;
		} else if (cursors.down.isDown) {
			this.player.body.velocity.y = 120;
		}*/
	},

	render: function() {
	},

	playerOnLadder: function(a, b, c) {
		this.player.onLadder = true;
	},

	loadMapObjects: function(objects) {
		for (var index in objects) {
			var o = objects[index];
			switch (o.name) {
				case "Cat":
					this.player = this.add.sprite(o.x, o.y, 'cat');
					break;
				case "Ladder":
					var ladder = this.ladders.create(o.x, o.y);
					ladder.body.setSize(o.width/2, o.height, o.width/4);
					ladder.body.immovable = true;
		            ladder.body.customSeparateX = true;
		            ladder.body.customSeparateY = true;
					break;
			}
        }
	}
}