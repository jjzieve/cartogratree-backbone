//Filename: map.js
define([
  'jquery',     
  'underscore',
  'backbone',
], function($, _, Backbone){
    MapModel = Backbone.Model.extend({
    	defaults :{
    		fusion_table_query_url: "https://www.googleapis.com/fusiontables/v1/query?sql=",
		    fusion_table_key: "&key=AIzaSyA2trAEtQxoCMr9vVNxOM7LiHeUuRDVqvk",
		    fusion_table_id: "1AV4s_xvk7OQUMCvxoKjnduw3DjahoRjjKM9eAj8"
    	}, 

    });
    return MapModel;
});
