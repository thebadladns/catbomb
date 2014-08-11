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
		
		// Tile callbacks!
		// map.setTileIndexCallback(32, this.hitSolidTile, this);
		
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
		this.locks = this.add.group();
		this.locks.enableBody = true;
		this.keys = this.add.group();
		this.keys.enableBody = true;
		this.bombs = this.add.group();
		this.bombs.enableBody = true;
		this.enemies = this.add.group();
		this.enemies.enableBody = true;
		this.explosions = this.add.group();
		this.explosions.enableBody = true;
		this.stop = this.add.group();
		this.stop.enableBody = true;

		var objects = map.objects['Object Layer 1'];
		this.loadMapObjects(objects);

		// Fix order
		this.world.sendToBack(this.door.self);
		this.world.sendToBack(this.ground);
		this.world.bringToTop(this.bombs);
		// this.world.bringToTop(this.enemies);
		this.enemies.z = this.bombs.z + 1;
		// this.world.bringToTop(this.player);
		this.player.self.z = this.enemies.z + 1;
		// this.world.bringToTop(this.explosions);
		this.explosions.z = this.player.self.z + 1;

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
		
		// Pause screen
		this.pauseBack = this.add.sprite(32, 48, "hud");
		this.pauseBack.fixedToCamera = true;
		this.pauseBack.scale.x = 0.6;
		this.pauseBack.scale.y = 6;
		this.pauseText = this.renderText(40, 56, "- PAUSE! - ", true);
		this.pauseText.visible = false;
		this.pauseBack.visible = false;
		this.pauseSelected = 0;
		this.continueText = this.renderText(40, 72, "Œ CONTINUE", true);
		this.restartText = this.renderText(40, 80, "  RESTART", true);
		this.continueText.visible = false;
		this.restartText.visible = false;
		
		var zz = this.explosions.z + 1;
		this.hud.z = (zz++);
		this.stageLabel.z = (zz++);
		this.livesLabel.z = (zz++);
		this.timerLabel.z = (zz++);
		this.pauseText.z = (zz++);
		this.pauseBack.z = (zz++);
		this.continueText.z = (zz++);
		this.restartText.z = (zz++);

		this.StartButton = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
		this.cursors = this.game.input.keyboard.createCursorKeys();
		this.A = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
		
		// this.debugNextLevel = this.game.input.keyboard.addKey(Phaser.Keyboard.N);
		
		CBGame.Data.paused = false;
	},

	update: function() {

		/* Pause menu */
		if (CBGame.Data.paused) {
			if (this.cursors.up.justPressed(1)) {
				this.pauseSelected = (this.pauseSelected - 1) % 2;
			} else if (this.cursors.down.justPressed(1)) {
				this.pauseSelected = (this.pauseSelected + 1) % 2;
			} else if (this.A.justPressed(1) || this.StartButton.justPressed(1)) {
				if (this.pauseSelected == 0) {
					CBGame.Data.paused = false;
					this.handleUnpause();
				} else {
					CBGame.Data.paused = false;
					this.handleUnpause();
					this.player.onTimeout();
				}
			}
			
			if (this.pauseSelected == 0) {
				this.continueText.text = 'Œ CONTINUE';
				this.restartText.text =  '  RESTART';
			} else {
				this.continueText.text = '  CONTINUE';
				this.restartText.text =  'Œ RESTART';
			}
		} else {
			if (this.StartButton.justPressed(1)) {
				CBGame.Data.paused = !CBGame.Data.paused;
				if (CBGame.Data.paused) {
					this.handlePause();
				} else {
					this.handleUnpause();
				}
			}
		}
	
		this.player.beforeUpdate();
		for (var i = 0; i < this.enemies.children.length; i++) {
			this.enemies.getAt(i).wrappedBy.beforeUpdate();
		}

		if (this.player.isAlive) {
			this.physics.arcade.collide(this.player.self, this.ground);
			this.physics.arcade.collide(this.player.self, this.oneways);
			this.physics.arcade.collide(this.player.self, this.bombs, null, this.handleCatVsBomb);
			this.physics.arcade.overlap(this.player.self, this.ladders, 
				this.player.onLadder, null, this.player);
			this.physics.arcade.overlap(this.player.self, this.door.self, 
				this.player.onDoor, null, this.player);

			//if (!this.player.DEBUG) {
				this.physics.arcade.collide(this.player.self, this.locks);
				this.physics.arcade.collide(this.player.self, this.fire, 
					this.player.onHitFire, null, this.player);
				this.physics.arcade.overlap(this.player.self, this.fire, 
					this.player.onHitFire, null, this.player);
				this.physics.arcade.collide(this.player.self, this.enemies, 
					this.player.onHitEnemy, null, this.player);
				this.physics.arcade.overlap(this.player.self, this.enemies, 
					this.player.onHitEnemy, null, this.player);
				this.physics.arcade.overlap(this.player.self, this.explosions, 
					this.player.onHitExplosion, null, this.player);
			//}
		}

		this.physics.arcade.collide(this.bombs, this.ground, null, this.handeBombVsGround, this);
		this.physics.arcade.collide(this.bombs, this.bombs, null, this.handleBombVsBomb, this);
		this.physics.arcade.collide(this.bombs, this.oneways);
		this.physics.arcade.collide(this.bombs, this.locks, this.handleBombVsLock, this.handleBombVsLock);
		this.physics.arcade.collide(this.enemies, this.ground);
		this.physics.arcade.collide(this.enemies, this.oneways);
		this.physics.arcade.collide(this.enemies, this.locks, this.handleEnemyVsLock);
		this.physics.arcade.collide(this.enemies, this.stop, this.handleEnemyVsStop);
		this.physics.arcade.collide(this.keys, this.ground, null, this.handeBombVsGround, this);
		this.physics.arcade.collide(this.keys, this.oneways, null, this.handeBombVsGround, this);
		this.physics.arcade.collide(this.keys, this.bombs, null, this.handeBombVsGround, this);
		
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
		
		for (var i = 0; i < this.enemies.children.length; i++) {
			this.enemies.getAt(i).wrappedBy.onUpdate();
		}

		/*if (this.debugNextLevel.justPressed()) {
			CBGame.Data.nextLevel(this);
		}*/

		// Sort
		this.world.sort();
	},

	render: function() {
	
		if (CBGame.Data.lives > 99)
			CBGame.Data.lives = 99;
		this.livesLabel.text = "Œ" + CBGame.Utils.pad(CBGame.Data.lives, 2);

		/*if (this.player.DEBUG) {
			this.player.onRender();

			for (var i = 0; i < this.ladders.children.length; i++)
				this.game.debug.body(this.ladders.children[i]);
			for (var i = 0; i < this.oneways.children.length; i++)
				this.game.debug.body(this.oneways.children[i]);
			for (var i = 0; i < this.bombs.children.length; i++)
				this.game.debug.body(this.bombs.children[i]);
			for (var i = 0; i < this.explosions.children.length; i++)
				this.game.debug.body(this.explosions.children[i]);
			for (var i = 0; i < this.enemies.children.length; i++)
				this.game.debug.body(this.enemies.children[i]);
			for (var i = 0; i < this.keys.children.length; i++)
				this.game.debug.body(this.keys.children[i]);
			for (var i = 0; i < this.stop.children.length; i++)
				this.game.debug.body(this.stop.children[i]);
			this.game.debug.body(this.door.self);
		}*/

		pixel.render();
	},

	loadMapObjects: function(objects) {
		// for (var index = objects.length-1; index >= 0; index--) {
		for (var index = 0; index <  objects.length; index++) {
			var o = objects[index];
			switch (o.name) {
				case "Cat":
					// this.player = this.add.sprite(o.x, o.y, 'cat');
					this.player = new CBGame.Cat(o.x, o.y, this.game, this);
					this.player.onCreate();
					if (o.properties.facing)
						this.player.facing = parseInt(o.properties.facing);
					break;
				case "Ladder":
					// Spawn the ladder
					var ladder = this.ladders.create(o.x, o.y-1);
					ladder.name = "ladder" + index;
					ladder.body.setSize(6, o.height+1, o.width/2-3);
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
					fire.body.setSize(12, 15, 2, 1);
					fire.body.customSeparateX = true;
					fire.body.customSeparateY = true;
					break;
				case "Door":
					var door = new CBGame.Door(o.x, o.y, this.game, this);
					door.onCreate();
					this.door = door;
					break;
				case "Key":
					var key = new CBGame.Key(o.x, o.y, this.game, this);
					key.self.name = "key"+index;
					this.keys.add(key.self);
					key.onCreate();
					break;
				case "Lock":
					var lock = this.locks.create(o.x, o.y, "lock");
					lock.animations.add('idle', [0], 1, true);
					lock.animations.play('idle');
					lock.name = "lock"+index;
					lock.body.immovable = true;
					break;
				case "Walker":
					var enemy = new CBGame.EnemyWalker(o.x, o.y, this.game, this);
					enemy.onCreate();
					break;
				case "Stop":
					var stop = this.stop.create(o.x, o.y);
					// stop.visible = false;
					stop.body.setSize(o.width, o.height);
					stop.body.immovable = true;
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
		string = string.toUpperCase();
		var text = this.add.bitmapText(x, y, 'font', string, 8);
		text.setText(string);
		text.fixedToCamera = fixedToCamera;
		return text;
	},
	
	handlePause: function() {
		this.pauseSelected = 0;
		this.pauseText.visible = true;
		this.pauseBack.visible = true;
		this.continueText.visible = true;
		this.restartText.visible = true;
		this.stageTimeCounter.pause();

		this.pauseBack.bringToTop();
		this.pauseText.z = this.pauseBack.z+1;
		this.continueText.z = this.pauseText.z+1;
		this.restartText.z = this.continueText.z+1;

		// Pause non-sentient entities
		for (var i = 0; i < this.fire.children.length; i++)
			this.fire.getAt(i).animations.paused = true;
	},
	
	handleUnpause: function() {
		this.pauseText.visible = false;
		this.pauseBack.visible = false;
		this.continueText.visible = false;
		this.restartText.visible = false;
		this.stageTimeCounter.resume();
		
		// Unpause non-sentient entities
		for (var i = 0; i < this.fire.children.length; i++)
			this.fire.getAt(i).animations.paused = false;
	},
	
	handeBombVsGround: function(bomb, tile) {
		if (bomb.body.velocity.x != 0 && bomb.body.onFloor()) {
			bomb.body.velocity.x = 0;
			bomb.body.bounce.y = 3;
		}
		return true;
	},

	checkBombVsLock: function(bomb, lock) {
		return true;
	},

	handleBombVsLock: function(bomb, lock) {
		if (bomb.body.velocity.y != 0 && lock.y >= bomb.y + bomb.height) {
			bomb.wrappedBy.onHitGround();
		} else if (bomb.body.velocity.x != 0 && bomb.body.gravity != 0) {
			bomb.body.velocity.x *= -1;
		} else {
			bomb.wrappedBy.onHitGround();
		}

		return true;
	},
	
	handleCatVsBomb: function(cat, bomb) {
		if (cat.body.velocity.y != 0)
			return true;
		else 
			return false;
	},
	
	handleEnemyVsStop: function(enemy, stop) {
		if (enemy.lastStop != stop) {
			enemy.wrappedBy.onHitWall();
			enemy.lastStop = stop;
			var t = enemy.game.time.create(true);
			t.add(5, function() {enemy.lastStop = undefined; console.log("yay")});
		}
	},

	handleEnemyVsLock: function(enemy, stop) {
		if (enemy.body.touching.right || enemy.body.touching.left)
			enemy.wrappedBy.onHitWall();
	},

	handleBombVsBomb: function(bomb1, bomb2) {
		// Bouncy funkyness
		/*if (bomb1 == bomb2)
			return false;
		else {
			if (bomb1.body.velocity.x != 0 && bomb1.body.velocity.y >= 0) {
				bomb2.body.velocity.x = bomb1.body.velocity.x * 0.7;
				bomb1.body.velocity.x *= -0.2;
				bomb1.body.velocity.y = -10;
			} else if (bomb2.body.velocity.x != 0 && bomb2.body.velocity.y >= 0) {
				bomb1.body.velocity.x = bomb2.body.velocity.x * 0.7;
				bomb2.body.velocity.x *= -0.2;
				bomb2.body.velocity.y = -10;
			}
			return true;
		}*/
		
		// Snappity landoline
		/*if (bomb1 == bomb2)
			return false;
		else {
			if (bomb1.body.velocity.x != 0 && bomb1.body.velocity.y >= 0) {
				var dir = CBGame.Utils.sign(bomb1.body.velocity.x);
				bomb2.x = ((bomb2.x + dir*8) % 8) * 8;
				bomb1.x = bomb2.x + dir*8;
			} else if (bomb2.body.velocity.x != 0 && bomb2.body.velocity.y >= 0) {
				var dir = CBGame.Utils.sign(bomb2.body.velocity.x)
				bomb1.x = ((bomb1.x + dir*8) % 8) * 8;
				bomb2.x = bomb1.x + dir*8;
			}
			return true;
		}*/
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
		pixel.render();
	},

	// Remember to NOT copy this and generalize!!
	renderTextOld: function(x, y, string) {
		var text = string.toUpperCase();
		var style = { font: "8px Press Start, Monospace", fill: "#282828", align: "left" };

		this.add.text(x, y, text, style);
	},

	renderText: function(x, y, string, fixedToCamera) {
		string = string.toUpperCase();
		var text = this.add.bitmapText(x, y, 'font', string, 8);
		text.setText(string);
		text.fixedToCamera = fixedToCamera;
		return text;
	},
};