//Filename: data_buttons.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',    // lib/backbone/backbone
  'text!templates/data_button.html',
  'bootstrap_switch',
  'bootstrap',
], function($, _, Backbone,buttonTemplate,bootstrapSwitch){
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
			events : {
				"click .dropdown-menu li a": "toggleFilter"
			},

			toggleFilter : function(e){
				var filter = $(e.target).attr('class');//parent
				console.log($(e.target).html());
				if ($(e.target).html() == "Yes" || $(e.target).html() == "No"){
					$("#"+filter+".btn:first-child").text($(e.target).html());
					$("#"+filter+".btn:first-child").val($(e.target).html());
				}
				else{
					$("#"+filter+".btn:first-child").html("<span class='caret'></span>");
					$("#"+filter+".btn:first-child").val("none");
				}
				// this.model.toggleFilter();
			},

			initialize: function(){
				this.$el.append(this.template(this.filters));
				$('#gps_resolution').bootstrapSwitch('setSizeClass', 'switch-small');
				$('#sequenced_question').popover({trigger:'hover'})
				$('#genotyped_question').popover({trigger:'hover'})
				$('#phenotyped_question').popover({trigger:'hover'})
				$('#gps_resolution_exact').popover({trigger:'hover'})
				$('#gps_resolution_approx').popover({trigger:'hover'})
			},
			

			render: function(){
				return this
			}
	});
  return DataButtonsView; 
  // What we return here will be used by other modules
});

