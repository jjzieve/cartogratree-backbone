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

						$.getJSON(url+tgdrQuery+key).success(function(data){
		    				if(data.rows){
		    					var tgdrCount = parseInt(data.rows[0][0]);
		    				}
		    				else{
		    					var tgdrCount = 0;
		    				}
		    				// console.log(tgdrQuery +"\ttgdr\t"+ tgdrCount);
		    				$.getJSON(url+sts_isQuery+key).success(function(data){
								if(data.rows){
									var sts_isCount = parseInt(data.rows[0][0]);
								}
								else{
									var sts_isCount = 0;
								}
								// console.log(sts_isQuery+"\tsts_is\t" + sts_isCount);
								$.getJSON(url+try_dbQuery+key).success(function(data){
		    						if(data.rows){
		    							var try_dbCount = parseInt(data.rows[0][0]);
		    						}
		    						else{
		    							var try_dbCount = 0;
		    						}
		    						// console.log(try_dbQuery+"\ttry_db\t"+try_dbCount);
		    						$.getJSON(url+amerifluxQuery+key).success(function(data){
		    							if(data.rows){
		    								var amerifluxCount = parseInt(data.rows[0][0]);
			    						}
			    						else{
			    							var amerifluxCount = 0;
			    						}
			    						// console.log(amerifluxQuery+"\tameriflux\t"+amerifluxCount);
		    							$("#"+id).parent().html($("#"+id).parent().html().replace(/\d+/,tgdrCount+sts_isCount+try_dbCount+amerifluxCount));
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
				this.collection.on('add remove reset',this.refreshCounts,this);	
			},
			
			render: function(){
				return this
			}
	});
  return FiltersView; 
  // What we return here will be used by other modules
});


