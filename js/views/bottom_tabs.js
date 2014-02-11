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
  var BottomTabsView = Backbone.View.extend({
    el: "#tabs_container",
    model: Tree_IDModel,
    sampleToolHTML: '<li role="presentation"><a role="menuitem" tabindex="-1" href="javascript:void(0);">Select tool</a></li>'+
                    '<li role="presentation"><a id="common_amplicon_tool" role="menuitem" tabindex="-1" href="javascript:void(0);">View Amplicons</a></li>'+
                    '<li role="presentation"><a id="common_phenotype_tool" role="menuitem" tabindex="-1" href="javascript:void(0);">View Traits</a></li>'+
                    '<li role="presentation"><a id="common_snp_tool" role="menuitem" tabindex="-1" href="javascript:void(0);">View Genotypes</a></li>'+
                    '<li role="presentation"><a id="worldclim_tool" role="menuitem" tabindex="-1" href="javascript:void(0);">View Environmental Data</a></li>'+
                    '<li role="presentation"><a id="diversitree_tool" role="menuitem" tabindex="-1" href="javascript:void(0);">Download Diversitree input file</a></li>'+
                    '<li role="presentation" class="divider"></li>'+
                    '<li class="dropdown-header"><img src="images/sswapinfoicon.png"> sswap</li>'+
                    '<li role="presentation"><a id="tassel_tool" role="menuitem" tabindex="-1" href="javascript:void(0);">TASSEL</a></li>',
    defaultToolTemplate: _.template('<li role="presentation"><a id="<%= tool %>_csv" role="menuitem" tabindex="-1" href="javascript:void(0);">Download CSV</a></li>'),
    collection: Tree_IDCollection,
    events:{
      "click #tools ul li a" : "changeTitle",
      "click .close" : "closeTab",
      "click #run_tool" : "runTool",
      "show.bs.tab a[data-toggle='tab']" : "changeTools"    
    },

    changeTitle: function(e){
      $('#tools_title').html($(e.target).html());
      $("#tools ul li a").not(e.target).removeClass("selected");
      $(e.target).addClass('selected');
    },
    
    closeTab: function(e){
        //there are multiple elements which has .closeTab icon so close the tab whose close icon is clicked
        var tabContentId = $(e.target).parent().attr("href");

        switch(tabContentId){// send flag to the shared tree id collection that the tab is closed and to create instead of update
          case '#common_snps':
            this.collection.meta("snp_tab_open",false);
            console.log("common_snps closed");
            break;
          case '#common_phenotypes':
            this.collection.meta("phenotype_tab_open",false);
            break;
          case '#common_amplicons':
            this.collection.meta("amplicon_tab_open",false);
            break;
          case '#world_clims':
            this.collection.meta("worldclim_tab_open",false);
            break;
          default:
            console.log('default: '+tabContentId);
            break;
        }
        $(e.target).parent().parent().remove(); //remove li of tab
        this.$("ul.nav-tabs li a:last").tab('show'); // Select first tab
        $(tabContentId).remove(); //remove respective tab content
        
    },
    

    runTool: function(e){
      var tool = $("#tools ul li").find("a.selected").attr("id");
      var ids = this.collection.pluck("id").join(","); 
      var lats = this.collection.pluck("lat").join(","); 
      var lngs = this.collection.pluck("lng").join(",");
      if(ids.length > 0){
        switch(tool){
          case 'common_amplicon_tool':
		        this.openCommonAmplicon(ids);
            this.collection.meta("amplicon_tab_open",true);
            break;
          case 'amplicons_tab_csv': //this may change
            var checked = $('#common_amplicon_table').find('input[type="checkbox"]:checked');
            var checked = _.pluck(checked,"value").join();
            window.location.href = 'GetCommonAmplicon.php?checkedAmplicons='+checked+'&csv';
            break;
          case 'common_phenotype_tool':
            this.openCommonPheno(ids);
            this.collection.meta("phenotype_tab_open",true);
            this.collection.trigger("done");
            break;
          case 'phenotypes_tab_csv':
            window.location.href = 'GetCommonPheno.php?tid='+ids+'&csv';
            break;
          case 'worldclim_tool':
            this.openWorldClim(ids,lats,lngs);
            this.collection.meta("worldclim_tab_open",true);
            break;
          case 'worldclims_tab_csv':
            window.location.href = 'GetWorldClimData.php?tid='+ids+'&csv';
            break;
          case 'common_snp_tool':
            this.openSNP(ids);
            this.collection.meta("snp_tab_open",true);
            this.collection.trigger("done");
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
      }
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

    openCommonPheno: function(ids){
    	var that = this;
    	// only allow one tab for one type at a time
    	$("#phenotypes_tab").remove();
    	$("#common_phenotypes").remove();
      $("#data_tabs").append("<li id='phenotypes_tab'><a href='#common_phenotypes' data-toggle='tab'><button class='close' type='button'>x</button>Traits</a></li>");
    	$("#data_table_container").append("<div id='common_phenotypes' class='tab-pane active'>");
    					 // "<div class='button-wrapper'><button class='btn btn-default' type='button' id='phenotype_csv'>Download CSV</button></div></div>");				
      // $("#tools_dropdown").clear();
      // $("#tools_dropdown").append('<li role="presentation"><a id="phenotype_csv" role="menuitem" tabindex="-1" href="javascript:void(0);">Download CSV</a></li>');

    	this.setLoaderIcon("#data_table_container");
     	this.$("ul.nav-tabs li a:last").tab('show');
    	$.get('GetCommonPheno.php?tid='+ids, function(html){
    		that.unsetLoaderIcon("#data_table_container");
    		$("#common_phenotypes").append(html);		
    		$("#common_pheno_table").tablecloth({
    			theme: "default",
    			condensed: true,
    			striped: true,
    			sortable: true,
    		});
    	});

    	$("#phenotype_csv").click(function(){// if download button clicked
    		window.location.href = 'GetCommonPheno.php?tid='+ids+'&csv';
    	});
    },
    openCommonAmplicon: function(ids){
    	var that = this;
    	// only allow one tab for one type at a time
    	$("#amplicon_tab").remove();
    	$("#amplicon_phenotypes").remove();
      $("#data_tabs").append("<li id='amplicon_tab'><a href='#common_amplicons' data-toggle='tab'><button class='close' type='button'>x</button>Amplicons</a></li>");
    	$("#data_table_container").append("<div id='common_amplicons' class='tab-pane active'>");

      

    	this.setLoaderIcon("#data_table_container");
      this.$("ul.nav-tabs li a:last").tab('show');
    	$.get('GetCommonAmplicon.php?tid='+ids, function(html){
    		that.unsetLoaderIcon("#data_table_container");
    		$("#common_amplicons").append(html);		
    		$("#common_amplicon_table").tablecloth({
    			theme: "default",
    			condensed: true,
    			striped: true,
    			sortable: true,
    		});
    	
    	});
    },

    openDiversitree: function(ids){
      window.location.href = 'DiversitreeDownload.php?tid='+ids+'&csv';
    },

    openSNP: function(ids){
    	var that = this;
    	$("#snps_tab").remove();
    	$("#common_snps").remove();
      $("#data_tabs").append("<li id='snps_tab'><a href='#common_snps' data-toggle='tab'><button class='close' type='button'>x</button>Genotypes</a></li>");
    	$("#data_table_container").append("<div id='common_snps' class='tab-pane active'>"+
                                        "<div class='button-wrapper'><button class='btn btn-default' type='button' id='remove_snps'>Remove selected samples</button></div>"+
                                        "<table><td valign='top' class='grid-col'><div id='snp_grid' class='grid'></div></td></table>"+
                                        "Total samples selected: <span id='snp_sample_count'>0</span></div>");
      this.$("ul.nav-tabs li a:last").tab('show');
    	$("#snp_csv").click(function(){// if download button clicked
    		window.location.href = 'GetCommonSNP.php?tid='+ids+'&csv';
    	});
    },
    openWorldClim: function(ids,lats,lngs){
    	var that = this;
    	$("#world_clim_tab").remove();
    	$("#world_clims").remove();
      $("#data_tabs").append("<li id='world_clim_tab'><a href='#world_clims' data-toggle='tab'><button class='close' type='button'>x</button>Environmental Data</a></li>");
    	$("#data_table_container").append("<div id='world_clims' class='tab-pane active'>");		
    	this.setLoaderIcon("#data_table_container");
      this.$("ul.nav-tabs li a:last").tab('show');
    	$.get('GetWorldClimData.php?id='+ids+'&lat='+lats+'&lon='+lngs, function(html){
    		that.unsetLoaderIcon("#data_table_container");
    		$("#world_clims").append(html);		
    		$("#world_clim_table").tablecloth({
    			theme: "default",
    			condensed: true,
    			striped: true,
    			sortable: true,
    		});
	   	});
    	$("#world_clim_csv").click(function(){// if download button clicked
        window.location.href = 'GetWorldClimData.php?id='+ids+'&lat='+lats+'&lon='+lngs+'&csv';
    	});
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
    		$("#run_tool").removeClass("disabled");
    	}
    	else{
    		$("#run_tool").addClass("disabled");
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
    else if(id === "amplicon_tab"){
      $("#tools_dropdown").append(this.defaultToolTemplate({"tool":id})+'<li role="presentation" class="divider"></li>'+
                                                                        '<li class="dropdown-header"><img src="images/sswapinfoicon.png"> sswap</li>'+
                                                                        '<li role="presentation"><a id="sswap_amplicon" role="menuitem" tabindex="-1" href="javascript:void(0);">Discover pipelines at SSWAP</a></li>');
    }
    else{
      console.log("change tool")
      $("#tools_dropdown").append(this.defaultToolTemplate({"tool":id}));
    }
    
   },
	
    initialize: function(){
      var that = this;
      this.$("ul.nav-tabs li a:first").tab('show');
      // this.collection.on('add remove reset',this.toggleRunDisabled,this);
      this.listenTo(this.collection,'add remove reset',this.toggleRunDisabled);
      this.toggleRunDisabled();         
    },

    render: function(){
      return this;
    }

  });
 
  return BottomTabsView; 
});

