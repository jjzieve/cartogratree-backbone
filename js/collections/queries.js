//Filename: markers.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',    // lib/backbone/backbone
  'models/filter'
], function($, _, Backbone,QueryModel){
	var QueriesCollection = Backbone.Collection.extend({
		model: QueryModel,
	});
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  return QueriesCollection;
  // What we return here will be used by other modules
});