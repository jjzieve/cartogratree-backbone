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
    //should probably put prototypes like this in a seperate file
    Array.prototype.uniqueObjects = function(){
        function compare(a, b){
            for(var prop in a){
                if(a[prop] !== b[prop]){
                    return false;
                }
            }
            return true;
        }
        return this.filter(function(item, index, list){
            for(var i=0; i<index;i++){
                if(compare(item,list[i])){
                    return false;
                }
            }
            return true;
        });
    }

	var SamplesView = Backbone.View.extend({
		el: '#data_table_container',
    model: QueryModel,
    collection: QueriesCollection,
    options: {
      enableCellNavigation: true,
      enableColumnReorder: true,
      forceFitColumns: true,
      rowHeight: 35,
      topPanelHeight: 25
    },
    data: [],
//    sortcol: "id",
//    sortdir: 1,

    showIcon: function (row, cell, value, columnDef, dataContext){
      return "<img class='inline_image' src='images/"+value+".png'>";
    },

    toObj: function(a,i){
      var o = {};
      o["type"] = a[0];
      o["id"] = a[1];//+"."+i;//just because try-db is not unique
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


    updateSlickGrid: function(rectangleQuery){
      var that = this;
      var sts_is_query = encodeURIComponent(this.getTableQueryRectangle("sts_is",rectangleQuery));
      var tgdr_query = encodeURIComponent(this.getTableQueryRectangle("tgdr",rectangleQuery));
      var try_db_query = encodeURIComponent(this.getTableQueryRectangle("try_db",rectangleQuery));
    	//ameriflux? 
      this.setLoaderIcon();
      $.ajax({
        url : 'QueryFusionTables.php',
        dataType: "json",
        data: {
          "sts_is_query":sts_is_query,
          "tgdr_query":tgdr_query,
          "try_db_query":try_db_query},

        success: function (response) {
          that.unsetLoaderIcon();
          var filtered = _.filter(response,function(row){// checks for overlapping markers
            return _.pluck(that.data,"id").indexOf(row[1]) === -1
          });
          that.data = that.data.concat($.map(filtered,function(a,i){return that.toObj(a,i)}));
      	  that.data = that.data.uniqueObjects(["id"]);
          //DEBUG for "not unique ID"
      	  // var uniq_ids = _.uniq(_.pluck(that.data,"id")).length;
      	  // var data_ids = _.pluck(that.data,"id").length; 
      	  // console.log(uniq_ids,data_ids);

          that.gridFunctions();
          //console.log("Total samples: "+that.grid.getDataLength());
        }
      });
    },
		
	refreshTable: function(){
    var rectangleQueryModel = this.collection.get("rectangle");
 		if (rectangleQueryModel != undefined){// a rectangle has been completed
			this.updateSlickGrid(rectangleQueryModel.get("value"));
		}
		else{//no rectangle and rectangle query is undefined
			this.clearSlickGrid("sample");
		}
	},

  listenToSelectedRows: function(){
    var that = this;
    this.grid.onSelectedRowsChanged.subscribe(function(){  // update selected count and set the sub collection to the selected ids
      $("#sample_count").html(that.grid.getSelectedRows().length);
      that.sub_collection.reset();//remove all previous ids
      $.each(that.grid.getSelectedRows(), function(index,idx){ //add newly selected ones
        var id = that.dataView.getItemByIdx(idx)["id"];//.replace(/\.\d+$/,""); maybe add back in
        var lat = that.dataView.getItemByIdx(idx)["lat"]; //lat and lng for world_clim tool
        var lng = that.dataView.getItemByIdx(idx)["lng"];
        var index = index;
        that.sub_collection.add({
          id: id,
          lat: lat,
          lng: lng,
          index: index
        }); 
      });
      that.sub_collection.trigger("done");
    });
  },

	// updateSelectedRows: function(){
 //    this.grid.setSelectedRows(this.sub_collection.pluck("index"));
	// },

	initialize: function(options){
    this.sub_collection = options.sub_collection; //allows passing of tree_ids between this view and the tabs view
    var that = this;
    this.initColumns();
    this.initGrid();
		this.clearSlickGrid("sample");//clear at first
    this.listenToSelectedRows();
    // this.listenTo(this.sub_collection,'change_selection',this.updateSelectedRows);
		this.collection.on('add change remove',this.refreshTable,this); //possibly reset?

    

  //  $("#inlineFilterPanel").appendTo(this.grid.getTopPanel()).show();
  //   $("#txtSearch").keyup(function (e) {
  //     Slick.GlobalEditorLock.cancelCurrentEdit();

  //     // clear on Esc
  //     if (e.which == 27) {
  //       this.value = "";
  //     }

  //     that.searchString = this.value;
  //     console.log(searchString);
  //     that.updateFilter();
  // });
},

  removeSelected: function(){
    var that = this;
    if (this.grid.getSelectedRows().length == this.grid.getDataLength()){ // clear if all selected, not iterate remove
      this.clearSlickGrid("sample");
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

  sswapDemo: function(){
    var demoData = [{"type":"small_yellow","id":"GRI0001","lat":"45.4505","lng":"-119.6246","sequences":"0","genotypes":"647","phenotypes":"4","species":"Populus nigra"},{"type":"small_yellow","id":"GRI0002","lat":"45.4505","lng":"-119.6246","sequences":"0","genotypes":"643","phenotypes":"4","species":"Populus nigra"},{"type":"small_yellow","id":"GRI0003","lat":"45.4505","lng":"-119.6246","sequences":"0","genotypes":"648","phenotypes":"4","species":"Populus nigra"},{"type":"small_yellow","id":"GRI0004","lat":"45.4505","lng":"-119.6246","sequences":"0","genotypes":"646","phenotypes":"4","species":"Populus nigra"},{"type":"small_yellow","id":"GRI0005","lat":"45.4505","lng":"-119.6246","sequences":"0","genotypes":"646","phenotypes":"4","species":"Populus nigra"},{"type":"small_yellow","id":"GRI0006","lat":"45.4505","lng":"-119.6246","sequences":"0","genotypes":"644","phenotypes":"4","species":"Populus nigra"},{"type":"small_yellow","id":"GRI0007","lat":"45.4505","lng":"-119.6246","sequences":"0","genotypes":"650","phenotypes":"0","species":"Populus nigra"}];
    this.dataView.beginUpdate();
    this.dataView.setItems(demoData);
    this.dataView.endUpdate();

    this.grid.updateRowCount();
    this.grid.render();
    this.dataView.syncGridSelection(this.grid, true);
  },

            
  events:{
    "click #remove_samples": "removeSelected",
    "click #sswap_demo": "sswapDemo"
  }


  //filtering code

  // updateFilter: function() {
  //   this.dataView.setFilterArgs({
  //     searchString: this.searchString
  //   });
  //   this.dataView.refresh();
  // },

  // myFilter: function(item, args) {
  //   if (args.searchString != "" && item["id"].indexOf(args.searchString) == -1) {
  //     return false;
  //   }

  //   return true;
  // },

  // toggleFilterRow: function(){
  //   this.grid.setTopPanelVisibility(!this.grid.setOptions().showTopPanel);
  // },


	});
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  return SamplesView;
  // What we return here will be used by other modules
});

