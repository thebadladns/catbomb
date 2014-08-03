CBGame.Gameplay = function(game) {
}

CBGame.Gameplay.prototype = {
	create: function() {

		window.gameplay = this;

		this.physics.startSystem(Phaser.Physics.ARCADE);

        map = this.add.tilemap('mapLevel0');
        map.addTilesetImage('basic');
        layer = map.createLayer('Tile Layer 1');
        layer.resizeWorld();
        layer.debug = true;
		//map.setCollisionBetween(0, 31);
		//map.setCollisionBetween(34, 100);
		this.ground = layer;
		map.setCollision([32, 33], true, layer);
		this.physics.arcade.enable(map);
        
        this.map = map;

        this.physics.arcade.setBounds(map.x, map.y, map.width, map.height);

        // Temporal ground or so
        /*ground = this.add.group();
        ground.enableBody = true;

        var g = ground.create(0, this.world.height - 16, 'ground');
        g.scale.setTo(this.world.width/8, 1);
        g.visible = false;
        g.body.immovable = true;

        this.ground = ground;*/

        this.player = this.add.sprite(80, 72, 'cat');
        
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

		this.physics.arcade.collide(this.player, this.ground);

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

		/*if (cursors.up.isDown) {
			this.player.body.velocity.y = -120;
		} else if (cursors.down.isDown) {
			this.player.body.velocity.y = 120;
		}*/
	},

	render: function() {
	}
}