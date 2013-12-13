//Filename: data_tabs.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',    // lib/backbone/backbone
  'bootstrap',
  'models/query',
  'collections/queries',
], function($, _, Backbone, QueryModel, QueriesCollection){
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  var BottomTabsView = Backbone.View.extend({
    el: "#data_tabs",

    // initialize: function(){
    //   this.$('a[data-toggle="tab"]:first').tab('show');
    // },

    // events : {
    //   "click .nav_tabs li a":"show"
    // },

    // show: function(e){
    //   e.preventDefault();
    //   this.$(e.target).tab('show');
    // },

    render: function(){
      this.$("a:first").tab('show');
    }

  });
 
  return BottomTabsView; 
  // What we return here will be used by other modules
});
