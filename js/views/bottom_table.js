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
		initialize: function(){
			// this.$el.dataTable({
   //      "bProcessing": true,
   //      "bServerSide": true,
   //      "sAjaxSource": this.populate
   //    });
    // console.log("init");
    // $.extend( true, $.fn.dataTable.defaults,{
    //   "sDom": "<'row'<'col-6'f><'col-6'l>r>t<'row'<'col-6'i><'col-6'p>>",
    //   "sPaginationType": "bootstrap",
    //   "oLanguage": {
    //     "sLengthMenu": "Show _MENU_ Rows",
    //             "sSearch": ""
    //   }
    // });

    this.$el.dataTable({
      "sDom": "<'row'<'col-2'f><'col-2'l>r>t<'row'<'col-2'i><'col-2'p>>",
      "sScrollY": "200px",
      "bPaginate": false,
      "bScrollCollapse": true,
      "bInfo": false
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

