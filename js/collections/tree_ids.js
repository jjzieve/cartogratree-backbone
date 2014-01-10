//Filename: markers.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',    // lib/backbone/backbone
  'models/tree_id'
], function($, _, Backbone,TreeIDModel){
	var TreeIDCollection = Backbone.Collection.extend({
		model: TreeIDModel
	});
  // They will not be accessible in the global scope
  return TreeIDCollection;
  // What we return here will be used by other modules
});
