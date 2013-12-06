//Filename: markers.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',    // lib/backbone/backbone
  'models/query'
], function($, _, Backbone,QueryModel){
	var QueriesCollection = Backbone.Collection.extend({
		model: QueryModel,
		filterByColumn: function(query,column){ // could make polymorphic
			return query.column === column;
		},
		values : function(query){
			return query.get("value");
		}
	});
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  return QueriesCollection;
  // What we return here will be used by other modules
});