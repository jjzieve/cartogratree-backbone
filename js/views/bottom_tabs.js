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

/*    initColumns: function(columns){
      this.columns = [
        {id: "TreeID", name: "Type", field: "type",width: 75, sortable:true,formatter:this.showIcon},
        {id: "id", name: "ID", field: "id",width: 150, sortable:true},
        {id: "lat", name: "Latitude", field: "lat",width: 100, sortable:true},
        {id: "lng", name: "Longitude", field: "lng",width: 100, sortable:true},
        {id: "sequences", name: "Total sequences", field: "sequences",width: 130, sortable:true},
        {id: "genotypes", name: "Total genotypes", field: "genotypes",width: 130, sortable:true},
        {id: "phenotypes", name: "Total phenotypes", field: "phenotypes",width: 135, sortable:true},
        {id: "species", name: "Species", field: "species",width: 150, sortable:true},
      ],
      this.checkboxSelector = new Slick.CheckboxSelectColumn({});
      this.columns.unshift(this.checkboxSelector.getColumnDefinition());
    },

    initGrid: function(){
      this.dataView = new Slick.Data.DataView();
      this.grid = new Slick.Grid("#grid", this.dataView, this.columns, this.options);
      this.grid.setSelectionModel(new Slick.RowSelectionModel());
      this.grid.registerPlugin(this.checkboxSelector);
    },
success: function (response) {
          that.unsetLoaderIcon();
          that.data = that.data.concat($.map(response,function(a,i){
            return that.toObj(a,i);
          }));
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
 if (sortCol) {
              that.grid.setSortColumn(sortCol, sortDir);
          }

          that.dataView.beginUpdate();
          that.dataView.setItems(that.data);
          that.dataView.endUpdate();

          that.grid.updateRowCount();
          that.grid.render();

          that.dataView.syncGridSelection(that.grid, true);

          that.grid.onSelectedRowsChanged.subscribe(function(){  // update selected count and set the sub collection to the selected ids
                  $("#sample_count").html(that.grid.getSelectedRows().length);
            that.sub_collection.reset();//remove all previous ids
            $.each(that.grid.getSelectedRows(), function(index,idx){ //add newly selected ones
              var id = that.dataView.getItemByIdx(idx)["id"].replace(/\.\d+$/,"");
              var lat = that.dataView.getItemByIdx(idx)["lat"]; //lat and lng for world_clim tool
              var lng = that.dataView.getItemByIdx(idx)["lng"];
              that.sub_collection.add({
                id: id,
                lat: lat,
                lng: lng
              });
            });
          });


    toObj: function(a,i){
      var o = {};
      o["type"] = a[0];
      o["id"] = a[1]+"."+i;//just because try-db is not unique
      o["lat"] = new Number(a[2]).toFixed(4);
      o["lng"] = new Number(a[3]).toFixed(4);
      o["sequences"] = a[4];
      o["genotypes"] = a[5];
      o["phenotypes"] = a[6];
      o["species"] = a[7];
      return o;
    },*/

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
		this.openCommonAmplicon(ids);
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
    openCommonAmplicon: function(ids){
	var that = this;
	// only allow one tab for one type at a time
	$("#amplicon_tab").remove();
	$("#amplicon_phenotypes").remove();
     	$("#data_tabs").append("<li id='amplicon_tab'><a href='#common_amplicons' data-toggle='tab'><button class='close' type='button'>x</button>Common Amplicons</a></li>");
	$("#data_table_container").append("<div id='common_amplicons' class='tab-pane active'>"+
					 "<div class='button-wrapper'><div class='btn-group'><button class='btn btn-default' type='button' id='amplicon_csv'>Download CSV</button><button class='btn btn-default' type='button' id='amplicon_sswap'>Phylo analysis via SSWAP</button></div></div></div>");				
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

	$("#amplicon_csv").click(function(){// if download button clicked
		window.location.href = 'GetCommonAmplicon.php?tid='+ids+'&csv';
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
	//slickgrid
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

