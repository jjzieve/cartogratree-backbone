//Filename: markers.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',    // lib/backbone/backbone
  'models/tree_id'
], function($, _, Backbone,TreeIDModel){
	var TreeIDCollection = Backbone.Collection.extend({
    initialize: function(){
      this._meta = { //no other tabs but the samples are open
        "genotype_tab_open" : false,
        "worldclim_tab_open" : false,
        "phenotype_tab_open" : false,
        "amplicon_tab_open" : false
      };
    },

		model: TreeIDModel,
    meta: function(prop, value) { // so we can store the query text
      if (value === undefined) {
        return this._meta[prop]
      } 
      else {
        this._meta[prop] = value;
      }
    },

    reset: function(){ //will have to delete these manually when exiting out of the tab, don't delete the metas...

      Backbone.Collection.prototype.reset.call(this);
    }
	});
  // They will not be accessible in the global scope
  return TreeIDCollection;
  // What we return here will be used by other modules
});
