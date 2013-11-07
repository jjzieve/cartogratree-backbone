//Filename: data_tree.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',    // lib/backbone/backbone
  'treetable',
  'models/data_tree'
  // 'models/map',
  // 'goog!maps,3,other_params:sensor=false'
], function($, _, Backbone, DataTreeModel){//MapModel){
		var DataTreeView = Backbone.View.extend({
			el: "#data_tree",

			initialize: function(){
				this.$el.treetable({expandable:true});
				var studies_root =  this.$el.treetable("node", "1");
				var taxa_root =  this.$el.treetable("node", "2");

				console.log(this.model.attributes);
				// $.getJSON('JSON/taxa.JSON',
				// 	function(data){
				// 		for(var i=0; i<data.length; i++){
				// 			var node = $("#data_tree").treetable("node", "1");

				// 		}
				// 		console.log(data);
				// 	});

				// fusion_table_id = "1Cynob736T_hpL1eKgvONNooCRM5RK1UuSL4bCGc";
				// fusion_table_query_url = "https://www.googleapis.com/fusiontables/v1/query?sql=";
				// fusion_table_key = "&key=AIzaSyA2trAEtQxoCMr9vVNxOM7LiHeUuRDVqvk";
				// years_sql = "select year,count() from "+fusion_table_id+" group by year";
				// families_sql = "select family,count() from "+fusion_table_id+" group by family";


				// $.get(
				// 		fusion_table_query_url+years_sql+fusion_table_key,
				// 		function(data){
				// 			$.each(data.rows, function(index,value){
				// 				var node = $("#data_tree").treetable("node", "1");
				// 				$('#data_tree').treetable("loadBranch",node,'<tr data-tt-parent-id="1" data-tt-id="1-'+index+'"><td>'+value[0]+'</td></tr>');
				// 				var grandparent_value = value[0];
				// 				var grandparent_index = index;
				// 				species_sql = "select species,count() from "+fusion_table_id+" where year='"+grandparent_value+"' group by species"
				// 				$.get(
				// 					fusion_table_query_url+species_sql+fusion_table_key,
				// 					function(data){
				// 						$.each(data.rows, function(index,value){
				// 							var node_id = "1-"+grandparent_index;
				// 							node = $("#data_tree").treetable("node", node_id);
				// 							$('#data_tree').treetable("loadBranch",node,'<tr data-tt-parent-id="'+node_id+'" data-tt-id="'+node_id+'-'+index+'"><td>'+value[0]+'</td></tr>');
				// 							var parent_value = value[0];
				// 							var parent_index = index;
				// 							console.log("grandparent_value "+grandparent_value);
				// 							console.log("parent_value "+parent_value);

				// 							accessions_sql = "select accession, count() from "+fusion_table_id+" where year='"+grandparent_value+"' and species='"+parent_value+"' group by accession";
				// 							$.get(
				// 								fusion_table_query_url+accessions_sql+fusion_table_key,
				// 								function(data){
				// 									$.each(data.rows, function(index,value){
				// 										node_id = node_id+"-"+parent_index;
				// 										node = $("#data_tree").treetable("node", node_id);
				// 										$('#data_tree').treetable("loadBranch",node,'<tr data-tt-parent-id="'+node_id+'" data-tt-id="'+node_id+'-'+index+'"><td>'+value[0]+'</td></tr>');
				// 									});
				// 								}
				// 							);
				// 						});
				// 					}
				// 				);
				// 			});
				// 		}
				// 	);
				// $.get(
				// 		fusion_table_query_url+families_sql+fusion_table_key,
				// 		function(data){
				// 			$.each(data.rows, function(index,value){
				// 				var node = $("#data_tree").treetable("node", "2");
				// 				$('#data_tree').treetable("loadBranch",node,'<tr data-tt-parent-id="2" data-tt-id="2-'+index+'"><td>'+value[0]+'</td></tr>');
				// 				var grandparent_value = value[0];
				// 				var grandparent_index = index;
				// 				species_sql = "select genus,count() from "+fusion_table_id+" where family='"+grandparent_value+"' group by genus"
				// 				$.get(
				// 					fusion_table_query_url+species_sql+fusion_table_key,
				// 					function(data){
				// 						$.each(data.rows, function(index,value){
				// 							var node_id = "2-"+grandparent_index;
				// 							node = $("#data_tree").treetable("node", node_id);
				// 							$('#data_tree').treetable("loadBranch",node,'<tr data-tt-parent-id="'+node_id+'" data-tt-id="'+node_id+'-'+index+'"><td>'+value[0]+'</td></tr>');
				// 							var parent_value = value[0];
				// 							var parent_index = index;
				// 							console.log("grandparent_value "+grandparent_value);
				// 							console.log("parent_value "+parent_value);

				// 							accessions_sql = "select species, count() from "+fusion_table_id+" where family='"+grandparent_value+"' and genus='"+parent_value+"' group by species";
				// 							$.get(
				// 								fusion_table_query_url+accessions_sql+fusion_table_key,
				// 								function(data){
				// 									$.each(data.rows, function(index,value){
				// 										node_id = node_id+"-"+parent_index;
				// 										node = $("#data_tree").treetable("node", node_id);
				// 										$('#data_tree').treetable("loadBranch",node,'<tr data-tt-parent-id="'+node_id+'" data-tt-id="'+node_id+'-'+index+'"><td>'+value[0]+'</td></tr>');
				// 									});
				// 								}
				// 							);
				// 						});
				// 					}
				// 				);
				// 			});
				// 		}
				// 	);

				this.$el.treetable("collapseAll");
			},

			events: {
			    "click .branch": "highlight"
			},

  			highlight: function(){
  				console.log($(".branch clicked"));
  			},

			render: function(){
				return this
			}
	});
  return DataTreeView;
  // What we return here will be used by other modules
});
