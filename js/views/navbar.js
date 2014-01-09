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
          trigger:'click',
          html:'true',
          content:'Backbone<br>Bootstrap<br>Google Fusion Table<br>Google Maps<br>jQuery<br>SlickGrid<br>TreeTable'
      });
      
    }
  });

  return NavBarView; 
  // What we return here will be used by other modules
});

