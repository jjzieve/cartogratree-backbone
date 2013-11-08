//Filename: data_tree.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone'    // lib/backbone/backbone
], function($, _, Backbone){
	var DataTreeModel = Backbone.Model.extend({
		// url : 'data/studies.JSON',
		// parse: function(data){
		// 	console.log();
		// 	return data;
		// }
		// defaults: {
		// 	id: null,
		// 	name: null,
		// 	description: null
		// },
		
		// initialize: function() {
		// 	console.log('init DataTreeModel');
		// 	this.studies = 	function (){
		// 		$.getJSON('data/studies.JSON',
		// 			function(data){
		// 				return data;
		// 			}
		// 		);
		// 	}
		// }
		// 	}});
		// },
		// function(){
		// 	$.getJSON('data/studies.JSON',
		// 		function(data){

		// 			console.log('test');
		// 		});
		// },
		// taxa: function(){
		// 	$.getJSON('JSON/taxa.JSON',
		// 		function(data){
		// 			return data;
		// 		});
		// },
		// //selected: false
	});
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  return DataTreeModel;
  // What we return here will be used by other modules
});

