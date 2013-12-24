//Filename: data_table.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',
  'models/query',
  'collections/queries',
  'dataTables',
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
      $.extend( $.fn.dataTableExt.oStdClasses, {
      "sWrapper": "dataTables_wrapper form-inline"
      } );
			this.$el.dataTable({
        "sDom": "<'row'<'col-2'f><'col-2'l>r>t<'row'<'col-2'i><'col-2'p>>",
        "sScrollY": "200px",
        "bPaginate": false,
        "bInfo": false,
        "bProcessing": true,
        "bServerSide": true,
        "bSortable": true,
        "aaSorting":[],
        // "sAjaxSource": "data/test_samples.JSON",
        "sAjaxDataProp" : "rows",
        "sAjaxSource": "https://www.googleapis.com/fusiontables/v1/query?sql=SELECT%20icon_name,tree_id,lat,lng,num_sequences,num_genotypes,species%20FROM%20118Vk00La9Ap3wSg8z8LnZQG0mYz5iZ67o3uqa8M%20WHERE%20%27year%27%20IN%20(%272010%27)&key=AIzaSyA2trAEtQxoCMr9vVNxOM7LiHeUuRDVqvk",
        "aoColumnDefs": [ {
          "aTargets": [ 0 ],
          // "mData": "download_link",
          "mRender": function ( data ) {
            return "<img src='images/"+data+".png'>";
          }
        },
        {
          "aTargets": [0,1,2,3,4,5],
          "bSortable":true
        } ]

        // "fnServerData": this.fusionTableObjectToArray(['icon_name', 'tree_id', 'lat', 'lng', 'num_sequences', 'num_genotypes', 'species'])

      });

      this.collection.on('add remove reset',this.populate,this); 
		},
    populate: function(){
      // console.log(this.collection.meta("currentQuery"));
      // var that = this;
      // if(this.collection.meta("currentQuery")){
      //   // this.$el.dataTable().fnClearTable();

      //   this.query = "SELECT tree_id FROM "+this.model.get("fusion_table_id")+" WHERE "+this.collection.meta("currentQuery");
      //   console.log(this.query);
      //   $.ajax({
      //     url: this.model.get("fusion_table_query_url")+this.query+this.model.get("fusion_table_key"),
      //     success : function(data){
      //       if(data.rows){
      //         _.each(data.rows, function(row){
      //          that.$el.dataTable().fnAddData([
      //             row[0],
      //             '',
      //             '',
      //             '',
      //           ]);
      //        });
      //      }
      //   },
      //   dataType: 'json'
      // });
      //   // $.getJSON(this.model.get("fusion_table_query_url")+
      //   //   this.query+
      //   //   this.model.get("fusion_table_key")).success(function(result){
      //   //     if(result.rows){
      //   //       _.each(result.rows, function(row){
      //   //        that.$el.dataTable().fnAddData([
      //   //           row[0],
      //   //           '',
      //   //           '',
      //   //           '',
      //   //         ]);
      //   //       })
              
      //   //     }
      //   //   });
      //   // this.$el.dataTable().fnDraw();

      // }


      },
	});
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  return BottomTableView;
  // What we return here will be used by other modules
});

