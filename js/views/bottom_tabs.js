//Filename: data_tabs.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',    // lib/backbone/backbone
  'bootstrap',
  'models/tree_id',
  'collections/tree_ids',
], function($, _, Backbone, Tree_IDModel, Tree_IDCollection){
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  var BottomTabsView = Backbone.View.extend({
    el: "#tabs_container",
    model: Tree_IDModel,
    collection: Tree_IDCollection,

    events:{
      "click #tools ul li a" : "changeTitle",
      "click #run_tool" : "runTool"
    },

    changeTitle: function(e){
      $('#tools_title').html($(e.target).html());
      $("#tools ul li a").not(e.target).removeClass("selected");
      $(e.target).addClass('selected');
    },

    runTool: function(e){
      var tool = $("#tools ul li").find("a.selected").attr("id");
      console.log(tool);
      var ids = this.collection.pluck("id").join(","); 
      var lats = this.collection.pluck("lat").join(","); 
      var lngs = this.collection.pluck("lng").join(",");
      console.log(ids);
      console.log(lats);
      console.log(lngs);
      if(ids.length > 0){
        switch(tool){
          case 'common_amplicon_tool':
            break;
          case 'common_phenotype_tool':
            this.openCommonPhenoCSV(ids);
            break;
          case 'worldclim_tool':
            break;
          case 'common_snp_tool':
            this.openSNPCSV(ids);
            break;
          case 'diversitree_tool':
            this.openDiversitreeCSV(ids);
            break;
          case 'tassel_tool':
            this.openAssociationRRG(ids);
            break;
          case 'sswap_tool':
            break;
        }
      }
    },
    openCommonPhenoCSV: function(ids){
      $("#data_tabs").append("<li><a href='#common_amplicon' data-toggle='tab'>Common Phenotypes</a></li>");
      $("#data_table_container").append("<div class='tab-pane fade in'"+
       "style='background-image:url(images/ajax-loader.gif);background-repeat:no-repeat;background-position:center;'"+
       "id='common_phenotype_table'></div>");
      this.$("ul.nav-tabs li a:last").tab('show');
      window.location.href = 'GetCommonPheno.php?tid='+ids+'&csv';
    },
    openDiversitreeCSV: function(ids){
      window.location.href = 'DiversitreeDownload.php?tid='+ids+'&csv';
    },
     openSNPCSV: function(ids){
      window.location.href = 'GetSNPData.php?tid='+ids+'&csv';
    },
    openAssociationRRG: function(ids){
      window.location.href = 'AssociationRRG.php?tid='+ids;
    },

    initialize: function(){
      var that = this;
      this.$("ul.nav-tabs li a:first").tab('show');
         
    },

    render: function(){
      return this;
    }

  });
 
  return BottomTabsView; 
  // What we return here will be used by other modules
});

