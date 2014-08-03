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
        this.oneways = this.add.group();
        this.oneways.enableBody = true;

        var objects = map.objects['Object Layer 1'];
        this.loadMapObjects(objects);

        cursors = this.input.keyboard.createCursorKeys();
	},

	update: function() {
		
		this.player.beforeUpdate();

		this.physics.arcade.collide(this.player.self, this.ground);
		this.physics.arcade.collide(this.player.self, this.oneways);
		this.physics.arcade.overlap(this.player.self, this.ladders, this.player.onLadder, null, this.player);		

		this.player.onUpdate();	
	},

	render: function() {
		/*this.player.onRender();

		for (var i = 0; i < this.ladders.children.length; i++)
			this.game.debug.body(this.ladders.children[i]);
		for (var i = 0; i < this.oneways.children.length; i++)
			this.game.debug.body(this.oneways.children[i]);*/
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
					var ladder = this.ladders.create(o.x, o.y-1);
					ladder.name = "ladder" + index;
					ladder.body.setSize(2, o.height+1, o.width/2-1);
					ladder.body.immovable = true;
		            ladder.body.customSeparateX = true;
		            ladder.body.customSeparateY = true;
		            var oneway = this.oneways.create(o.x, o.y);
		            oneway.name = "oneway" + index;
		            oneway.body.setSize(o.width, 8);
		            oneway.body.immovable = true;
		            oneway.body.checkCollision.down = false;
		            oneway.body.checkCollision.right = false;
		            oneway.body.checkCollision.left = false;
					break;
			}
        }
	}
}