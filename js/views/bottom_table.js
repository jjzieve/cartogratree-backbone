//Filename: data_table.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',
  'jquery_migrate',
  'jquery_drag',
  'jquery_core',
  'jquery_widget',
  'jquery_mouse',
  'jquery_resizable',
  'jquery_sortable',
  'slick_core',
  'slick_grid',
  'slick_dataview',
  'slick_checkbox',
  'slick_selection',
  'models/query',
  'collections/queries',
  'dataTables',
  'tablesorter',
  'metadata',
  'tablecloth',
  'lazyjson',
  'bootstrap'
 ], function($, _, Backbone, QueryModel, QueriesCollection, dataTables){
	var BottomTableView = Backbone.View.extend({
		el: '#data_table',
    model: QueryModel,
    collection: QueriesCollection,
    showIcon: function (row, cell, value, columnDef, dataContext){
      return "<img class='inline_image' src='images/"+value+".png'>";
    },

    fourSigFigs: function(row, cell, value, columnDef, dataContext){
      console.log(value);
      return new Number(value).toPrecision(5);
    },

    toObj: function(a,i){
      var o = {};
      o["type"] = a[0];
      o["id"] = a[1]+"-"+i;//just because try-db is not unique
      o["lat"] = new Number(a[2]).toFixed(4);
      o["lng"] = new Number(a[3]).toFixed(4);
      o["sequences"] = a[4];
      o["genotypes"] = a[5];
      o["species"] = a[6];
      return o;
    },
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
    // events: {
    //   "click": "toggleSelection",
    //   // 'change :input' : 'updateValue'
    // },

    // toggleSelection: function(event){
    //   var row = $(event.target).closest('tr');
    //   var id = row.attr("id");
    //   row.toggleClass('selected');
    //   if (!(event.ctrlKey || event.metaKey)){ //if ctrl-click we want to not reset the selected classes (i.e. highlighted rows)
    //     $("#data_table .selected").not(row).removeClass("selected");
    //    }
    // },

    clearSlickGrid: function(){
      var data = [];//clear data
      var options = {
      enableCellNavigation: true,
      enableColumnReorder: true,
      forceFitColumns: true,
      rowHeight: 35
    };

    var columns = [
      {id: "type", name: "Type", field: "type",width: 100, sortable:true,formatter:this.showIcon},
      {id: "id", name: "ID", field: "id",width: 100, sortable:true},
      {id: "lat", name: "Latitude", field: "lat",width: 100, sortable:true,formatter:this.fourSigFigs},
      {id: "lng", name: "Longitude", field: "lng",width: 100, sortable:true,formatter:this.fourSigFigs},
      {id: "sequences", name: "Total sequences", field: "sequences",width: 200, sortable:true},
      {id: "genotypes", name: "Total genotypes", field: "genotypes",width: 200, sortable:true},
      {id: "species", name: "Species", field: "species",width: 200, sortable:true},
     ];

      $("#grid").empty();

      var checkboxSelector = new Slick.CheckboxSelectColumn({});
      columns.unshift(checkboxSelector.getColumnDefinition());

      dataView = new Slick.Data.DataView();
      grid = new Slick.Grid("#grid", dataView, columns, options);


      grid.setSelectionModel(new Slick.RowSelectionModel());
      grid.registerPlugin(checkboxSelector);

      dataView.beginUpdate();
      dataView.setItems(data);
      dataView.endUpdate();

      grid.updateRowCount();
      grid.render();

      dataView.syncGridSelection(grid, true);
      grid.resizeCanvas(); 


      console.log(grid.getDataLength());
    },

   updateSlickGrid: function(){
    var that = this;
      var options = {
      enableCellNavigation: true,
      enableColumnReorder: true,
      forceFitColumns: true,
      rowHeight: 35
    };

    var columns = [
      {id: "type", name: "Type", field: "type",width: 75, sortable:true,formatter:this.showIcon},
      {id: "id", name: "ID", field: "id",width: 150, sortable:true},
      {id: "lat", name: "Latitude", field: "lat",width: 100, sortable:true},
      {id: "lng", name: "Longitude", field: "lng",width: 100, sortable:true},
      {id: "sequences", name: "Total sequences", field: "sequences",width: 150, sortable:true},
      {id: "genotypes", name: "Total genotypes", field: "genotypes",width: 150, sortable:true},
      {id: "species", name: "Species", field: "species",width: 200, sortable:true},
     ];
      $("#grid").empty();
      $("#loading").show();
      $.ajax({
        url : 'getFusionMarkers.php',
        dataType: "json",
        data: {"sts_is_query":"SELECT%20icon_name,tree_id,lat,lng,num_sequences,num_genotypes,species%20FROM%201bL0GwAL_mlUutv9TVFqknjKLkwzq4sAn5mHiiaI",
          "tgdr_query":"SELECT%20icon_name,tree_id,lat,lng,num_sequences,num_genotypes,species%20FROM%20118Vk00La9Ap3wSg8z8LnZQG0mYz5iZ67o3uqa8M",
          "try_db_query":"SELECT%20icon_name,tree_id,lat,lng,num_sequences,num_genotypes,species%20FROM%201XwP3nc6H5_AUjdCjpXtrIlrSmtOHXr0Q9p_vrPw"},
      
        success: function (response) {
          var data = $.map(response,function(a,i){
            return that.toObj(a,i);
          });

          var checkboxSelector = new Slick.CheckboxSelectColumn({});
          columns.unshift(checkboxSelector.getColumnDefinition());

          dataView = new Slick.Data.DataView();
          grid = new Slick.Grid('#grid', dataView, columns, options);

          grid.setSelectionModel(new Slick.RowSelectionModel());
          grid.registerPlugin(checkboxSelector);

          var sortCol = undefined;
          var sortDir = true;
          function comparer(a, b) {
            var x = a[sortCol], y = b[sortCol];
            return (x == y ? 0 : (x > y ? 1 : -1));
          }
          grid.onSort.subscribe(function (e, args) {
              sortDir = args.sortAsc;
              sortCol = args.sortCol.field;
              dataView.sort(comparer, sortDir);
              grid.invalidateAllRows();
              grid.render();
          });

          // set the initial sorting to be shown in the header
          if (sortCol) {
              grid.setSortColumn(sortCol, sortDir);
          }

          dataView.beginUpdate();
          dataView.setItems(data);
          dataView.endUpdate();

          grid.updateRowCount();
          grid.render();

          dataView.syncGridSelection(grid, true);

          console.log(grid.getDataLength());
          $("#loading").hide();
        }
      });
    },


		initialize: function(){
      // $("#data_table_container").css({
      //   "background-image": "url(images/ajax-loader.gif)",
      //   "background-repeat" : "no-repeat",
      //   "background-position" : "center"
      // }).addClass("loading");
      // this.clearSlickGrid();
      this.updateSlickGrid();


      // var that = this;
      // this.$el.tablecloth({ 
      //   theme: "default", 
      //   sortable: true,
      //   condensed: true,
      //   striped: true,
      // });
      // $('#lazyjson').lazyjson({
      //   api: {
      //     uri: 'https://www.googleapis.com/fusiontables/v1/query?sql=SELECT icon_name,tree_id,lat,lng,num_sequences,num_genotypes,species FROM 118Vk00La9Ap3wSg8z8LnZQG0mYz5iZ67o3uqa8M&key=AIzaSyAZe9tkwFZ4EPTwed61u6wIl27KAGq81bw',
      //   },
      //   pagination: {
      //     appendResults: true
      //   },
      //   debug: true
      // })
      // $("#select_all").on('click', function(){ //could have created another view for this but thought it was overkill...
      //   $(this).toggleClass('active');
      //   if ($(this).hasClass("active")){
      //     $.each(that.$("input[type='checkbox']"),function(index,checkbox){
      //       $(checkbox).prop("checked",true);
      //     });
      //   }
      //   else{
      //     $.each(that.$("input[type='checkbox']"),function(index,checkbox){
      //       $(checkbox).prop("checked",false);
      //     });
      //   }

      //   // .toggleClass("checked");
      // });

      // $("#selected_markers_qmark").popover({trigger:'hover'});
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
		},

	});
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  return BottomTableView;
  // What we return here will be used by other modules
});

