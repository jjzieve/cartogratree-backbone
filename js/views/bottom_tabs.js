//Filename: data_tabs.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',    // lib/backbone/backbone
  'bootstrap',
  'models/tree_id',
  'collections/tree_ids',
  'sswap'
], function($, _, Backbone, Tree_IDModel, Tree_IDCollection){
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  var BottomTabsView = Backbone.View.extend({
    el: "#tabs_container",
    model: Tree_IDModel,
    collection: Tree_IDCollection,
    demoJsonRRG : {
    		 
    	       "api" : "/makeRRG",

    	       "prefix" : {
    	            "data"   : "http://sswapmeet.sswap.info/data/",
    	            "mime"   : "http://sswapmeet.sswap.info/mime/",
    	            "tassel" : "http://sswapmeet.sswap.info/iplant/tassel/",
    	            "tasselFile" : "http://sswapmeet.sswap.info/maizegenetics/tassel/file/",
    	            "tassel-args" : "http://sswapmeet.sswap.info/iplant/tassel/args/"
    	        },


    	      "http://sswap.info/iplant/resources/tassel/rrg" : { },

    	      "mapping" : { "sswap:Subject" : "_:gwasData" },

    	      "definitions" : {

    	        "_:gwasData" : {

    	          "rdf:type" : "tassel:requests/TasselRequest",

    	           "tassel-args:h"            : "http://dendrome.ucdavis.edu/_dev/jjzieve/cartogratree-backbone/GetGenoData.php?tid=GRI0001,GRI0002,GRI0003,GRI0004,GRI0005,GRI0006,GRI0007",
    	           "tassel-args:r"            : "http://dendrome.ucdavis.edu/_dev/jjzieve/cartogratree-backbone/GetPhenoData.php?tid=GRI0001,GRI0002,GRI0003,GRI0004,GRI0005,GRI0006,GRI0007",
    	           "tassel:data/hasGenotype"           : "http://dendrome.ucdavis.edu/_dev/jjzieve/cartogratree-backbone/GetGenoData.php?tid=GRI0001,GRI0002,GRI0003,GRI0004,GRI0005,GRI0006,GRI0007",
    	           "tassel:data/hasTraits"             : "http://dendrome.ucdavis.edu/_dev/jjzieve/cartogratree-backbone/GetPhenoData.php?tid=GRI0001,GRI0002,GRI0003,GRI0004,GRI0005,GRI0006,GRI0007"

    	         },

    	         "http://dendrome.ucdavis.edu/_dev/havasquezgross/cartogratree/GetGenoData.php?tid=GRI0001,GRI0002,GRI0003,GRI0004,GRI0005,GRI0006,GRI0007" : {
    	              "rdf:type" : [ "mime:application/X-hapmap" , "tasselFile:Genotype" ]
    	         },

    	         "http://dendrome.ucdavis.edu/_dev/havasquezgross/cartogratree/GetPhenoData.php?tid=GRI0001,GRI0002,GRI0003,GRI0004,GRI0005,GRI0006,GRI0007" : {
    	              "rdf:type" : "tasselFile:Trait"
    	         }


    	      }
    	},

    events:{
      "click #tools ul li a" : "changeTitle",
      "click #run_tool" : "runTool",
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
	    this.openWorldClimCSV(ids,lats,lngs);
            break;
          case 'common_snp_tool':
            this.openSNPCSV(ids);
            break;
          case 'diversitree_tool':
            this.openDiversitreeCSV(ids);
            break;
          case 'tassel_tool':
            this.getAssociationRRG(ids);
            break;
          case 'sswap_tool':
	    this.getMapRRG(ids);
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
    openWorldClimCSV: function(ids,lats,lngs){
      window.location.href = 'GetWorldClimData.php?id='+ids+'&lat='+lats+'&lon='+lngs+'&csv';
    },
    getAssociationRRG: function(ids){
     // window.location.href = 'AssociationRRG.php?tid='+ids;
	var that = this;
	$.getJSON('AssociationRRG.php?tid='+ids).success(function(jsonRRG){
	   //live code
      	    SSWAP.discover(jsonRRG, "#pipelineButton");
      	    //SSWAP.discover(this.demoJsonRRG, "#pipelineButton");
		
	    $("#sswap_form").submit();
	    console.log(jsonRRG);
	});
    },
    
    getMapRRG: function(ids){
	      /*if(checkedTreeID.length > 0){ 
                         params.push("tid="+checkedTreeID.join(','));    
                  }
                  
                  if(checkedSiteID.length > 0){ //for ameriflux
                          params.push("aid="+checkedSiteID.join(','));    
                  }
                  
                  params = params.join('&');
                  $.get('http://dendrome.ucdavis.edu/DiversiTree/MapRRG.php?'+params, function(data) {
                                  SSWAP.discover(data, "#hidden_form");
                                  $('#sswap_form').submit();
                  });*/
	$.getJSON('http://dendrome.ucdavis.edu/DiversiTree/MapRRG.php?tid='+ids).success(function(jsonRRG){
		SSWAP.discover(jsonRRG,"#pipelineButton");
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

