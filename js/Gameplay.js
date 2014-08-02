CBGame.Gameplay = function(game) {
}

CBGame.Gameplay.prototype = {
	create: function() {
		/*var logo = this.add.sprite(this.world.centerX, this.world.centerY, 'logo');
        logo.anchor.setTo(0.5, 0.5);*/

        map = this.add.tilemap('mapLevel0');
        map.addTilesetImage('basic');
        layer = map.createLayer('Tile Layer 1');
        layer.resizeWorld();
		// map.setCollisionBetween(0, 100); // tile indexes to collide to!
        
        this.map = map;
	},

	update: function() {

	}
}