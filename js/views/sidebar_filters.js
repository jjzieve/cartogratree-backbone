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
    		countQuery: function(query){
    			// var newCount = 0;
    			// $.getJSON(this.model.get("fusion_table_query_url")+
    			// 	tgdrQuery+fusion_table_column+whereClause+
    			// 	this.model.get("fusion_table_key")).success(function(data){
    			// 	if(data.rows){
    			// 		var tgdrCount = parseInt(data.rows[0][0]);
    			// 	}
    			// 	else{
    			// 		var tgdrCount = 0;
    			// 	}
    			// 	$("#"+id).parent().html($("#"+id).parent().html().replace(/\d+/,tgdrCount));

    			// }
    	// 		$.ajax({
    	// 			dataType: "json",
    	// 			async: false, //This could lead to slow load... but no other way to implement adding values from seperate ajax without nesting
    	// 			url: this.model.get("fusion_table_query_url")+query+this.model.get("fusion_table_key"),
    	// 			success: function(data){
    	// 				if(data.rows){
					// 		returnVal = parseInt(data.rows[0][0]);
					// 	}
					// }
    	// 		});	
    	// 		return returnVal;
    		},

			getColumn: function(column){//repeated from map view, not very DRY...
          		return (this.collection.filter(function(query){return query.get("column") === column}).map(function(query){return query.get("value")}));
        	},

			refreshCounts: function(){
				var that = this;
				this.$el.children().each(function(){ //check each filter/checkbox
					if($(this).find("input").attr("type")=="checkbox"){
						var tgdrCount = 0;
						var tgdrQuery = "SELECT COUNT() FROM "+that.collection.meta("tgdr_id")+" WHERE ";
						var sts_isCount = 0;
						var sts_isQuery = "SELECT COUNT() FROM "+that.collection.meta("sts_is_id")+" WHERE ";
						var try_dbCount = 0;
						var try_dbQuery = "SELECT COUNT() FROM "+that.collection.meta("trydb_id");
						//ignore ameriflux
						var id = $(this).find("input").attr("id");
						var fusion_table_column = "";
						var whereClause = " > 0";
						if (id == "phenotyped"){
							fusion_table_column = "num_phenotypes";
							// try_dbCount = that.countQuery(try_dbQuery);
						}
						if (id == "genotyped"){
							fusion_table_column = "num_genotypes";
						}
						if (id == "sequenced"){
							fusion_table_column = "num_sequences";
						}
						if (id == "exact_gps"){
							fusion_table_column = "is_exact_gps_coordinate";
							whereClause = "= 'true'";
						} 
						if (id == "approx_gps") {
							fusion_table_column = "is_exact_gps_coordinate";
							whereClause = "= 'false'";
						}

						if(that.getColumn("all").length>0){// if "all" node is selected
							$.getJSON(that.model.get("fusion_table_query_url")+
			    				tgdrQuery+fusion_table_column+whereClause+
			    				that.model.get("fusion_table_key")).success(function(data){
			    				if(data.rows){
			    					var tgdrCount = parseInt(data.rows[0][0]);
			    				}
			    				else{
			    					var tgdrCount = 0;
			    				}
			    				$.getJSON(that.model.get("fusion_table_query_url")+
			    					sts_isQuery+fusion_table_column+whereClause+
			    					that.model.get("fusion_table_key")).success(function(data){
			    						if(data.rows){
			    							var sts_isCount = parseInt(data.rows[0][0]);
			    						}
			    						else{
			    							var sts_isCount = 0;
			    						}
			    						if(id == "phenotyped"){
			    							$.getJSON(that.model.get("fusion_table_query_url")+
					    						try_dbQuery+
						    					that.model.get("fusion_table_key")).success(function(data){
						    						if(data.rows){
						    							var try_dbCount = parseInt(data.rows[0][0]);
						    							console.log(try_dbCount);
						    						}
						    						else{
						    							var try_dbCount = 0;
						    						}
								    				$("#"+id).parent().html($("#"+id).parent().html().replace(/\d+/,tgdrCount+sts_isCount+try_dbCount));
						    					});
						    			}
						    			else{
					    					$("#"+id).parent().html($("#"+id).parent().html().replace(/\d+/,tgdrCount+sts_isCount));
						    			}
			    					});
			    				});

			    		
							// tgdrCount = that.countQuery(tgdrQuery+fusion_table_column+whereClause);
							// sts_isCount = that.countQuery(sts_isQuery+fusion_table_column+whereClause);
						}
						// console.log(that.collection.meta("tgdrWhereClause"));
						// if (that.collection.meta("tgdrWhereClause")){
						// 	tgdrCount = that.countQuery(tgdrQuery+fusion_table_column+whereClause+' AND '+that.collection.meta("tgdrWhereClause"));
						// }
						// if (that.collection.meta("sts_isWhereClause")){
						// 	sts_isCount = that.countQuery(sts_isQuery+fusion_table_column+whereClause+' AND '+that.collection.meta("sts_isWhereClause"));
						// }
						// if(fusion_table_column == "num_phenotypes" && that.collection.meta("phenotypesWhereClause")){
						// 	try_dbCount = that.countQuery(try_dbQuery);
						// }

						// var newTotalCount = tgdrCount + sts_isCount + try_dbCount;
						// console.log(newTotalCount);

						//replaces the value in the DOM
						// console.log(that.collection.meta("tgdrWhereClause"));
						// console.log(that.collection.meta("sts_isWhereClause"));
						// console.log(that.collection.meta("phenotypesWhereClause"));
						// var notCase = "No" //default for genotyped and sequenced
						// // var defaultQuery = "SELECT COUNT() FROM "+that.model.get("fusion_table_id")+
						// // 				" WHERE '"+fusion_table_column+"' = 'false'";
						// if (id == "phenotyped") {
						// 	fusion_table_column = "phenotype"
						// 	notCase = "";
						// }
						// if (id == "exact_gps") {
						// 	fusion_table_column = "gps";
						// 	notCase = "estimate";
						// }
						// if (id == "approx_gps") {
						// 	fusion_table_column = "gps";
						// 	notCase = "exact";
						// }

						// if(that.collection.length == 0){
						// 	$("#"+id).parent().html($("#"+id).parent().html().replace(/\d+/,0));
						// } 
						// else if (that.collection.length == 1 && (that.collection.get("1-3") || that.collection.get("1-3-0") || that.collection.get("1-4") || that.collection.get("1-4-0"))) {
						// 	$("#"+id).parent().html($("#"+id).parent().html().replace(/\d+/,0));
						// }
						// else if 
						// (that.collection.length == 2 && //every combination involving only envrionmental or phenotypic, convoluted...
						// ((that.collection.get("1-3") && that.collection.get("1-3-0")) ||
						// (that.collection.get("1-3") && that.collection.get("1-4")) ||
						// (that.collection.get("1-3") && that.collection.get("1-4-0")) ||
						// (that.collection.get("1-3-0") && that.collection.get("1-4-0")) ||
						// (that.collection.get("1-4") && that.collection.get("1-4-0")))) {
						// 	$("#"+id).parent().html($("#"+id).parent().html().replace(/\d+/,0));
						// }
						// else if (that.collection.meta("currentQuery")){
						// 	var query = "SELECT COUNT() FROM "+that.model.get("fusion_table_id")+
						// 				" WHERE '"+fusion_table_column+"' NOT EQUAL TO '"+notCase+"' AND "+
						// 				that.collection.meta("currentQuery");
						// 	that.countQuery(query,id);
						// }
						// else {
						// 	var query = "SELECT COUNT() FROM "+that.model.get("fusion_table_id")+
						// 				" WHERE '"+fusion_table_column+"' NOT EQUAL TO '"+notCase+"'";
						// 	that.countQuery(query,id);
						// }
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


