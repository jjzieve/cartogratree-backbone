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
    				this.collection.meta("tgdrWhereClause",""); 
					this.collection.meta("sts_isWhereClause",""); //ameriflux and trydb are this by default 
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


    		countQuery: function(id,url,key,tgdrQuery,sts_isQuery,try_dbQuery,amerifluxQuery){// this ugly nested ajax call is only way to load asyncronously
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
    		},

			getColumn: function(column){//repeated from map view, not very DRY...
          		return (this.collection.filter(function(query){return query.get("column") === column}).map(function(query){return query.get("value")}));
        	},

			refreshCounts: function(){
				var that = this;
				this.$el.children().each(function(){ //check each filter/checkbox
					if($(this).find("input").attr("type")=="checkbox"){

						var tgdrQuery = "SELECT COUNT() FROM "+that.collection.meta("tgdr_id")+" WHERE ";
						var tgdrWhereClause = " > 0";

						var sts_isQuery = "SELECT COUNT() FROM "+that.collection.meta("sts_is_id")+" WHERE ";
						var sts_isWhereClause = " > 0";

						var try_dbQuery = "SELECT COUNT() FROM "+that.collection.meta("trydb_id")+" WHERE ";
						var try_dbWhereClause = " > 0";

						var amerifluxQuery = "SELECT COUNT() FROM "+that.collection.meta("ameriflux_id")+" WHERE ";
						var amerifluxWhereClause = " > 0";
						//ignore ameriflux
						var id = $(this).find("input").attr("id");
						var column = "";
						
						if (id == "phenotyped"){
							column = "num_phenotypes";
						}
						if (id == "genotyped"){
							column = "num_genotypes";
						}
						if (id == "sequenced"){
							column = "num_sequences";
						}
						if (id == "exact_gps"){
							column = "is_exact_gps_coordinate";
							tgdrWhereClause = "= 'true'";
							sts_isWhereClause = "= 'true'";
							try_dbWhereClause = "= 'true'";
							amerifluxWhereClause = "= 'true'";
						} 
						if (id == "approx_gps") {
							column = "is_exact_gps_coordinate";
							tgdrWhereClause = "= 'false'";
							sts_isWhereClause = "= 'false'";
							try_dbWhereClause = "= 'false'";
							amerifluxWhereClause = "= 'false'";
						}

						tgdrQuery = tgdrQuery + column + tgdrWhereClause;
						sts_isQuery = sts_isQuery + column + sts_isWhereClause;
						try_dbQuery = try_dbQuery + column + try_dbWhereClause;
						amerifluxQuery = amerifluxQuery + column + amerifluxWhereClause;
						if(that.getColumn("all").length>0){// if "all" node is selected
							that.countQuery(id,that.model.get("fusion_table_query_url"),that.model.get("fusion_table_key"),tgdrQuery,sts_isQuery,try_dbQuery,amerifluxQuery);
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


