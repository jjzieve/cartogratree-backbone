//Filename: data_buttons.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',    // lib/backbone/backbone
  'models/tree_id',
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
], function($, _, Backbone, Tree_IDModel, Tree_IDCollection){
    // Above we have passed in jQuery, Underscore and Backbone
    // They will not be accessible in the global scope
    var GenotypeView = Backbone.View.extend({ 
      el: '#data_table_container',
      model: Tree_IDModel,
      collection: Tree_IDCollection,
      options: {
        enableCellNavigation: true,
        enableColumnReorder: true,
        // forceFitColumns: true,
        rowHeight: 35,
        topPanelHeight: 25
      },
      data: [],
      over_limit_html: _.template("<button class='btn btn-default' type='button' id='remove_genotype'>Remove selected samples</button> <span class='badge'>25 of <%= num_columns %> columns shown. Download the CSV to view every genotype.</span>"),
      no_genotypes_html: " <span class='badge'>No genotypes found. Please select a different set of samples</span>",

      arrayCmp: function(arr1,arr2){ //returns true if same elements and lengths of two arrays, not necessarily in same order
      return !($(arr1).not(arr2).length == 0 && $(arr1).not(arr2).length == 0);
      }, 

      initColumns: function(genotype_accessions,over_limit){
        if (over_limit){
          $("#message_display_genotype").html(this.over_limit_html({num_columns:genotype_accessions.length}));
        }
        if(genotype_accessions.length === 0){
          $("#message_display_genotype").append(this.no_genotypes_html);
        }
        var that = this;
        this.columns = [
          {id:"id",name:"ID",field:"id",width:150,sortable:true}
        ]; //set the first columns
        _.each(genotype_accessions,function(a,index){
          if (index > 25){
            return
          }
          that.columns.push({id:index,name:a,field:a,width:150,sortable:true});
        })
        this.checkboxSelector = new Slick.CheckboxSelectColumn({});
        this.columns.unshift(this.checkboxSelector.getColumnDefinition());
        this.genotype_accessions = genotype_accessions; //save state of columns if not new request
        
      },

      initGrid: function(){
        this.dataView = new Slick.Data.DataView();
        this.grid = new Slick.Grid("#genotype_grid", this.dataView, this.columns, this.options);
        this.grid.setSelectionModel(new Slick.RowSelectionModel());
        this.grid.registerPlugin(this.checkboxSelector);
      },



      updateSlickGrid: function(){
          var that = this;
          this.data = [];
          var checkedSamples = this.collection.pluck("id");
          console.log("checked: "+checkedSamples);
          // var query = _.difference(checkedSamples,_.pluck(this.data,"id"));//only query new ids
          //ameriflux? 
          this.setLoaderIcon();
          $.ajax({
            url : 'GetCommonSNP.php',
            dataType: "json",
            data: {"tid":checkedSamples.join()},//GET uri as string tid1,tid2,...
            success: function (response) {
              var prev_accessions = that.genotype_accessions;
              var new_accessions = response["snp_accessions"];
              if ( that.arrayCmp(prev_accessions,new_accessions) || typeof(this.columns) === "undefined") { 
                that.initColumns(response["snp_accessions"],response["over_limit"]);
                that.initGrid();
              }
              
              var i = 0;
              _.each(response["tree_ids"],function(value,key){
                var row = {};
                row["id"] = key;
                _.each(value,function(value){
                  row[value["snp_accession"]] = value["allele"];
                });
                that.data.push(row);
                i++;
              });

              // if (typeof(that.grid) === "undefined"){
              //   that.initGrid();
              // }

              that.unsetLoaderIcon();
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

              $("#genotype_sample_count").html(that.grid.getSelectedRows().length);// if first time rendered, set sample count off the bat
              that.listenToSelectedRows();
            }
          });
      },

    pollForOpenTab: function(){
      if(this.collection.meta("genotype_tab_open")){
        this.updateSlickGrid();
      }
    },

    deleteGrid: function(){
      delete this.columns;
      delete this.grid;
      delete this.dataView;
      delete this.prev_accessions;
    },

    listenToSelectedRows: function(){
      if(this.grid){
        var that = this;
        this.grid.onSelectedRowsChanged.subscribe(function(){  // update selected count and set the sub collection to the selected ids
        $("#genotype_count").html(that.grid.getSelectedRows().length);
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
        // that.collection.trigger("done");
      });
    }
  },

    initialize: function(options){
      var that = this;
      this.listenTo(this.collection,"done",this.pollForOpenTab);
      this.listenTo(this.collection,"close_genotype_tab", this.deleteGrid);

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

    clearSlickGrid: function(){
      // $("#clear_table").trigger("click");
      this.data = [];//clear data
      this.dataView.beginUpdate();
      this.dataView.setItems(this.data);
      this.dataView.endUpdate();

      this.grid.updateRowCount();
      this.grid.render();
      this.dataView.syncGridSelection(this.grid, true);
      $(".slick-column-name input[type=checkbox]").attr('checked',false);
      $("#genotype_count").html(0); //reset selected count
      this.collection.reset(); // reset checked rows
    },

              
    events:{
      "click #remove_genotype": "removeSelected",
    }

      
  });

  return GenotypeView; 
  // What we return here will be used by other modules
});

