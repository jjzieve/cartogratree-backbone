//Filename: map.js
define([
  'jquery',     
  'underscore',
  'backbone',
  'models/query'
], function($, _, Backbone,QueryModel){
    MapModel = Backbone.Model.extend({
    	// model: QueryModel,
	    initialize: function(){
	    	this.set("fusion_table_query_url","https://www.googleapis.com/fusiontables/v1/query?sql=");
		    this.set("fusion_table_key","&key=AIzaSyA2trAEtQxoCMr9vVNxOM7LiHeUuRDVqvk");
		    this.set("fusion_table_id","1AV4s_xvk7OQUMCvxoKjnduw3DjahoRjjKM9eAj8");
		    this.set("query",new QueryModel());
	    },
	    toggleSelection: function(event){
	    	// console.log($(event.target).text());
	    	var whereClause = [];
	    	var node = $(event.target)
	    	if(node.hasClass('selected') && node.text().length > 1){
	    		console.log(node.text());
	    		console.log(node.text().length);
	    		whereClause.push("'species' = '"+node.text()+"'")
	    	}
	    	this.updateMap(whereClause);
	    },
	   
	    toggleFilter: function(event){
	    	var id = event.target.id;
	    	var label = $('#'+id).parents('label');	    	
	    	var whereClause = [];
	    	if (label.hasClass('active')){
	    		whereClause.push("'"+id+"' not equal to 'No'");
	    	}
	    	this.updateMap(whereClause);	    	
	    },

	     updateMap: function(whereClause){
	    	this.get("query").set({"where":whereClause.join(' and ')});
	    	this.trigger('change'); //not sure why this is needed
	    }
	
    });
    return MapModel;
});
