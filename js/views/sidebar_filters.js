//Filename: data_buttons.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',    // lib/backbone/backbone
  'models/map',
  'text!templates/filters.html',
  'bootstrap_switch',
  'bootstrap',
], function($, _, Backbone,MapModel,filtersTemplate,bootstrapSwitch){
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  var FiltersView = Backbone.View.extend({
			el: "#filters",
			template: _.template(filtersTemplate),
			model: MapModel,
        				
			events : {
				"click .checkbox": "toggleFilter"
			},

			toggleFilter : function(event){
				// var filter = $(e.target).attr('class');//parent
				// console.log($(e.target).html());
				// if ($(e.target).html() == "Yes" || $(e.target).html() == "No"){
				// 	$("#"+filter+".btn:first-child").text($(e.target).html());
				// 	$("#"+filter+".btn:first-child").val($(e.target).html());
				// }
				// else{
				// 	$("#"+filter+".btn:first-child").html("<span class='caret'></span>");
				// 	$("#"+filter+".btn:first-child").val("none");
				// }
				var id = "#"+event.target.id
				// $(id).prop('checked',!$(id).prop('checked'));//toggle check
    			
    			$(id).parents('label').toggleClass('active');// toggle class
				this.model.toggleFilter(event);
			},

			initialize: function(){
				this.fusion_table_query_url = this.model.get("fusion_table_query_url");
        		this.fusion_table_key = this.model.get("fusion_table_key");
				var that = this;
				$.getJSON('data/filters.JSON',
					function(data){
						$.each(data.filters,function(index,filter){
							$.getJSON(that.fusion_table_query_url+filter.query+that.fusion_table_key).success(function(result){
								filter.count = result.rows[0][0];
								that.$el.append(that.template({"filter": filter}));
								$('#sequenced_qmark').popover({trigger:'hover'});
								$('#genotyped_qmark').popover({trigger:'hover'});
								$('#phenotyped_qmark').popover({trigger:'hover'});
								$('#exact_gps_qmark').popover({trigger:'hover'});
								$('#approx_gps_qmark').popover({trigger:'hover'});	
							});

						});
											
					}
				);
			},
			
			render: function(){
				return this
			}
	});
  return FiltersView; 
  // What we return here will be used by other modules
});

