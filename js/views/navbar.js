//Filename: data_buttons.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',    // lib/backbone/backbone
], function($, _, Backbone){
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  var NavBarView = Backbone.View.extend({ 
    el: "#navbar",
    initialize: function(){
      $('#credits').popover({
          trigger:'hover',
          html:'true',
          content:
		"<a href='http://backbonejs.org/' target='_blank'>Backbone</a><br>"+
		"<a href='http://getbootstrap.com/'target='_blank'>Bootstrap</a><br>"+
		"<a href='http://jquery.com/' target='_blank'>jQuery</a><br>"+
		"<a href='https://developers.google.com/fusiontables/' target='_blank'>Google Fusion Tables</a><br>"+
		"<a href='https://developers.google.com/maps/' target='_blank'>Google Maps</a><br>"+
		"<a href='https://github.com/mleibman/SlickGrid/wiki' target='_blank'>Slickgrid</a><br>"+
		"<a href='http://ivaynberg.github.io/select2/' target='_blank'>Select2</a>",
	  delay: { hide: 2000 }
      });
      
    }
  });

  return NavBarView; 
  // What we return here will be used by other modules
});

