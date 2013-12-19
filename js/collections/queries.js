//Filename: markers.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',    // lib/backbone/backbone
  'models/query'
], function($, _, Backbone,QueryModel){
	var QueriesCollection = Backbone.Collection.extend({
    initialize: function() {
      this._meta = {
        //fusion table ids
        "tgdr_id":"1NaivbgjfiueJo4O8R-7Wy5c7OdYCWFB18PRS0fA",
        "sts_is_id":"1bL0GwAL_mlUutv9TVFqknjKLkwzq4sAn5mHiiaI",
        "trydb_id":"1h-KVbQdplul76b2dmVP33E7tEtt3oag44Oeu3oA",
        "ameriflux_id":"1Z_m0uQ3EGpzwVLFq0EwoZ2jwmzdFev4YSN-U8NQ"
      };
    },      
    model: QueryModel,
    meta: function(prop, value) { // so we can store the query text
      if (value === undefined) {
        return this._meta[prop]
      } 
      else {
        this._meta[prop] = value;
      }
    },
    
    // reset: function(){
    //   if (this._meta["currentQuery"]){
    //     this._meta["currentQuery"] = "";
    //   }
    //   this.Backbone.View.Prototype.reset.call(this);
    // }
	});
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  return QueriesCollection;
  // What we return here will be used by other modules
});