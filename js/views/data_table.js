//Filename: data_table.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',
  'dataTables'    // lib/backbone/backbone
], function($, _, Backbone,dataTables){
	var DataTableView = Backbone.View.extend({
		el: '#samples_table',
		initialize: function(){
			this.$el.dataTable();
		}
	});
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  return DataTableView;
  // What we return here will be used by other modules
});

