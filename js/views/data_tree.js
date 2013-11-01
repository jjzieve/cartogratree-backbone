//Filename: data_tree.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',    // lib/backbone/backbone
  'treetable',
  'models/map',
  'goog!maps,3,other_params:sensor=false'
], function($, _, Backbone, MapModel){
		var DataTreeView = Backbone.View.extend({
			el: '#data_tree',
			// appendChild: function(parent_index,sql,callback){
			// 		$.get(
			// 			"https://www.googleapis.com/fusiontables/v1/query?sql="+sql+"&key=AIzaSyA2trAEtQxoCMr9vVNxOM7LiHeUuRDVqvk",
			// 			function()


			// )}

			initialize: function(){
				years_sql = "select year,count() from 1jASE5L0kFRWDq2H6BBbffZ2dm4lqOBBJYtWLKGI group by year";
				families_sql = "select family,count() from 1jASE5L0kFRWDq2H6BBbffZ2dm4lqOBBJYtWLKGI group by family";
				// genus_sql = "select genus,count() from 1jASE5L0kFRWDq2H6BBbffZ2dm4lqOBBJYtWLKGI group by genus";
				// species_sql = "select species,count() from 1jASE5L0kFRWDq2H6BBbffZ2dm4lqOBBJYtWLKGI group by species";
				// tree_sql = "select tree_id from 1jASE5L0kFRWDq2H6BBbffZ2dm4lqOBBJYtWLKGI";
				$('#data_tree').treetable({expandable:true});
				$.get(
					"https://www.googleapis.com/fusiontables/v1/query?sql="+years_sql+"&key=AIzaSyA2trAEtQxoCMr9vVNxOM7LiHeUuRDVqvk",
					function(data){
						$.each(data.rows, function(index,value){
							var node = $("#data_tree").treetable("node", "1");
							$('#data_tree').treetable("loadBranch",node,'<tr data-tt-parent-id="1" data-tt-id="1-'+index+'"><td>'+value[0]+'</td></tr>');
							var parent_value = value[0];
							var parent_index = index
							species_sql = "select species, count() from 1jASE5L0kFRWDq2H6BBbffZ2dm4lqOBBJYtWLKGI where year = '"+parent_value+"' group by species";
							$.get(
								"https://www.googleapis.com/fusiontables/v1/query?sql="+species_sql+"&key=AIzaSyA2trAEtQxoCMr9vVNxOM7LiHeUuRDVqvk",
								function(data){
									$.each(data.rows, function(index,value){
										var node_id = "1-"+parent_index;
										var node = $("#data_tree").treetable("node", node_id);
										$('#data_tree').treetable("loadBranch",node,'<tr data-tt-parent-id="'+node_id+'" data-tt-id="'+node_id+'-'+index+'"><td>'+value[0]+'</td></tr>');
									});
								});
						});
					});
				$.get(
					"https://www.googleapis.com/fusiontables/v1/query?sql="+families_sql+"&key=AIzaSyA2trAEtQxoCMr9vVNxOM7LiHeUuRDVqvk",
					function(data){
						$.each(data.rows, function(index,value){
							var node = $("#data_tree").treetable("node", "2");
							$('#data_tree').treetable("loadBranch",node,'<tr data-tt-parent-id="2" data-tt-id="2-'+index+'"><td>'+value[0]+'</td></tr>');
							var parent_value = value[0];
							var parent_index = index
							genus_sql = "select genus, count() from 1jASE5L0kFRWDq2H6BBbffZ2dm4lqOBBJYtWLKGI where family = '"+parent_value+"' group by genus";
							$.get(
								"https://www.googleapis.com/fusiontables/v1/query?sql="+genus_sql+"&key=AIzaSyA2trAEtQxoCMr9vVNxOM7LiHeUuRDVqvk",
								function(data){
									$.each(data.rows, function(index,value){
										var node_id = "2-"+parent_index;
										var node = $("#data_tree").treetable("node", node_id);
										$('#data_tree').treetable("loadBranch",node,'<tr data-tt-parent-id="'+node_id+'" data-tt-id="'+node_id+'-'+index+'"><td>'+value[0]+'</td></tr>');
									});
								});
						});
						
						console.log(data.rows);
					});
				// el.treetable("loadBranch",node,
				// '<tr data-tt-parent-id="1" data-tt-id="1-'+recordnumber+'">'+
				// '<td><b>Accession:</b> '+record.accession+'<br>'+
				// '<b>Title:</b> '+record.title+'<br>'+
				// '<b>Authors:</b> '+record.authors+'<br>'+
				// '<b>Species:</b>'+record.species+'<br>'+
				// '<b>Year: </b>'+record.date+'<br>'+
				// '<b>Number of markers: </b>'+record.samples+'<br>'+
				// '</td></tr>');
				$('#data_tree').treetable("collapseAll");
			},
			render: function(){
				return this
			}
	});
  return DataTreeView;
  // What we return here will be used by other modules
});
