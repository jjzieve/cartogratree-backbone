//Filename: data_table.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',
  'models/query',
  'collections/queries',
  'dataTables',
  'tablesorter',
  'metadata',
  'tablecloth'
 ], function($, _, Backbone, QueryModel, QueriesCollection, dataTables){
	var BottomTableView = Backbone.View.extend({
		el: '#data_table',
    model: QueryModel,
    collection: QueriesCollection,
    // fusionTableObjectToArray : function (aElements) { 
    //   return function ( sSource, aaData, fnCallback ) {
    //         $.ajax({
    //           "dataType":"json",
    //           "type":"GET",
    //           "url":sSource,
    //           "data":aaData,
    //           "success": function(json){
    //             var a = [];
    //             $.each(json["rows"], function(index, item) {  
    //               a.push(item);
    //             });
    //             json.aaData = a;
    //             fnCallback(json);
    //           }
    //         });
    //     }
    //   },
		initialize: function(){
      this.$el.tablecloth({ theme: "default", sortable: "true"});
   //    $.extend( $.fn.dataTableExt.oStdClasses, {
   //    "sWrapper": "dataTables_wrapper form-inline"
   //    } );
			// this.dataTable = this.$el.dataTable({
   //      "sDom": "<'row'<'col-2'f><'col-2'l>r>t<'row'<'col-2'i><'col-2'p>>",
   //      "sScrollY": "200px",
   //      "bPaginate": false,
   //      "bInfo": false,
   //      "bProcessing": true,
   //      // "bServerSide": true, //sorting doesn't work
   //      // "sAjaxSource": "data/test_samples.JSON",
   //      "sAjaxDataProp" : "rows",
   //      "sAjaxSource": "https://www.googleapis.com/fusiontables/v1/query?sql=SELECT%20icon_name,tree_id,lat,lng,num_sequences,num_genotypes,species%20FROM%20118Vk00La9Ap3wSg8z8LnZQG0mYz5iZ67o3uqa8M&key=AIzaSyA2trAEtQxoCMr9vVNxOM7LiHeUuRDVqvk",
   //      "aoColumnDefs": [ {
   //        "aTargets": [ 0 ],
   //        "mRender": function ( data ) {
   //          return "<img src='images/"+data+".png'>";
   //        }
   //      },
   //      ]

   //      // "fnServerData": this.fusionTableObjectToArray(['icon_name', 'tree_id', 'lat', 'lng', 'num_sequences', 'num_genotypes', 'species'])

   //    });

      this.collection.on('add remove reset',this.populate,this); 
		},
    populate: function(){

      },
	});
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  return BottomTableView;
  // What we return here will be used by other modules
});

