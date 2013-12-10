//Filename: data_buttons.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',    // lib/backbone/backbone
], function($, _, Backbone){
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  var QueryModel = Backbone.Model.extend({
    defaults: {
      column: "",//year,species,genus,family,accession
      value: "",//(e.g. "Pinus taeda")
      dependent: false,//so far this only applies to studies
      filter: "", //so it doesn't have to be searched by the selection pane
      fusion_table_query_url: "https://www.googleapis.com/fusiontables/v1/query?sql=",
      fusion_table_key: "&key=AIzaSyA2trAEtQxoCMr9vVNxOM7LiHeUuRDVqvk",
      fusion_table_id: "1AV4s_xvk7OQUMCvxoKjnduw3DjahoRjjKM9eAj8"
    }
  });
  return QueryModel; 
  // What we return here will be used by other modules
});

