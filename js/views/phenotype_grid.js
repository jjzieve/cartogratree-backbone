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
    var PhenotypeView = Backbone.View.extend({ 
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

      arrayCmp: function(arr1,arr2){ //returns true if same elements and lengths of two arrays, not necessarily in same order
      return !($(arr1).not(arr2).length == 0 && $(arr1).not(arr2).length == 0);
      }, 

      initColumns: function(phenotypes){
        if(phenotypes.length === 0){
          $("#message_display_phenotype").append(this.no_phenotypes_html);
        }
        var that = this;
        this.columns = [
          {id:"id",name:"ID",field:"id",width:75,sortable:true}
        ]; //set the first columns
        _.each(phenotypes,function(a,index){
          if (index > 25){
            return
          }
          that.columns.push({id:index,name:a,field:a,width:350,sortable:true});
        })
        this.checkboxSelector = new Slick.CheckboxSelectColumn({});
        this.columns.unshift(this.checkboxSelector.getColumnDefinition());
        this.phenotypes = phenotypes; //save state of columns if not new request
        
      },

      initGrid: function(){
        this.dataView = new Slick.Data.DataView();
        this.grid = new Slick.Grid("#phenotype_grid", this.dataView, this.columns, this.options);
        this.grid.setSelectionModel(new Slick.RowSelectionModel());
        this.grid.registerPlugin(this.checkboxSelector);
      },

	
      updateSlickGrid: function(){
          var that = this;
          this.data = [];
          var checkedSamples = this.collection.pluck("id");

          this.setLoaderIcon();
          $.ajax({
            url : 'GetCommonPheno.php',
            dataType: "json",
            data: {"tid":checkedSamples.join()},//GET uri as string tid1,tid2,...
            success: function (response) {
              that.unsetLoaderIcon();
          		if(response === null){
          			$("#message_display_phenotype").text('No phenotypes found.');
          			return false;
          		}
              else{
                $("#message_display_phenotype").empty();
              }
              var prev_phenotypes = that.prev_phenotypes;
              var new_phenotypes = response["phenotypes"];
              if ( that.arrayCmp(prev_phenotypes,new_phenotypes) || typeof(this.columns) === "undefined") { 
                that.initColumns(response["phenotypes"]);
                that.initGrid();
              }
              
              var i = 0;
              _.each(response["tree_ids"],function(value,key){
                var row = {};
                row["id"] = key;
                _.each(value,function(value){
                  row[value["phenotype"]] = value["value"];
                });
                that.data.push(row);
                i++;
              });

              that.gridFunctions();
              
              $("#phenotype_count").html(that.grid.getSelectedRows().length);// if first time rendered, set sample count off the bat
              that.listenToSelectedRows();
            }
          });
      },

    pollForOpenTab: function(){
      if(this.collection.meta("phenotype_tab_open")){
        this.updateSlickGrid();
      }
    },

    listenToSelectedRows: function(){
      if(this.grid){
        var that = this;
        this.grid.onSelectedRowsChanged.subscribe(function(){  // update selected count and set the sub collection to the selected ids
        $("#phenotype_count").html(that.grid.getSelectedRows().length);
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
      this.listenTo(this.collection,"close_phenotype_tab", this.deleteGrid);

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
      $("#phenotype_count").html(0); //reset selected count
      this.collection.reset(); // reset checked rows
    },

              
    events:{
      "click #remove_phenotype": "removeSelected",
    }

      
  });

  return PhenotypeView; 
  // What we return here will be used by other modules
});

