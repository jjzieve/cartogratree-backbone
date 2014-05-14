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
      type: "phenotype", //workaround to get mixin listenTo functions to get called with no arguments
      model: Tree_IDModel,
      collection: Tree_IDCollection,

      initColumns: function(phenotypes){
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

    initialize: function(options){
      var that = this;
      this.listenTo(this.collection,"done",this.pollForOpenTab);
      this.listenTo(this.collection,"close_phenotype_tab", this.deleteGrid);

    },

    clearSlickGrid: function(){
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

