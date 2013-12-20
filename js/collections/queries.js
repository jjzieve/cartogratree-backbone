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
        "tgdr_id":"118Vk00La9Ap3wSg8z8LnZQG0mYz5iZ67o3uqa8M",
        "sts_is_id":"1bL0GwAL_mlUutv9TVFqknjKLkwzq4sAn5mHiiaI",
        "try_db_id":"14YI8zHpSO983LXFHCqjYZ3ShdPZsvr1nOQUNBuI",
        "ameriflux_id":"1huZ12FnVaWgeUZKaXozbLR0lZfLcxZ_y9RF2h-A"
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
    
    reset: function(){
      if (typeof(this._meta["tgdrWhereClause"]) != undefined){
        delete this._meta["tgdrWhereClause"];
      }
      if (typeof(this._meta["sts_isWhereClause"]) != undefined){
        delete this._meta["sts_isWhereClause"];
      }
      if (typeof(this._meta["try_dbWhereClause"]) != undefined){
        delete this._meta["try_dbWhereClause"];
      }
      if (typeof(this._meta["amerifluxWhereClause"]) != undefined){
        delete this._meta["amerifluxWhereClause"];
      }
      Backbone.Collection.prototype.reset.call(this);
    }
	});
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  return QueriesCollection;
  // What we return here will be used by other modules
});