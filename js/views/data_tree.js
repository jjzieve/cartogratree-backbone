//Filename: data_tree.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',    // lib/backbone/backbone
  'treetable'
  'models/map',
  'goog!maps,3,other_params:sensor=false'
], function($, _, Backbone, MapModel){
		var DataTreeView = Backbone.View.extend({
			el: $("#data_tree"),
			// initialize:
			// 	el.treetable("loadBranch",node,
			// 	'<tr data-tt-parent-id="1" data-tt-id="1-'+recordnumber+'">'+
			// 	'<td><b>Accession:</b> '+record.accession+'<br>'+
			// 	'<b>Title:</b> '+record.title+'<br>'+
			// 	'<b>Authors:</b> '+record.authors+'<br>'+
			// 	'<b>Species:</b>'+record.species+'<br>'+
			// 	'<b>Year: </b>'+record.date+'<br>'+
			// 	'<b>Number of markers: </b>'+record.samples+'<br>'+
			// 	'</td></tr>');
	});
  return DataTreeView;
  // What we return here will be used by other modules
});
