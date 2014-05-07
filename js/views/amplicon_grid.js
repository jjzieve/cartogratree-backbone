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
    var AmpliconView = Backbone.View.extend({ 
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
      queryCache: [], //cache of ids to stored so redundant queries aren't made

      initColumns: function(){
        var that = this;
        this.columns = [
          {id: "id", name: "ID", field: "id",width: 35, sortable:true},
          {id: "amplicon_id", name: "Amplicon ID", field: "amplicon_id",width: 105, sortable:true},
          {id: "blast-nr", name: "Top Blast Description (BLAST nr)", field: "blast-nr",width: 250, sortable:true},
          {id: "blast-species", name: "Species-Specific BLASTs", field: "blast-species",width: 195, sortable:true},
          {id: "go", name: "GO Annotations", field: "go",width: 130, sortable:true},
          {id: "interpro", name: "Interpro Annotations", field: "interpro",width: 165, sortable:true},
          {id: "pfam", name: "PFAM Annotations", field: "pfam",width: 150, sortable:true},
          {id: "ec", name: "ExPASY EC Annotations", field: "ec",width: 185, sortable:true},
          {id: "tmhmmsignalp", name: "thmm / SignalP", field: "tmhmmsignalp",width: 120, sortable:true},
        ]; 
        this.checkboxSelector = new Slick.CheckboxSelectColumn({});
        this.columns.unshift(this.checkboxSelector.getColumnDefinition());
       },

      initGrid: function(){
        this.dataView = new Slick.Data.DataView();
        this.grid = new Slick.Grid("#amplicon_grid", this.dataView, this.columns, this.options);
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
            url : 'GetCommonAmplicon.php',
            dataType: "json",
            data: {"tid":checkedSamples.join()//GET url as string tid1,tid2,...
          },

            success: function (response) {
              that.data = response;
              if(that.data === null){
                $("#amplicon_table").prepend('<br><span id="amplicon_badge" class="badge">No common amplicons found.</span>');
              	that.unsetLoaderIcon();
		return false;
              }
              that.initColumns();
              that.initGrid();

              
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

              $("#amplicon_count").html(that.grid.getSelectedRows().length);// if first time rendered, set sample count off the bat
              that.listenToSelectedRows();
            },
		error: function(response){
     	           $("#amplicon_table").prepend('<br><span id="amplicon_badge" class="badge">Query error, please contact the admin.</span>');
		that.unsetLoaderIcon();
		}
          });
      },

    pollForOpenPill: function(){
      if(this.collection.meta("amplicon_pill_open")){
        this.updateSlickGrid();
      }
    },

    listenToSelectedRows: function(){
      if(this.grid){
        var that = this;
        this.grid.onSelectedRowsChanged.subscribe(function(){  // update selected count and set the sub collection to the selected ids
        $("#amplicon_count").html(that.grid.getSelectedRows().length);
          // that.collection.reset();//remove all previous ids
          // $.each(that.grid.getSelectedRows(), function(index,idx){ //add newly selected ones
          //   var id = that.dataView.getItemByIdx(idx)["id"];//.replace(/\.\d+$/,""); maybe add back in
          //   var lat = that.dataView.getItemByIdx(idx)["lat"]; //lat and lng for world_clim tool
          //   var lng = that.dataView.getItemByIdx(idx)["lng"];
          //   var index = index;
          //   that.collection.add({
          //     id: id,
          //     lat: lat,
          //     lng: lng,
          //     index: index
          //   }); 
          // });
          // that.collection.trigger("done");
      });
    }
  },

    initialize: function(options){
      var that = this;
      this.listenTo(this.collection,"done",this.pollForOpenPill);

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
      $("#amplicon_count").html(0); //reset selected count
      this.collection.reset(); // reset checked rows
    },

              
    events:{
      "click #remove_amplicons": "removeSelected",
    }

      
  });

  return AmpliconView; 
  // What we return here will be used by other modules
});

