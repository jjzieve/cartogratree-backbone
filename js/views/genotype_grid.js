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
      type: "genotype", //workaround to get mixin listenTo functions to get called with no arguments
      model: Tree_IDModel,
      collection: Tree_IDCollection,

      initColumns: function(genotype_accessions,over_limit){
        if (over_limit){
          $("#message_display_genotype").text("25 of "+genotype_accessions.length+" columns shown. Download the CSV to view every genotype.");
        }
        else{
          $("#message_display_genotype").empty();
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

              that.unsetLoaderIcon();
              if(response["snp_accessions"].length === 0){
                $("#message_display_genotype").text("No genotypes found.");
                return false;
              }
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
              that.gridFunctions();

              $("#genotype_sample_count").html(that.grid.getSelectedRows().length);// if first time rendered, set sample count off the bat
              that.listenToSelectedRows();
            }
          });
      },

    initialize: function(options){
      var that = this;
      this.listenTo(this.collection,"done",this.pollForOpenTab);
      this.listenTo(this.collection,"close_genotype_tab", this.deleteGrid);

    },

    events:{
      "click #remove_genotype": "removeSelected",
    }

      
  });

  return GenotypeView; 
  // What we return here will be used by other modules
});

