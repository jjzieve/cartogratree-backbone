//Filename: data_buttons.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',    // lib/backbone/backbone
  'bootstrap'
], function($, _, Backbone){
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  var View = Backbone.View.extend({});
  var Model = Backbone.Model.extend({});
  var Collection = Backbone.Collection.extend({});
  return {}; 
  // What we return here will be used by other modules
});

