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
				"click input[type=checkbox]": "toggleFilter"
			},

			toggleFilter : function(event){
    			var filter = event.target.id;
   				if ($('#'+filter).is(":checked")) {
   					this.collection.add(
   					{
   						id: filter, // so it can be removed
   						filter: filter
   					});   					
   				}
   				else {
   					this.collection.remove(filter);    				
   				}
    		},

			getColumn: function(column){//repeated from map view, not very DRY...
          		return (this.collection.filter(function(query){return query.get("column") === column}).map(function(query){return query.get("value")}));
        	},

        	getCountQuery: function(table,columnQuery){
        		var table_id = this.collection.meta(table+"_id");
        		var prefix = "SELECT COUNT() FROM "+table_id+" WHERE "+columnQuery; 
        		if (this.collection.meta(table+"WhereClause") == ""){
        			return prefix;
        		}
        		else if (typeof(this.collection.meta(table+"WhereClause")) !== "undefined"){
        			return prefix+" AND "+this.collection.meta(table+"WhereClause")
        		}
        		else{
        			return prefix+" AND lat = 1000" // just a dumby url to return 0 on count()
        		}
        	},

        	addCount: function(data){
			    if(data.rows){
					return parseInt(data.rows[0][0]);
				}
				else{
					return 0;
				}
        	},

 
			refreshCounts: function(){
				var that = this;
				this.$el.children().each(function(){ //check each filter/checkbox
					if($(this).find("input").attr("type")=="checkbox"){
						var id = $(this).find("input").attr("id");

						if (id == "sequenced"){
							var columnQuery = "num_sequences > 0";
						}
						else if (id == "genotyped"){
							var columnQuery = "num_genotypes > 0";
						}
						else if (id == "phenotyped"){
							var columnQuery = "num_phenotypes > 0";
						}
						else if(id == "exact_gps"){
							var columnQuery = "is_exact_gps_coordinate = 'true'";
						}
						else{
							var columnQuery = "is_exact_gps_coordinate = 'false'";
						}

						var tgdrQuery = encodeURIComponent(that.getCountQuery("tgdr",columnQuery));
						var sts_isQuery = encodeURIComponent(that.getCountQuery("sts_is",columnQuery));
						var try_dbQuery = encodeURIComponent(that.getCountQuery("try_db",columnQuery));
						var amerifluxQuery = encodeURIComponent(that.getCountQuery("ameriflux",columnQuery));

						var url = that.model.get("fusion_table_query_url");
						var key = that.model.get("fusion_table_key");
						//ameriflux?
						$.ajax({
        						url : 'QueryFusionTables.php',
      							dataType: "json",
      							data: {
      							    "sts_is_query":sts_isQuery,
      							    "tgdr_query":tgdrQuery,
      							    "try_db_query":try_dbQuery},
							success: function(response){
								var counts = _.map(_.flatten(response),function(n){return parseInt(n)});
								if (counts.length > 0){
									var sum = _.reduce(counts,function(first,next){return first+next;});
								}
								else{
		    						var sum = 0;	
		    					}
		    					$("#"+id+"_count").html(sum);
							}
						});
					}

				});
			},
  		
			initialize: function(){
				$('#sequenced_qmark').popover({trigger:'hover'});
				$('#genotyped_qmark').popover({trigger:'hover'});
				$('#phenotyped_qmark').popover({trigger:'hover'});
				$('#exact_gps_qmark').popover({trigger:'hover'});
				$('#approx_gps_qmark').popover({trigger:'hover'});
				// $("#exact_gps").attr('checked',true); // do we really need this?
				// $("#approx_gps").attr('checked',true);
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


