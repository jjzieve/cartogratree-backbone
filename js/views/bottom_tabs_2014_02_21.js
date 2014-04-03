//Filename: data_tabs.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',    // lib/backbone/backbone
  'bootstrap',
  'models/tree_id',
  'collections/tree_ids',
  'sswap',
  'tablesorter',
  'metadata',
  'tablecloth',
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
  // 'text!templates/default_tool_dropdown.html',
  // 'text!templates/sample_tool_dropdown.html',
], function($, _, Backbone, Tree_IDModel, Tree_IDCollection ){ //, DefaultToolTemplate, SampleToolTemplate){
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
//   String.prototype.capitalize = function() {
//     return this.charAt(0).toUpperCase() + this.slice(1);
// }
  var BottomTabsView = Backbone.View.extend({
    el: "#tabs_container",
    model: Tree_IDModel,
    //static html
    sampleToolHTML: '<li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:void(0);">Select tool</a></li>'+
                    '<li role="presentation"><a id="amplicon_tool" role="menuitem" tabindex="-1" href="javascript:void(0);">View Amplicons</a></li>'+
                    '<li role="presentation"><a id="phenotype_tool" role="menuitem" tabindex="-1" href="javascript:void(0);">View Traits</a></li>'+
                    '<li role="presentation"><a id="genotype_tool" role="menuitem" tabindex="-1" href="javascript:void(0);">View Genotypes</a></li>'+
                    '<li role="presentation"><a id="worldclim_tool" role="menuitem" tabindex="-1" href="javascript:void(0);">View Environmental Data</a></li>'+
                    '<li role="presentation"><a id="diversitree_tool" role="menuitem" tabindex="-1" href="javascript:void(0);">Download Diversitree input file</a></li>'+
                    '<li role="presentation" class="divider"></li>'+
                    '<li class="dropdown-header"><img src="images/sswapinfoicon.png"> sswap</li>'+
                    '<li role="presentation"><a id="tassel_tool" role="menuitem" tabindex="-1" href="javascript:void(0);">TASSEL</a></li>',
    sswapHTML: '<li role="presentation" class="divider"></li>'+
               '<li class="dropdown-header"><img src="images/sswapinfoicon.png"> sswap</li>'+
               '<li role="presentation"><a id="sswap_amplicon" role="menuitem" tabindex="-1" href="javascript:void(0);">Discover pipelines at SSWAP</a></li>',

    //dynamic templates
    defaultToolTemplate: _.template('<li role="presentation"><a id="<%= tool %>_csv" role="menuitem" tabindex="-1" href="javascript:void(0);">Download CSV</a></li>'),
    tabTemplate: _.template('<li id="<%= name %>_tab"><a href="#<%= name %>_tab_content" data-toggle="tab"><button class="close" type="button">x</button><%= label %></a></li>'),
    tabContentTemplate: _.template('<div id="<%= name %>_tab_content" class="tab-pane active">'+
                                    '<div class="button-wrapper" id="message_display_<%= name %>">'+
                                    '<button class="btn btn-default" type="button" id="remove_<%= name %>">'+
                                    'Remove selected samples</button></div>'+
                                    '<table><td valign="top" class="grid-col"><div id="<%= name %>_grid" class="grid"></div></td></table>'+
                                    'Total samples selected: <span id="<%= name %>_count">0</span></div>'),

    collection: Tree_IDCollection,
    events:{
      "click #tools ul li a" : "changeTitle",
      "click .close" : "closeTab",
      "click .run_tool" : "runTool",
      "show.bs.tab a[data-toggle='tab']" : "changeTools"    
    },

    changeTitle: function(e){
      $('#tools_title').html($(e.target).html());
      $("#tools ul li a").not(e.target).removeClass("selected");
      $(e.target).addClass('selected');
    },
  
    runTool: function(e){
      var tool = $("#tools ul li").find("a.selected").attr("id");
      console.log(tool);
      switch(tool){
        // case 'common_amplicon_tool':
	       //  this.openTab("amplicon");
        //   break;
        // case 'amplicons_tab_csv': //this may change
        //   var checked = $('#common_amplicon_table').find('input[type="checkbox"]:checked');
        //   var checked = _.pluck(checked,"value").join();
        //   window.location.href = 'GetCommonAmplicon.php?checkedAmplicons='+checked+'&csv';
           // break;
        case 'phenotype_tool':
	        this.openTab("phenotype","Traits");
          break;
        case 'phenotypes_tab_csv':
          window.location.href = 'GetCommonPheno.php?tid='+ids+'&csv';
          break;
        case 'worldclim_tool':
	        this.openTab("worldclim","Environmental data");
          break;
        case 'worldclims_tab_csv':
          window.location.href = 'GetWorldClimData.php?tid='+ids+'&csv';
          break;
        case 'genotype_tool':
	        this.openTab("genotype","Genotypes");
          break;
        case 'snps_tab_csv':
          window.location.href = 'GetCommonSNP.php?tid='+ids+'&csv';
          break;
        case 'diversitree_tool':
          this.openDiversitree(ids);
          break;
        case 'tassel_tool':
          this.openSSWAPTassel(ids);
          break;
      }
	       console.log(this.collection._meta);
    },

    setLoaderIcon: function(el){
    	$("#data_table_container").css({
        	"background-image": "url(images/ajax-loader.gif)",
          "background-repeat" : "no-repeat",
          "background-position" : "center"
    	}).addClass("loading");
    },  
    
    unsetLoaderIcon: function(el){
    	$("#data_table_container").css({"background-image":"none"}).removeClass("loading");
    },  

    // openCommonAmplicon: function(ids){
    //   var that = this;
    //   // only allow one tab for one type at a time

    //   $("#amplicon_tab").remove();
    //   $("#amplicon_phenotypes").remove();
    //   $("#data_tabs").append("<li id='amplicon_tab'><a href='#common_amplicons' data-toggle='tab'><button class='close' type='button'>x</button>Amplicons</a></li>");
    //   $("#data_table_container").append("<div id='common_amplicons' class='tab-pane active'>");
    //   this.setLoaderIcon("#data_table_container");
    //   this.$("ul.nav-tabs li a:last").tab('show');
    //   $.get('GetCommonAmplicon.php?tid='+ids, function(html){
    //     that.unsetLoaderIcon("#data_table_container");
    //     $("#common_amplicons").append(html);    
    //     $("#common_amplicon_table").tablecloth({
    //       theme: "default",
    //       condensed: true,
    //       striped: true,
    //       sortable: true,
    //     });
      
    //   });
    // },

    openTab: function(name,label){ // use a template
       // only allow one tab for one type at a time
      $("#"+name+"_tab").remove();
      $("#common_"+name).remove();
      $("#data_tabs").append(this.tabTemplate({"name":name,"label":label}));
      $("#data_table_container").append(this.tabContentTemplate({"name":name}));
      this.$("ul.nav-tabs li a:last").tab('show');
      this.collection.meta(name+"_tab_open",true);
      this.collection.trigger("done");
    },
   
    openDiversitree: function(ids){
      window.location.href = 'DiversitreeDownload.php?tid='+ids+'&csv';
    },
    openSSWAPTassel: function(ids){
    	var that = this;
    	$.getJSON('AssociationRRG.php?tid='+ids).success(function(jsonRRG){
          SSWAP.discover(jsonRRG, "#pipelineButton");
    	    $("#sswap_form").submit();
    	});
    },
    
    toggleRunDisabled: function(){
    	if(this.collection.length > 0){
    		$(".run_tool").removeClass("disabled");
    	}
    	else{
    		$(".run_tool").addClass("disabled");
    	}
   },

   changeTools: function(e){
    var id = $(e.target).parent().attr("id"); // activated tab
    // .substring(0, str.length - 1)
    $("#tools_dropdown").empty();
    $("#tools_title").html("Select tool");
    if(id === "samples_tab"){
      $("#tools_dropdown").append(this.sampleToolHTML);
    }
    else{
      $("#tools_dropdown").append(this.defaultToolTemplate({"tool":id}));
    }
    
   },

   closeTab: function(e){
      //there are multiple elements which has .closeTab icon so close the tab whose close icon is clicked
      var tabContentId = $(e.target).parent().attr("href");
      console.log($(e.target).parent().parent().attr("id"));
      switch(tabContentId){// send flag to the shared tree id collection that the tab is closed and to create instead of update
        case '#genotype_tab_content':
          this.collection.meta("genotype_tab_open",false);
          this.collection.trigger("close_genotype_tab");
          break;
        case '#phenotype_tab_content':
          this.collection.meta("phenotype_tab_open",false);
          this.collection.trigger("close_phenotype_tab");
          break;
        case '#amplicon_tab_content':
          this.collection.meta("amplicon_tab_open",false);
          this.collection.trigger("close_amplicon_tab");
          break;
        case '#world_tab_content':
          this.collection.meta("worldclim_tab_open",false);
          this.collection.trigger("close_worldclim_tab");
          break;
        default:
          console.log('default: '+tabContentId);
          break;
      }
      this.collection.trigger("done");// let this event bubble to the views after closing
      $(e.target).parent().parent().remove(); //remove li of tab
      this.$("ul.nav-tabs li a:last").tab('show'); // Select first tab
    //  $(tabContentId).remove(); //remove respective tab content
   },
	
    initialize: function(){
      var that = this;
      this.$("ul.nav-tabs li a:first").tab('show');
      // this.collection.on('add remove reset',this.toggleRunDisabled,this);
      this.listenTo(this.collection,'add remove reset',this.toggleRunDisabled);
      this.toggleRunDisabled();    

      //nested tabs
      $("ul.analysis_pills li a").click(function (e) {
        e.preventDefault();  
        $(this).tab('show');
      });
  
    },

    render: function(){
      return this;
    }

  });
 
  return BottomTabsView; 
});

