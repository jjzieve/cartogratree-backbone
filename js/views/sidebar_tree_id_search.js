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

    genQuery: function(table){
      var table_id = this.collection.meta(table+"_id");
      return "SELECT tree_id FROM "+table_id;
    },
	
    unselectSideBarSelectionTree: function(){
      var that = this;
     //close selection tree if searching by ID
      $("#selection_tree").find(".selected").each(function(index){
        that.collection.reset();
        $(this).removeClass("selected");
      });
    },

    initialize: function(){
    	var that = this;
      var sts_is_query = encodeURIComponent(this.genQuery("sts_is"));
      var tgdr_query = encodeURIComponent(this.genQuery("tgdr"));
      var try_db_query = encodeURIComponent(this.genQuery("try_db"));
      $.ajax({
        url : 'QueryFusionTables.php',
        dataType: "json",
        data: {
          "sts_is_query":sts_is_query,
          "tgdr_query":tgdr_query,
          "try_db_query":try_db_query},
        success: function (response){
       		var select2Data = [];
          $.each(response,function(index,tree_id){
           	select2Data.push({id:tree_id[0],text:tree_id[0]});
          });

          that.$el.select2({
            placeholder: "Search for a tree id",
            data: select2Data,
            multiple: true,
            width: "resolve",
            minimumInputLength: 4,
          })
          .on("select2-opening",function(){
            that.unselectSideBarSelectionTree();
          });

        }
		  });
    },
  });

  return TreeIDSearchView; 
  // What we return here will be used by other modules
});

