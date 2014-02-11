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
    var SNPView = Backbone.View.extend({ 
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

      initColumns: function(snp_accessions,over_limit){
        if (over_limit){
          alert("Too many SNPs to load in view, only the first 25 columns shown. Please download the CSV to view every genotype.");
        }

        var that = this;
        this.columns = [
          {id:"id",name:"ID",field:"id",width:75,sortable:true}
        ]; //set the first columns
        _.each(snp_accessions,function(a,index){
          if (index > 25){
            return
          }
          that.columns.push({id:index,name:a,field:a,width:150,sortable:true});
        })
        this.checkboxSelector = new Slick.CheckboxSelectColumn({});
        this.columns.unshift(this.checkboxSelector.getColumnDefinition());
        this.snp_accessions = snp_accessions; //save state of columns if not new request
        
      },

      initGrid: function(){
        this.dataView = new Slick.Data.DataView();
        this.grid = new Slick.Grid("#snp_grid", this.dataView, this.columns, this.options);
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
            data: {"tid":checkedSamples.join()//GET url as string tid1,tid2,...
          },

            success: function (response) {
              var prev_accessions = that.snp_accessions;
              var new_accessions = response["snp_accessions"];
              if (!($(prev_accessions).not(new_accessions).length == 0 && $(new_accessions).not(prev_accessions).length == 0)) { //array comparator
                that.initColumns(response["snp_accessions"],response["over_limit"]);
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

              if (typeof(that.grid) === "undefined"){
                that.initGrid();
              }
              
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

              $("#snp_sample_count").html(that.grid.getSelectedRows().length);// if first time rendered, set sample count off the bat
              that.listenToSelectedRows();
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
    
    pollForOpenTab: function(){
      if(this.collection.meta("snp_tab_open")){
        this.updateSlickGrid();
      }
    },

    listenToSelectedRows: function(){
      if(this.grid){
        var that = this;
        this.grid.onSelectedRowsChanged.subscribe(function(){  // update selected count and set the sub collection to the selected ids
        $("#snp_sample_count").html(that.grid.getSelectedRows().length);
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
      $("#snp_sample_count").html(0); //reset selected count
      this.collection.reset(); // reset checked rows
    },

              
    events:{
      "click #remove_snps": "removeSelected",
    }

      
  });

  return SNPView; 
  // What we return here will be used by other modules
});

