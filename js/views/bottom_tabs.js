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
  'tablecloth'
], function($, _, Backbone, Tree_IDModel, Tree_IDCollection){
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  var BottomTabsView = Backbone.View.extend({
    el: "#tabs_container",
    model: Tree_IDModel,
    collection: Tree_IDCollection,
    events:{
      "click #tools ul li a" : "changeTitle",
      "click .close" : "closeTab",
      "click #run_tool" : "runTool",
    },

    changeTitle: function(e){
      $('#tools_title').html($(e.target).html());
      $("#tools ul li a").not(e.target).removeClass("selected");
      $(e.target).addClass('selected');
    },
    
    closeTab: function(e){
	console.log('closed');
        //there are multiple elements which has .closeTab icon so close the tab whose close icon is clicked
        var tabContentId = $(e.target).parent().attr("href");
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
            break;
          case 'common_phenotype_tool':
            this.openCommonPheno(ids);
            break;
          case 'worldclim_tool':
	    this.openWorldClim(ids,lats,lngs);
            break;
          case 'common_snp_tool':
            this.openSNP(ids);
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
     	$("#data_tabs").append("<li id='phenotypes_tab'><a href='#common_phenotypes' data-toggle='tab'><button class='close' type='button'>x</button>Common Phenotypes</a></li>");
	$("#data_table_container").append("<div id='common_phenotypes' class='tab-pane active'>"+
					 "<div class='button-wrapper'><button class='btn btn-default' type='button' id='phenotype_csv'>Download CSV</button></div></div>");				
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

    openDiversitree: function(ids){
      window.location.href = 'DiversitreeDownload.php?tid='+ids+'&csv';
    },

    openSNP: function(ids){
	var that = this;
	$("#snps_tab").remove();
	$("#common_snps").remove();
     	$("#data_tabs").append("<li id='snps_tab'><a href='#common_snps' data-toggle='tab'><button class='close' type='button'>x</button>Common SNPs</a></li>");
	$("#data_table_container").append("<div id='common_snps' class='tab-pane active'>"+
					 "<div class='button-wrapper'><button class='btn btn-default' type='button' id='snp_csv'>Download CSV</button></div></div>");		
	this.setLoaderIcon("#data_table_container");
      	this.$("ul.nav-tabs li a:last").tab('show');
	$.get('GetCommonSNP.php?tid='+ids, function(html){
		that.unsetLoaderIcon("#data_table_container");
		$("#common_snps").append(html);		
		$("#common_snp_table").tablecloth({
			theme: "default",
			condensed: true,
			striped: true,
			sortable: true,
		});
	
	});

	$("#snp_csv").click(function(){// if download button clicked
		window.location.href = 'GetCommonSNP.php?tid='+ids+'&csv';
	});
    },
    openWorldClim: function(ids,lats,lngs){
	var that = this;
	$("#world_clim_tab").remove();
	$("#world_clims").remove();
     	$("#data_tabs").append("<li id='world_clim_tab'><a href='#world_clims' data-toggle='tab'><button class='close' type='button'>x</button>WorldClim Data</a></li>");
	$("#data_table_container").append("<div id='world_clims' class='tab-pane active'>"+
					 "<div class='button-wrapper'><button class='btn btn-default' type='button' id='world_clim_csv'>Download CSV</button></div></div>");		
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
	
    initialize: function(){
      var that = this;
      this.$("ul.nav-tabs li a:first").tab('show');
      this.collection.on('add remove reset',this.toggleRunDisabled,this);
      this.toggleRunDisabled();         
    },

    render: function(){
      return this;
    }

  });
 
  return BottomTabsView; 
  // What we return here will be used by other modules
});

