CBGame.Gameplay = function(game) {
}

CBGame.Gameplay.prototype = {
	create: function() {

	},

	update: function() {
		var logo = this.add.sprite(this.world.centerX, this.world.centerY, 'logo');
        logo.anchor.setTo(0.5, 0.5);
	}
}