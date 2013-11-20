//Filename: data_buttons.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',    // lib/backbone/backbone
  'text!templates/data_button.html',
  'bootstrap'
], function($, _, Backbone,buttonTemplate){
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  var DataButtonsView = Backbone.View.extend({
			el: "#data_buttons",
			template: _.template(buttonTemplate),
			filters: { filters: [
							{type: "Sequenced"},
							{type: "Genotyped"},
							{type: "Phenotyped"}
						]
			},

			initialize: function(){
				this.$el.append(this.template(this.filters));
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

