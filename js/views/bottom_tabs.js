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

    initialize: function(){
      var that = this;
      this.$("li a:first").tab('show');
      $('#tools ul li a').on('click', function() {
        $('#tools_title').html($(this).html());
        $("#tools ul li a").not(this).removeClass("selected");
        $(this).addClass('selected');
      });
      $("#run_tool").on('click', function(){
        console.log($("#tools ul li").find("a.selected").attr("id"));
        // $.each($("#tools ul li a"),function(index,element){
        //   if (element.hasClass("selected")){
        //     console.log(element.html());
        //   }
        // })
      });
    },

// $('#myTabContent').append('<div class="tab-pane in active" id="new_tab_id"><p> Loading content ...</p></div>');
// $('#tab').append('<li><a href="#new_tab_id" data-toggle="tab">Tab Name</a></li>');
// $('#tab a:last').tab('show');
    // events : {
    //   "click .nav_tabs li a":"show"
    // },

    // show: function(e){
    //   e.preventDefault();
    //   this.$(e.target).tab('show');
    // },

    render: function(){
      return this;
    }

  });
 
  return BottomTabsView; 
  // What we return here will be used by other modules
});

