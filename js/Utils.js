CBGame.Utils = {
	sign: function(n) {
		return n?n<0?-1:1:0;
	},

	pad: function(string, width, char) {
		// we need a string, bro
		string = "" + string;
		// pad with 0s by default
		if (!char)
			char = "0";
		while (string.length < width)
			string = char + string;

		return string;
	}
};
