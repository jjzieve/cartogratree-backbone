//Filename: data_buttons.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',    // lib/backbone/backbone
  'models/map',
  'collections/queries',
  'text!templates/filters.html',
  'bootstrap',
], function($, _, Backbone,MapModel,QueriesCollection,filtersTemplate){
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  var FiltersView = Backbone.View.extend({
			el: "#filters",
			template: _.template(filtersTemplate),
			model: MapModel,
			collection: QueriesCollection,
        				
			events : {
				"click .checkbox": "toggleFilter"
			},

			toggleFilter : function(event){
    			var filter = event.target.id;
    			if (filter) {
    				if ($('#'+filter).parents('label').hasClass('active')) {
    					this.collection.remove(filter);
    				}
    				else {
    					this.collection.add(
    					{
    						id: filter, // so it can be removed
    						filter: filter
    					});
    				}
    				$('#'+filter).parents('label').toggleClass('active');
    			}
			},

  		
			initialize: function(){
				var that = this;
				$.getJSON('data/filters.JSON',
					function(data){
						var sorted = data.filters.sort(function(a,b) { return parseInt(a.order) - parseInt(b.order)}); //hack to order the output of filters
						$.each(sorted,function(index,filter){
							$.getJSON(
								that.model.get("fusion_table_query_url")+
								filter.query+
								that.model.get("fusion_table_key")).success(function(result){
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

