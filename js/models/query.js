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
    }
  });
  return QueryModel; 
  // What we return here will be used by other modules
});

