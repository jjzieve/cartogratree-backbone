//Filename: data_buttons.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',    // lib/backbone/backbone
  'bootstrap'
], function($, _, Backbone){
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  var DataButtonsView = Backbone.View.extend({
			el: "#data_buttons",
			initialize: function(){
				this.$el.append("<div class='btn-group' data-toggle='buttons-checkbox'> Sequenced? "+
						  			"<button type='button' class='btn btn-success btn-sm dropdown-toggle' data-toggle='dropdown'>"+
						    		"<span class='caret'></span></button>"+
						  			"<ul class='dropdown-menu' role='menu'>"+
						    			"<li><a href='#'>Yes</a></li>"+
						   				"<li><a href='#''>No</a></li>"+
						 			"</ul>"+
						 		"</div>");
				this.$el.append("<div class='btn-group'> Phenotyped? "+
						  			"<button type='button' class='btn btn-success btn-sm dropdown-toggle' data-toggle='dropdown'>"+
						    		"<span class='caret'></span></button>"+
						  			"<ul class='dropdown-menu' role='menu'>"+
						    			"<li><a href='#'>Yes</a></li>"+
						   				"<li><a href='#''>No</a></li>"+
						 			"</ul>"+
						 		"</div>");
				this.$el.append("<div class='btn-group'> Genotyped? "+
						  			"<button type='button' class='btn btn-success btn-sm dropdown-toggle' data-toggle='dropdown'>"+
						    		"<span class='caret'></span></button>"+
						  			"<ul class='dropdown-menu' role='menu'>"+
						    			"<li><a href='#'>Yes</a></li>"+
						   				"<li><a href='#''>No</a></li>"+
						 			"</ul>"+
						 		"</div>");		
				$(".dropdown-menu li a").click(function(){
			    	$(".btn:first-child").text($(this).text());
     				$(".btn:first-child").val($(this).text());
				});						
			},
			

			render: function(){
				return this
			}
	});
  return DataButtonsView; 
  // What we return here will be used by other modules
});

