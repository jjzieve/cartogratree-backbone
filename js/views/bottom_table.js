//Filename: data_table.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',
  'models/query',
  'collections/queries',
  'collections/tree_ids',
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
  'bootstrap'
 ], function($, _, Backbone, QueryModel, QueriesCollection, TreeIDCollection){
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
    data: [],

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
      ],
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
      console.log("deleting all, removing all rectangles");
      $("#clear_table").trigger("click"); // map view listens to this to remove rectangles
      this.data = [];//clear data
      this.dataView.beginUpdate();
      this.dataView.setItems(this.data);
      this.dataView.endUpdate();

      this.grid.updateRowCount();
      this.grid.render();
      $(".slick-column-name input[type=checkbox]").attr('checked',false); //should do this automatically but it doesn't for some reason...
      this.dataView.syncGridSelection(this.grid, true);
      $("#sample_count").html(0); //reset selected count
      this.sub_collection.reset(); //reset collection
    },

    updateSlickGrid: function(rectangleQuery){
      var that = this;

      var sts_is_query = encodeURIComponent(this.getTableQueryRectangle("sts_is",rectangleQuery));
      var tgdr_query = encodeURIComponent(this.getTableQueryRectangle("tgdr",rectangleQuery));
      var try_db_query = encodeURIComponent(this.getTableQueryRectangle("try_db",rectangleQuery));
     
      this.setLoaderIcon();
      $.ajax({
        url : 'getFusionMarkers.php',
        dataType: "json",
        data: {
          "sts_is_query":sts_is_query,
          "tgdr_query":tgdr_query,
          "try_db_query":try_db_query},

        success: function (response) {
          that.unsetLoaderIcon();
          that.data = that.data.concat($.map(response,function(a,i){
            return that.toObj(a,i);
          }));

          var sortCol = undefined;
          var sortDir = true;
          function comparer(a, b) {
            var x = a[sortCol], y = b[sortCol];
            return (x == y ? 0 : (x > y ? 1 : -1));
          }
          that.grid.onSort.subscribe(function (e, args) {
              sortDir = args.sortAsc;
              sortCol = args.sortCol.field;
              that.dataView.sort(comparer, sortDir);
              that.grid.invalidateAllRows();
              that.grid.render();
          });
		
          // set the initial sorting to be shown in the header
          if (sortCol) {
              that.grid.setSortColumn(sortCol, sortDir);
          }

          that.dataView.beginUpdate();
          that.dataView.setItems(that.data);
          that.dataView.endUpdate();

          that.grid.updateRowCount();
          that.grid.render();

          that.dataView.syncGridSelection(that.grid, true);

      	  that.grid.onSelectedRowsChanged.subscribe(function(){  // update selected count and set the sub collection to the selected ids
      		  $("#sample_count").html(that.grid.getSelectedRows().length);
            that.sub_collection.reset();//remove all previous ids
            $.each(that.grid.getSelectedRows(), function(index,idx){ //add newly selected ones
              var id = that.dataView.getItemByIdx(idx)["id"].replace(/\.\d+$/,"");
              var lat = that.dataView.getItemByIdx(idx)["lat"]; //lat and lng for world_clim tool
              var lng = that.dataView.getItemByIdx(idx)["lng"];
              that.sub_collection.add({
                id: id,
                lat: lat,
                lng: lng
              }); 
            });
      	  });

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

	initialize: function(options){
    this.sub_collection = options.sub_collection; //allows passing of tree_ids between this view and the tabs view
    var that = this;
    this.initColumns();
    this.initGrid();
		this.clearSlickGrid();//clear at first
		this.collection.on('add change remove',this.refreshTable,this); //possibly reset?
  },

  removeSelected: function(){
    var that = this;
    if (this.grid.getSelectedRows().length == this.grid.getDataLength()){ // clear if all selected, not iterate remove
      this.clearSlickGrid();
    }
    else{
      var ids = this.dataView.mapRowsToIds(this.grid.getSelectedRows());
      $.each(ids,function(index,id){
        console.log("deleting: "+id);
        that.dataView.deleteItem(id);
      });
      this.grid.invalidate();
    }
  },

            
  events:{
    "click #remove_selected": "removeSelected",
  }

	});
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  return BottomTableView;
  // What we return here will be used by other modules
});

