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

        	ajaxPOST: function(url){
        		$.ajax({
				  dataType: "json",
				  type:'POST',
				  url: url,
				  data: data,
				  success: function(response){
				  	console.log(response);
				  }
				});
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

						var tgdrQuery = that.getCountQuery("tgdr",columnQuery);
						var sts_isQuery = that.getCountQuery("sts_is",columnQuery);
						var try_dbQuery = that.getCountQuery("try_db",columnQuery);
						var amerifluxQuery = that.getCountQuery("ameriflux",columnQuery);

						var url = that.model.get("fusion_table_query_url");
						var key = that.model.get("fusion_table_key");
						// that.ajaxPOST(url+tgdrQuery+key);
						$.getJSON(url+tgdrQuery+key).success(function(data){
							var tgdrCount = that.addCount(data);
		    				$.getJSON(url+sts_isQuery+key).success(function(data){
								var sts_isCount = that.addCount(data);
								$.getJSON(url+try_dbQuery+key).success(function(data){
	    							var try_dbCount = that.addCount(data); 
		    						$.getJSON(url+amerifluxQuery+key).success(function(data){
	    								var amerifluxCount = that.addCount(data); 
		    							// $("#"+id).parent().html($("#"+id).parent().html().replace(/\d+/,tgdrCount+sts_isCount+try_dbCount+amerifluxCount));
		    							$("#"+id+"_count").html(tgdrCount+sts_isCount+try_dbCount+amerifluxCount);
			    					});
		    					});
				 			});
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
				this.refreshCounts();
				console.log()
				this.collection.on('add remove reset',this.refreshCounts,this);	
			},
			
			render: function(){
				return this
			}
	});
  return FiltersView; 
  // What we return here will be used by other modules
});


