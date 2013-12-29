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
  'tablecloth',
  'bootstrap'
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
    events: {
      "click": "toggleSelection",
    },

    toggleSelection: function(event){
      var row = $(event.target).closest('tr');
      var id = row.attr("id");
      row.toggleClass('selected');
      if (!(event.ctrlKey || event.metaKey)){ //if ctrl-click we want to not reset the selected classes (i.e. highlighted rows)
        $("#data_table .selected").not(row).removeClass("selected");
       }
    },

		initialize: function(){
      this.$el.tablecloth({ 
        theme: "default", 
        sortable: true,
        condensed: true,
        striped: true,
      });
      $("#selected_markers_qmark").popover({trigger:'hover'});
      // $('#analysis_pane ul li a.active').prepend("<span id='selected_markers_qmark' "+
      //  "data-original-title='Selected tree samples' "+
      //  "data-content='Table displays markers selected via the selection cursor from the map above and allows for further processing"+
      //  "title='' data-toggle='popover'>"+
      //  "<a href='#'> <img src='images/qmark.png'></a></span>");

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

