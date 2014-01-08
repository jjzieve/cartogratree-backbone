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
		el: '#data_table_container',
    model: QueryModel,
    collection: QueriesCollection,
    options: {
      enableCellNavigation: true,
      enableColumnReorder: true,
      forceFitColumns: true,
      rowHeight: 35
    },

    // dataView: new Slick.Data.DataView(),


    showIcon: function (row, cell, value, columnDef, dataContext){
      return "<img class='inline_image' src='images/"+value+".png'>";
    },

    toObj: function(a,i){
      var o = {};
      o["type"] = a[0];
      o["id"] = a[1]+"."+i;//just because try-db is not unique
      o["lat"] = new Number(a[2]).toFixed(4);
      o["lng"] = new Number(a[3]).toFixed(4);
      o["sequences"] = a[4];
      o["genotypes"] = a[5];
      o["phenotypes"] = a[6];
      o["species"] = a[7];
      return o;
    },

    initColumns: function(){
      this.columns = [
        {id: "type", name: "Type", field: "type",width: 75, sortable:true,formatter:this.showIcon},
        {id: "id", name: "ID", field: "id",width: 150, sortable:true},
        {id: "lat", name: "Latitude", field: "lat",width: 100, sortable:true},
        {id: "lng", name: "Longitude", field: "lng",width: 100, sortable:true},
        {id: "sequences", name: "Total sequences", field: "sequences",width: 130, sortable:true},
        {id: "genotypes", name: "Total genotypes", field: "genotypes",width: 130, sortable:true},
        {id: "phenotypes", name: "Total phenotypes", field: "phenotypes",width: 135, sortable:true},
        {id: "species", name: "Species", field: "species",width: 150, sortable:true},
      ];
      this.checkboxSelector = new Slick.CheckboxSelectColumn({});
      this.columns.unshift(this.checkboxSelector.getColumnDefinition());
    },

    initGrid: function(){
      this.dataView = new Slick.Data.DataView();
      this.grid = new Slick.Grid("#grid", this.dataView, this.columns, this.options);
      this.grid.setSelectionModel(new Slick.RowSelectionModel());
      this.grid.registerPlugin(this.checkboxSelector);
    },

    getTableQueryRectangle: function(table,rectangleQuery){
      var table_id = this.collection.meta(table+"_id");
      var prefix = "SELECT icon_name,tree_id,lat,lng,num_sequences,num_genotypes,num_phenotypes,species FROM "+table_id;

      if (this.collection.meta(table+"WhereClause") == ""){
        return prefix + " WHERE " + rectangleQuery;
      }
      else if (typeof(this.collection.meta(table+"WhereClause")) !== "undefined"){
        return prefix+" WHERE "+rectangleQuery+" AND "+this.collection.meta(table+"WhereClause")
      }
      else{
        return prefix+" WHERE lat = 1000" // just a dumby url to return 0 on count()
      }
    },

    clearSlickGrid: function(){
      var data = [];//clear data

      // $("#grid").empty();

      // dataView = new Slick.Data.DataView();
      // grid = new Slick.Grid("#grid", dataView, this.columns, this.options);


      // this.grid.setSelectionModel(new Slick.RowSelectionModel());
      // this.grid.registerPlugin(this.checkboxSelector);

      this.dataView.beginUpdate();
      this.dataView.setItems(data);
      this.dataView.endUpdate();

      this.grid.updateRowCount();
      this.grid.render();

      this.dataView.syncGridSelection(this.grid, true);
      this.grid.resizeCanvas(); 
      //reset selected count
      $("#sample_count").html(0);
    },

    updateSlickGrid: function(rectangleQuery){
      var that = this;

      var sts_is_query = encodeURIComponent(this.getTableQueryRectangle("sts_is",rectangleQuery));
      var tgdr_query = encodeURIComponent(this.getTableQueryRectangle("tgdr",rectangleQuery));
      var try_db_query = encodeURIComponent(this.getTableQueryRectangle("try_db",rectangleQuery));
      console.log(sts_is_query);
      console.log(tgdr_query);
      console.log(try_db_query);

     
      // $("#grid").empty();
      this.setLoaderIcon();
      $.ajax({
        url : 'getFusionMarkers.php',
        dataType: "json",
        data: {"sts_is_query":sts_is_query,
          "tgdr_query":tgdr_query,
          "try_db_query":try_db_query},

        success: function (response) {
          that.unsetLoaderIcon();
          var data = $.map(response,function(a,i){
            return that.toObj(a,i);
          });

          // dataView = new Slick.Data.DataView();
          // grid = new Slick.Grid('#grid', dataView, that.columns, that.options);

          // grid.setSelectionModel(new Slick.RowSelectionModel());
          // grid.registerPlugin(that.checkboxSelector);

          var sortCol = undefined;
          var sortDir = true;
          function comparer(a, b) {
            var x = a[sortCol], y = b[sortCol];
            return (x == y ? 0 : (x > y ? 1 : -1));
          }
          that.grid.onSort.subscribe(function (e, args) {
              sortDir = args.sortAsc;
              sortCol = args.sortCol.field;
              dataView.sort(comparer, sortDir);
              that.grid.invalidateAllRows();
              that.grid.render();
          });
		
          // set the initial sorting to be shown in the header
          if (sortCol) {
              that.grid.setSortColumn(sortCol, sortDir);
          }

          that.dataView.beginUpdate();
          that.dataView.setItems(data);
          that.dataView.endUpdate();

          that.grid.updateRowCount();
          that.grid.render();

          that.dataView.syncGridSelection(that.grid, true);

      	  that.grid.onSelectedRowsChanged.subscribe(function(){ 
      		  $("#sample_count").html(that.grid.getSelectedRows().length);
      	  });

          $("#remove_selected").on("click", function(){//use backbone events
            var ids = that.dataView.mapRowsToIds(that.grid.getSelectedRows());
            $.each(ids,function(index,id){
              console.log("deleting: "+id);
              that.dataView.deleteItem(id);
            });
            that.grid.invalidate();
          });
          $("#clear_table").on("click", function(){
            that.clearSlickGrid();
          })

          console.log("Total samples: "+that.grid.getDataLength());
        }
      });
    },

	setLoaderIcon: function(){
		this.$el.css({
	   		"background-image": "url(images/ajax-loader.gif)",
	   		"background-repeat" : "no-repeat",
	   		"background-position" : "center"
    }).addClass("loading");
	},
	
	unsetLoaderIcon: function(){
 		this.$el.css({"background-image":"none"}).removeClass("loading");
	},
	
		
	refreshTable: function(){
		console.log("refreshTable");
    var rectangleQueryModel = this.collection.get("rectangle");
 		if (rectangleQueryModel != undefined){// a rectangle has been completed
			this.updateSlickGrid(rectangleQueryModel.get("value"));
		}
		else{//no rectangle and rectangle query is undefined
			this.clearSlickGrid();
		}
	},

	initialize: function(){
    this.initColumns();
    this.initGrid();
		this.clearSlickGrid();//clear at first
		this.collection.on('add remove reset',this.refreshTable,this);
	},

	});
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  return BottomTableView;
  // What we return here will be used by other modules
});

