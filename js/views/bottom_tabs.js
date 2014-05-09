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
    sampleToolHTML: '<li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:void(0);">Tools</a></li>'+
                    '<li role="presentation"><a id="amplicon_tool" role="menuitem" tabindex="-1" href="javascript:void(0);">Find common amplicons</a></li>'+
                    '<li role="presentation"><a id="diversitree_tool" role="menuitem" tabindex="-1" href="javascript:void(0);">Download tree ids</a></li>'+
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
      "click #amplicon_tools ul li a" : "changeTitle",
      "click .close" : "closeTab",
      "click .run_tool" : "runTool",
      "click #genotype_tool" : "openTab",
      "click #phenotype_tool" : "openTab",
      "click #worldclim_tool" : "openTab",
      "show.bs.tab a[data-toggle='tab']" : "changeTools"    
    },

    changeTitle: function(e){//should probably encode parent as a data-* attribute
      var parent_id = $(e.target).parent().parent().parent().attr("id");
      $("#"+parent_id+"_title").html($(e.target).html());
      $("#"+parent_id+" ul li a").not(e.target).removeClass("selected");

      $(e.target).addClass('selected');
    },
  
    runTool: function(e){
      var parent_id = $(e.target).parent().parent().attr("id");
      var tool = $("#"+parent_id+" ul li").find("a.selected").attr("id");
      console.log(tool);
      var ids = this.collection.pluck('id');
      switch(tool){
        case 'amplicon_tool':
		      this.openAmpliconPill(ids);
        	break;
        case 'amplicons_tab_csv':
          // hack to get the checked amplicons without using slickgrid's API, I would've had to include the view 
          var checked = [];
          $('#amplicon_grid').find('input[type="checkbox"]:checked').each(function(index){
            checked.push($(this).parent().next().next().html());
          });
          window.location.href = 'GetCommonAmplicon.php?checkedAmplicons='+checked.join()+'&csv';
          break;
        case 'phenotypes_tab_csv':
          window.location.href = 'GetCommonPheno.php?tid='+ids+'&csv';
          break;
        case 'worldclims_tab_csv':
          window.location.href = 'GetWorldClimData.php?tid='+ids+'&csv';
          break;
        case 'snps_tab_csv':
          window.location.href = 'GetCommonSNP.php?tid='+ids+'&csv';
          break;
        case 'diversitree_tool':
      	  window.location.href = 'DiversitreeDownload.php?tid='+ids+'&csv';
          break;
        case 'tassel_tool':
          this.openSSWAPTassel(ids);
          break;
      }
    },
	
	openAmpliconPill: function(ids){
    $("#amplicon_pill").remove();
    $("#amplicon_pill_content").remove();
		$(".analysis_pills").append("<li id='amplicon_pill'><a data-toggle='pill' href='#amplicon_pill_content'>Amplicons</a></li>");
		$("#analysis_pills_content").append('<div class="tab-pane fade active in" id="amplicon_pill_content">'+
                                        '<div id="amplicon_tools" class="btn-group pull-right">'+
                                        '<button class="btn btn-default" type="button" data-toggle="dropdown"><span id="amplicon_tools_title">Select tool</span> <span class="caret"></span></button>'+
                                        '<ul id="tools_dropdown_amplicon" class="dropdown-menu">'+
                                        '<li role="presentation"><a id="amplicons_tab_csv" role="menuitem" tabindex="-1" href="javascript:void(0);">Download CSV</a></li>'+
                                        '<li role="presentation" class="divider"></li>'+
                                        '<li class="dropdown-header"><img src="images/sswapinfoicon.png"> sswap</li>'+
                                        '<li role="presentation"><a id="sswap_amplicon" role="menuitem" tabindex="-1" href="javascript:void(0);">Discover pipelines at SSWAP</a></li>'+
                                        '</ul>'+
                                        '<div class="btn-group">'+
                                        '<button type="button" class="btn btn-default run_tool">Run tool on selected</button></div>'+
                                        '</div>'+
                                        '<div id="amplicon_table_container">'+
                                        '<div class="btn-group">'+
                                        '<button class="btn btn-default" type="button" id="remove_amplicons">Remove selected amplicons</button>'+ 
                                        '</div>'+
                                         '<table id="amplicon_table">'+
                                         '<td valign="top" class="grid-col">'+
                                         '<div id="amplicon_grid" class="grid"></div>'+
                                         '</td>'+
                                         '</table>'+
                                         'Total samples selected: <span id="amplicon_count">0</span>'+
                                         '</div>'+
                                         '</div>');
		this.$("ul.nav-pills li a:last").tab('show');
    this.collection.meta("amplicon_pill_open",true);
    this.collection.trigger("done");
    console.log(this.collection._meta);
	},
		
    openTab: function(e){ // use a template
       // only allow one tab for one type at a time
      var id = e.target.id;
      var name = id.substring(0,id.indexOf("_"));//remove the _tool
      var label = $("#"+id).html();
      $("#"+name+"_tab").remove();
      $("#common_"+name).remove();
      $("#data_tabs").append(this.tabTemplate({"name":name,"label":label}));
      $("#data_table_container").append(this.tabContentTemplate({"name":name}));
      this.$("ul.nav-tabs li a:last").tab('show');
      this.collection.meta(name+"_tab_open",true);
      this.collection.trigger("done");
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

