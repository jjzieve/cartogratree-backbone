//Filename: data_buttons.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',    // lib/backbone/backbone
  'models/query',
  'collections/queries',
  'bootstrap',
], function($, _, Backbone,QueryModel,QueriesCollection){
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  var FiltersView = Backbone.View.extend({
			el: "#filters",
			model: QueryModel,
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
    			}
    			$('#'+filter).parents('label').toggleClass('active');
    			 
      			$('#'+filter).attr('checked', !$('#'+filter).attr('checked'));
    		},
    		countQuery: function(query,id){
    			$.getJSON(this.model.get("fusion_table_query_url")+
						query+
						this.model.get("fusion_table_key")).success(function(result){
							if(result.rows){
								$("#"+id).parent().html($("#"+id).parent().html().replace(/\d+/,result.rows[0][0]));	
							}
							else{
								$("#"+id).parent().html($("#"+id).parent().html().replace(/\d+/,0));
							}
						});
			},

			refreshCounts: function(){
				console.log("refreshCounts");
				var that = this;
				this.$el.children().each(function(){
					if($(this).hasClass("checkbox")){
						var id = $(this).find("input").attr("id");
						var fusion_table_column = id;
						var notCase = "No" //default for genotyped and sequenced
						// var defaultQuery = "SELECT COUNT() FROM "+that.model.get("fusion_table_id")+
						// 				" WHERE '"+fusion_table_column+"' = 'false'";
						if (id == "phenotyped") {
							fusion_table_column = "phenotype"
							notCase = "";
						}
						if (id == "exact_gps") {
							fusion_table_column = "gps";
							notCase = "estimate";
						}
						if (id == "approx_gps") {
							fusion_table_column = "gps";
							notCase = "exact";
						}

						if(that.collection.length == 0){
							$("#"+id).parent().html($("#"+id).parent().html().replace(/\d+/,0));
						} 
						else if (that.collection.length == 1 && (that.collection.get("1-3") || that.collection.get("1-3-0") || that.collection.get("1-4") || that.collection.get("1-4-0"))) {
							$("#"+id).parent().html($("#"+id).parent().html().replace(/\d+/,0));
						}
						else if 
						(that.collection.length == 2 && //every combination involving only envrionmental or phenotypic, convoluted...
						((that.collection.get("1-3") && that.collection.get("1-3-0")) ||
						(that.collection.get("1-3") && that.collection.get("1-4")) ||
						(that.collection.get("1-3") && that.collection.get("1-4-0")) ||
						(that.collection.get("1-3-0") && that.collection.get("1-4-0")) ||
						(that.collection.get("1-4") && that.collection.get("1-4-0")))) {
							$("#"+id).parent().html($("#"+id).parent().html().replace(/\d+/,0));
						}
						else if (that.collection.meta("currentQuery")){
							var query = "SELECT COUNT() FROM "+that.model.get("fusion_table_id")+
										" WHERE '"+fusion_table_column+"' NOT EQUAL TO '"+notCase+"' AND "+
										that.collection.meta("currentQuery");
							that.countQuery(query,id);
						}
						else {
							var query = "SELECT COUNT() FROM "+that.model.get("fusion_table_id")+
										" WHERE '"+fusion_table_column+"' NOT EQUAL TO '"+notCase+"'";
							that.countQuery(query,id);
						}
					}
				});
			},
  		
			initialize: function(){
				$('#sequenced_qmark').popover({trigger:'hover'});
				$('#genotyped_qmark').popover({trigger:'hover'});
				$('#phenotyped_qmark').popover({trigger:'hover'});
				$('#exact_gps_qmark').popover({trigger:'hover'});
				$('#approx_gps_qmark').popover({trigger:'hover'});
				this.refreshCounts();
				this.collection.on('add remove reset',this.refreshCounts,this);	
			},
			
			render: function(){
				return this
			}
	});
  return FiltersView; 
  // What we return here will be used by other modules
});

