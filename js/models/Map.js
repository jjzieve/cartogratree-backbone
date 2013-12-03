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
		    // 		select: "lat",
		    // 		from: "1AV4s_xvk7OQUMCvxoKjnduw3DjahoRjjKM9eAj8"
		    // 	})
		    // );
		    	// JSON.stringify(new QueryModel()));
	    },
	    toggleFilter: function(event){
	       	var clause = "where '" + event.target.id + "' is not equal to 'No'" 
	    	this.get("query").set({"where":clause});
	    	this.trigger('change');
	    	console.log(this.changedAttributes());
	    }
    });
    return MapModel;
});
