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
	var WorldClimView = Backbone.View.extend({
		el: '#data_table_container',
    model: QueryModel,
    collection: QueriesCollection,
    options: {
      enableCellNavigation: true,
      enableColumnReorder: true,
      // forceFitColumns: true,
      rowHeight: 35,
      topPanelHeight: 25
    },
    data: [],

    initColumns: function(){
      this.columns = [
        {id: "id", name: "ID", field: "id",width: 75, sortable:true},
        {id:"mat", name: "Annual Mean Temperature [°C]", field:"mat",width:225,sortable:true},
        {id:"tar", name: "Temperature Annual Range [°C]", field:"tar",width:230,sortable:true},
        {id:"maxtwm", name: "Max Temperature of Warmest Month [°C]", field:"maxtwm",width:300,sortable:true},
        {id:"anntmin", name: "Min Temperature of Coldest Month [°C]", field:"anntmin",width:300,sortable:true},
        {id:"meantdq", name: "Mean Temperature of Driest Quarter [°C]", field:"meantdq",width:300,sortable:true},
        {id:"meantwq", name: "Mean Temperature of Wettest Quarter [°C]", field:"meantwq",width:300,sortable:true},
        {id:"meantwaq", name: "Mean Temperature of Warmest Quarter [°C]", field:"meantwaq",width:310,sortable:true},
        {id:"meantcq", name: "Mean Temperature of Coldest Quarter [°C]", field:"meantcq",width:300,sortable:true},
        {id:"tsd", name: "Temperature Seasonality [CV]", field:"tsd",width:225,sortable:true},
        {id:"mdr", name: "Mean Diurnal Range [°C]", field:"mdr",width:225,sortable:true},
        {id:"iso", name: "Isothermality [°C]", field:"iso",width:150,sortable:true},
        {id:"annprec", name: "Annual Precipitation [mm]", field:"annprec",width:225,sortable:true},
        {id:"precwm", name: "Precipitation of Wettest Month [mm]", field:"precwm",width:275,sortable:true},
        {id:"precdm", name: "Precipitation of Driest Month [mm]", field:"precdm",width:275,sortable:true},
        {id:"precwq", name: "Precipitation of Wettest Quarter [mm]", field:"precwq",width:275,sortable:true},
        {id:"precdq", name: "Precipitation of Driest Quarter [mm]", field:"precdq",width:275,sortable:true},
        {id:"precwarmq", name: "Precipitation of Warmest Quarter [mm]", field: "precwarmq",width:280,sortable:true},
        {id:"preccq", name: "Precipitation of Coldest Quarter [mm]", field:"preccq",width:275,sortable:true},
        {id:"precs", name: "Precipitation Seasonality [CV]", field:"precs",width:250,sortable:true}
      ]
      this.checkboxSelector = new Slick.CheckboxSelectColumn({});
      this.columns.unshift(this.checkboxSelector.getColumnDefinition());
    },

    initGrid: function(){
      this.dataView = new Slick.Data.DataView();
      this.grid = new Slick.Grid("#worldclim_grid", this.dataView, this.columns, this.options);
      this.grid.setSelectionModel(new Slick.RowSelectionModel());
      this.grid.registerPlugin(this.checkboxSelector);
    },

    clearSlickGrid: function(){
      $("#clear_table").trigger("click"); // map view listens to this to remove rectangles
      this.data = [];//clear data
      this.dataView.beginUpdate();
      this.dataView.setItems(this.data);
      this.dataView.endUpdate();

      this.grid.updateRowCount();
      this.grid.render();
      $(".slick-column-name input[type=checkbox]").attr('checked',false); //should do this automatically but it doesn't for some reason...
      this.dataView.syncGridSelection(this.grid, true);
      $("#worldclim_count").html(0); //reset selected count
      this.collection.reset(); //reset collection
    },

    getCleanedIDs: function(){
      var cleaned = _.map(_.pluck(this.data,"id"),function(id){
        return id.substr(0,id.indexOf('.'))
      });
      return cleaned;
    },

    updateSlickGrid: function(){
      var that = this;
      var ids = this.collection.pluck("id").join(","); 
      var lats = this.collection.pluck("lat").join(","); 
      var lngs = this.collection.pluck("lng").join(",");
      if(typeof(this.grid) === "undefined"){ // first instantiation
        this.initColumns();
        this.initGrid();
        // this.clearSlickGrid();//clear at first
        this.listenToSelectedRows(); 
      }

      this.setLoaderIcon();
      $.ajax({
        url : 'GetWorldClimData.php',
        dataType: "json",
        data: {
          "id":ids,
          "lat":lats,
          "lon":lngs},

        success: function (response) {
          that.unsetLoaderIcon();
          var prev_ids = _.pluck(that.data,"id");
          var filtered = _.filter(response,function(row){// checks for overlapping markers
            return prev_ids.indexOf(row["id"]) === -1;
          });
          that.data = that.data.concat(filtered);
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
          that.grid.setSelectedRows(that.collection.pluck("index"));
          that.dataView.endUpdate();

          that.grid.updateRowCount();
          that.grid.render();

          that.dataView.syncGridSelection(that.grid, true);


          //console.log("Total samples: "+that.grid.getDataLength());
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
	
		
  listenToSelectedRows: function(){
    var that = this;
    this.grid.onSelectedRowsChanged.subscribe(function(){  // update selected count and set the sub collection to the selected ids
      $("#worldclim_count").html(that.grid.getSelectedRows().length);
      that.collection.reset();//remove all previous ids
      $.each(that.grid.getSelectedRows(), function(index,idx){ //add newly selected ones
        var id = that.dataView.getItemByIdx(idx)["id"];//.replace(/\.\d+$/,""); maybe add back in
        var lat = that.dataView.getItemByIdx(idx)["lat"]; //lat and lng for world_clim tool
        var lng = that.dataView.getItemByIdx(idx)["lng"];
        var index = index;
        that.collection.add({
          id: id,
          lat: lat,
          lng: lng,
          index: index
        }); 
      });
    //   that.sub_collection.trigger("done");
    });
  },

    deleteGrid: function(){
      delete this.columns;
      delete this.grid;
      delete this.dataView;
    },

  pollForOpenTab: function(){
    if(this.collection.meta("worldclim_tab_open")){
      this.updateSlickGrid();
      this.listenTo(this.collection,"close_worldclims_tab", this.deleteGrid);
    }
  },

	initialize: function(options){
    this.listenTo(this.collection,"done",this.pollForOpenTab);
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
    "click #remove_worldclims": "removeSelected",
  }

	});
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  return WorldClimView;
  // What we return here will be used by other modules
});

