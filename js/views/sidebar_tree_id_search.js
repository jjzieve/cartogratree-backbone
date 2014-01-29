//Filename: data_buttons.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',    // lib/backbone/backbone
  'collections/queries',
  'select2'
], function($, _, Backbone,QueriesCollection){
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  var TreeIDSearchView = Backbone.View.extend({ 
	el: "#tree_id_search",
	collection: QueriesCollection,
	
	addTreeID: function(column,tree_id){
        	this.collection.add({
                	id: tree_id,
                        column: column,
                        value: tree_id
                }); 
        },  

        getColumn: function(column){
        	return (this.collection.filter(function(query){return query.get("column") === column}).map(function(query){return query.get("value")}));
        },  

	events: {
		"change":"addRemoveTreeID"
	},

	addRemoveTreeID: function(e) {
		if(e.added){
			var prefix = e.added.id.substr(0,4);
		 	if(prefix === "TGDR"){
	 			this.addTreeID("tree_id_tgdr",e.added.id);
 			}
			else if(prefix === "tryd"){//need to implement adding trydb-markers by id
			}
			else{//query the sts_is table
				this.addTreeID("tree_id_sts_is",e.added.id);
			}
		}
		if(e.removed){
			this.collection.remove(e.removed.id);
		}
	},

	
        initialize: function(){
        	var that = this;
                $.getJSON('data/all_markers.JSON',function(data){
               		var select2Data = [];
                        $.each(data,function(index,tree_id){
                        	select2Data.push({id:tree_id[0],text:tree_id[0]});
                         });

                         that.$el.select2({
                         	placeholder: "Search for a tree id",
                                data: select2Data,
                         	multiple: true,
				width: "resolve",
                        	minimumInputLength: 4,
                        });
		});

	},

  });

  return TreeIDSearchView; 
  // What we return here will be used by other modules
});

