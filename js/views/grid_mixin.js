define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',
  ], function($, _, Backbone) {
		var GridMixin = {
			test: function(){
				console.log('test');
			},

			setLoaderIcon: function(){
		      this.$el.css({
		          "background-image": "url(images/ajax-loader.gif)",
		          "background-repeat" : "no-repeat",
		          "background-position" : "center"
		      }).addClass("loading");
		    },
		    
		    unsetLoaderIcon: function(){
		      this.$el.css({"background-image":"none"}).removeClass("loading");
		    }
		}
		return GridMixin;
});
