//Filename: map.js
define([
  'jquery',
  'underscore',
  'backbone',
  'models/query',
  'collections/queries',
  'text!templates/tgdr_infowindow.html',
  'text!templates/sts_is_infowindow.html',
  'text!templates/try_db_infowindow.html',
  'text!templates/ameriflux_infowindow.html',
  'text!templates/table_row.html',
  //'goog!maps,3,other_params:libraries=drawing&sensor=false',
  'async!http://maps.google.com/maps/api/js?sensor=false&libraries=drawing,visualization',
  'context_menu',
  'heatmap_data',
], function($,_, Backbone, QueryModel, QueriesCollection, tgdrInfoWindow, sts_isInfoWindow, try_dbInfoWindow, amerifluxInfoWindow, tableRow){

  String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  }

  	var MapView = Backbone.View.extend({
        el : '#map_canvas',
        model: QueryModel,
        collection: QueriesCollection,
        tgdrInfoWindowTemplate: _.template(tgdrInfoWindow),
        sts_isInfoWindowTemplate: _.template(sts_isInfoWindow),
        try_dbInfoWindowTemplate: _.template(try_dbInfoWindow),
        amerifluxInfoWindowTemplate: _.template(amerifluxInfoWindow),
        tableRowTemplate: _.template(tableRow),
        rectangles: [],
         mapOptions : {
           zoom: 4,
           minZoom: 2,
           maxZoom: 25,
           center: new google.maps.LatLng(38.5539,-121.7381), //Davis, CA
           mapTypeId: 'terrain',
           mapTypeControl: true,
           mapTypeControlOptions: { 
             mapTypeIds: [
               'terrain',
               'satellite',
             ],
             style: google.maps.MapTypeControlStyle.DROPDOWN_MENU 
           },
           navigationControl: true,
           navigationControlOptions: { 
             style: google.maps.NavigationControlStyle.ZOOM_PAN 
           },
           scrollwheel: false,
           scaleControl: true,
           disableDoubleClickZoom: true
         },

        initMap: function() {
          this.map =  new google.maps.Map(this.el, this.mapOptions);
          this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(document.getElementById("toggle_heatmap"));

        },
        
        clearRectangles: function(){
          $.each(this.rectangles,function(index,rectangle){
            rectangle.setMap(null);
          });
          this.collection.remove("rectangle"); 
        },

        initDrawingManager: function() {
          var that = this;
          this.drawingManager = new google.maps.drawing.DrawingManager({
            drawingControl: true,
            drawingControlOptions: {
              position: google.maps.ControlPosition.TOP_CENTER,
              drawingModes: [
		            google.maps.drawing.OverlayType.RECTANGLE
              ]
            },
          });
	  
          this.drawingManager.setMap(this.map);
	
          google.maps.event.addListener(this.drawingManager,'rectanglecomplete', function(rectangle){
            that.rectangles.push(rectangle); //store map rectangle objects but effectively only cache and 
	    if(!$("#toggle_heatmap").hasClass("selected")){// do nothing to the collection if in heat map mode
            var sw = rectangle.getBounds().getSouthWest();
            var ne = rectangle.getBounds().getNorthEast();
            var rectangleQuery = "ST_INTERSECTS('lat', RECTANGLE(LATLNG"+sw+",LATLNG"+ne+"))";
            var rectangleModel = that.collection.get("rectangle");

         		if(typeof(rectangleModel) !== "undefined"){
              rectangleModel.set({"value":rectangleQuery});
              that.collection.set(rectangleModel,{remove:false});
        		}
            else{
              that.collection.add({
                id: "rectangle",
                value: rectangleQuery // a bit hackish because it doesn't follow the format of the other models but its the best I could come up with...
              });
            }
	}
	//listeners
            console.log("in rectangle complete");
            console.log(that.collection);
      	  });
          $("#clear_table").on("click", function(){
            that.clearRectangles();
          });
          google.maps.event.addListener(this.map,'click',function(){// on map click remove all the rectangles from the map and the current query
            that.clearRectangles();
          });
		
        },
      
	initHeatMap: function(){
	  var that = this;
	  //Heatmap configuration
          var heatMapData = get_heatmapdata();
          this.heatmap = new google.maps.visualization.HeatmapLayer({
            data: heatMapData
          }); 
      	  var gradient = [
      	   'rgba(0, 255, 255, 0)',
      	   'rgba(0, 255, 255, 1)',
      	   'rgba(0, 191, 255, 1)',
      	   'rgba(0, 127, 255, 1)',
      	   'rgba(0, 63, 255, 1)',
      	   'rgba(0, 0, 255, 1)',
      	   'rgba(0, 0, 223, 1)',
      	   'rgba(0, 0, 191, 1)',
      	   'rgba(0, 0, 159, 1)',
      	   'rgba(0, 0, 127, 1)',
      	   'rgba(0, 63, 91, 1)',
      	   'rgba(0, 127, 63, 1)',
      	   'rgba(0, 191, 31, 1)',
      	   'rgba(0, 255, 0, 1)'
      	  ];

      	  this.heatmap.set('radius', 7);
      	  this.heatmap.set('maxIntensity', 150);
      	  this.heatmap.set('dissipating', true);
      	  this.heatmap.set('gradient', gradient);
	  this.toggleHeatMap($("#toggle_heatmap"));//initially on 
	  
	//listener
	  $("#toggle_heatmap").on("click", function(){
		that.toggleHeatMap($(this));
	  });
	},
	
	toggleHeatMap: function(heatMapToggle){
		heatMapToggle.toggleClass("selected");
		var columns = this.collection.pluck("column");
		// don't add the heat map if tree_ids are in the url
		// && columns.indexOf("tree_id_sts_is") === -1 && columns.indexOf("tree_id_tgdr") === -1 ){
		if (heatMapToggle.hasClass("selected")){ 
			this.heatmap.setMap(this.map);
			this.clearLayers();
			$("#heatmap_tooltip").tooltip('hide');
			$('#heatmap_tooltip').data('tooltip',false)          // Delete the tooltip
              			.tooltip({title: 'Heat map (All studies)',placement: 'bottom'});
		}
		else{
			this.heatmap.setMap(null);
			this.refreshLayers();
			$("#heatmap_tooltip").tooltip('hide');
			$('#heatmap_tooltip').data('tooltip',false)          // Delete the tooltip
              			.tooltip({ title: 'Selected markers',placement:"bottom"});
		}
	},
	  

	clearLayers: function(){
	  console.log('clearLayers');
	  this.tgdrLayer.setMap(null);
	  this.sts_isLayer.setMap(null);
	  this.try_dbLayer.setMap(null);
	  this.amerifluxLayer.setMap(null);
	},

        initLayers: function() {
          this.tgdrLayer = new google.maps.FusionTablesLayer({
            query: {
              select: "lat",
              from: this.collection.meta("tgdr_id")
            }, 
            map: this.map,
            styleId: 2,
            templateId: 2,
            suppressInfoWindows: true
          });
          this.sts_isLayer = new google.maps.FusionTablesLayer({
            query: {
              select: "lat",
              from: this.collection.meta("sts_is_id")
            }, 
            map: this.map,
            styleId: 2,
            templateId: 2,
            suppressInfoWindows: true
          });

          this.try_dbLayer = new google.maps.FusionTablesLayer({
            query: {
              select: "lat",
              from: this.collection.meta("try_db_id")
            }, 
            map: this.map,
            styleId: 2,
            templateId: 2,
            suppressInfoWindows: true
          });
          this.amerifluxLayer = new google.maps.FusionTablesLayer({
            query: {
              select: "lat",
              from: this.collection.meta("ameriflux_id"),
            }, 
            map: this.map,
            styleId: 2,
            templateId: 2,
            suppressInfoWindows: true
          });
        },

        initInfoWindows: function(){
          var that = this; //to handle closure

          var convertNumToInfoWindowOutput = function(number){
            if (number > 0){
              return "Yes ("+number+")";
            }
            else{
              return "No";
            }
          }

          var convertIconToInfoWindowOutput = function(icon_name){
            if (icon_name == 'small_green'){
              return 'Exact GPS';
            }
            else if (icon_name == 'small_yellow'){
              return 'Approx. GPS';
            }
            else if (icon_name == 'measle_brown'){
              return 'TRY-DB';
            }
            else{
              return 'Ameriflux';
            }
          }



          this.tgdrInfoWindow = new google.maps.InfoWindow({maxWidth:250});
          this.sts_isInfoWindow = new google.maps.InfoWindow({maxWidth:250});
          this.try_dbInfoWindow = new google.maps.InfoWindow({maxWidth:250});
          this.amerifluxInfoWindow = new google.maps.InfoWindow({maxWidth:250});
          google.maps.event.addListener(this.tgdrLayer, 'click', function(e){
              that.tgdrInfoWindow.setContent(
                that.tgdrInfoWindowTemplate({
                  icon_name: e.row["icon_name"].value,//for icon images -> http://kml4earth.appspot.com/icons.html
                  icon_type: convertIconToInfoWindowOutput(e.row["icon_name"].value),
                  tree_id: e.row["tree_id"].value,
                  species: e.row["species"].value,
                  lat: new Number(e.row["lat"].value).toFixed(4),
                  lng: new Number(e.row["lng"].value).toFixed(4),
                  sequenced: convertNumToInfoWindowOutput(e.row["num_sequences"].value),
                  genotyped: convertNumToInfoWindowOutput(e.row["num_genotypes"].value),
                  phenotyped: convertNumToInfoWindowOutput(e.row["num_phenotypes"].value),
                  accession: e.row["accession"].value,
                  title: e.row["title"].value,
                  authors: e.row["authors"].value
                  })
              );
              that.tgdrInfoWindow.setPosition(new google.maps.LatLng(e.row["lat"].value,e.row["lng"].value));
              that.tgdrInfoWindow.open(that.map);
          });
          google.maps.event.addListener(this.sts_isLayer, 'click', function(e){
              that.sts_isInfoWindow.setContent(
                that.sts_isInfoWindowTemplate({
                  icon_name: e.row["icon_name"].value,
                  icon_type: convertIconToInfoWindowOutput(e.row["icon_name"].value),
                  tree_id: e.row["tree_id"].value,
                  family: e.row["family"].value,
                  genus: e.row["genus"].value,
                  species: e.row["species"].value,
                  lat: new Number(e.row["lat"].value).toFixed(4),
                  lng: new Number(e.row["lng"].value).toFixed(4),
                  sequenced: convertNumToInfoWindowOutput(e.row["num_sequences"].value),
                  genotyped: convertNumToInfoWindowOutput(e.row["num_genotypes"].value),
                  phenotyped: convertNumToInfoWindowOutput(e.row["num_phenotypes"].value),
                  })
              );
              that.sts_isInfoWindow.setPosition(new google.maps.LatLng(e.row["lat"].value,e.row["lng"].value));
              that.sts_isInfoWindow.open(that.map);
          });
          google.maps.event.addListener(this.try_dbLayer, 'click', function(e){
              that.try_dbInfoWindow.setContent(
                that.try_dbInfoWindowTemplate({
                  icon_name: e.row["icon_name"].value,
                  icon_type: convertIconToInfoWindowOutput(e.row["icon_name"].value),
                  angio_gymno: e.row["class"].value.capitalize(),
                  institution: e.row["institution"].value,
                  species: e.row["species"].value,
                  lat: new Number(e.row["lat"].value).toFixed(4),
                  lng: new Number(e.row["lng"].value).toFixed(4),
                  phenotyped: convertNumToInfoWindowOutput(e.row["num_phenotypes"].value),
                  dataset: e.row["dataset"].value,
                  })
              );
              that.try_dbInfoWindow.setPosition(new google.maps.LatLng(e.row["lat"].value,e.row["lng"].value));
              that.try_dbInfoWindow.open(that.map);
          });
          google.maps.event.addListener(this.amerifluxLayer, 'click', function(e){
              that.amerifluxInfoWindow.setContent(
                that.amerifluxInfoWindowTemplate({
                  icon_name: e.row["icon_name"].value,
                  site_id: e.row["site_id"].value,
                  src_url: e.row["src_url"].value,
                  site_name: e.row["site_name"].value,
                  type: e.row["type"].value,
                  lat: new Number(e.row["lat"].value).toFixed(4),
                  lng: new Number(e.row["lng"].value).toFixed(4),
                  })
              );
              that.amerifluxInfoWindow.setPosition(new google.maps.LatLng(e.row["lat"].value,e.row["lng"].value));
              that.amerifluxInfoWindow.open(that.map);
          });
        },

        initContextMenu: function(){
      		var that = this;
      		var contextMenuOptions={};
          contextMenuOptions.classNames={menu:'context_menu', menuSeparator:'context_menu_separator'};
          
          //      create an array of ContextMenuItem objects
          var menuItems=[];
          menuItems.push({className:'context_menu_item', eventName:'zoom_in_click', label:'Zoom in'});
          menuItems.push({className:'context_menu_item', eventName:'zoom_out_click', label:'Zoom out'});
          //      a menuItem with no properties will be rendered as a separator
          menuItems.push({});
          menuItems.push({className:'context_menu_item', eventName:'center_map_click', label:'Center map here'});
          menuItems.push({});
          menuItems.push({className:'context_menu_item', eventName:'get_worldclim_data', label:'Get WorldClim Data'});
          contextMenuOptions.menuItems=menuItems;
          
          //      create the ContextMenu object
          var contextMenu=new ContextMenu(this.map, contextMenuOptions);
          
          //      display the ContextMenu on a Map right click
          google.maps.event.addListener(this.map, 'rightclick', function(mouseEvent){
                  contextMenu.show(mouseEvent.latLng);
          });
  
          //      listen for the ContextMenu 'menu_item_selected' event
          google.maps.event.addListener(contextMenu, 'menu_item_selected', function(latLng, eventName){
          //      latLng is the position of the ContextMenu
          //      eventName is the eventName defined for the clicked ContextMenuItem in the ContextMenuOptions
            switch(eventName){
              case 'zoom_in_click':
                      this.map.setZoom(this.map.getZoom()+1);
                      break;
              case 'zoom_out_click':
                      this.map.setZoom(this.map.getZoom()-1);
                      break;
              case 'center_map_click':
                      this.map.panTo(latLng);
                      break;
              case 'get_worldclim_data':
                      var lat = latLng.lat();
                      var lng = latLng.lng();
    				that.worldClimInfoWindow = new google.maps.InfoWindow({maxWidth:250});
      				$.get("worldclimjson.php?lat="+lat+"&lon="+lng,function(html){
      				    that.worldClimInfoWindow.setContent(html);
      				});
      				that.worldClimInfoWindow.setPosition(new google.maps.LatLng(lat,lng));
      				that.worldClimInfoWindow.open(that.map);
                                  break;
                  }
          });
        },


        getColumn: function(column){
          return (this.collection.filter(function(query){return query.get("column") === column}).map(function(query){return query.get("value")}));
        },

        genQuery: function(table,years,families,genuses,species_tgdr,species_sts_is,accessions,tree_ids_tgdr,tree_ids_sts_is,filters){
          var studiesQuery = "";
          var yearsQuery = "";
          var familiesQuery = "";
          var genusesQuery = "";
          var speciesTGDRQuery = "";
          var speciesSTS_ISQuery = "";
          var accessionsQuery = "";
          var tree_idTGDRQuery = "";
          var tree_idSTS_ISQuery = "";
          var sequencedQuery = ""; // no samples are sequenced in tgdr, may change in future
          var genotypedQuery = "";
          var phenotypedQuery = "";
          var gpsQuery = ""; // all samples are exact in tgdr, may change in future
          if (years.length > 0){
            yearsQuery = "'year' IN ('"+years.join("','")+"')";
          }
          if (families.length > 0){
            familiesQuery = "'family' IN ('"+families.join("','")+"')";
          }
          if (genuses.length > 0){
            genusesQuery = "'genus' IN ('"+genuses.join("','")+"')";
          }
          if (species_tgdr.length > 0){
            speciesTGDRQuery = "'species' IN ('"+species_tgdr.join("','")+"')";
          }
          if (species_sts_is.length > 0){
            speciesSTS_ISQuery = "'species' IN ('"+species_sts_is.join("','")+"')";
          }
          if (tree_ids_tgdr.length > 0){
            tree_idTGDRQuery = "'tree_id' IN ('"+tree_ids_tgdr.join("','")+"')";
          }
          if (tree_ids_sts_is.length > 0){
            tree_idSTS_ISQuery = "'tree_id' IN ('"+tree_ids_sts_is.join("','")+"')";
          }
          if (accessions.length > 0){ 
            accessionsQuery = "'accession' IN ('"+accessions.join("','")+"')";
          }
          if (filters.indexOf("sequenced") != -1) {
            sequencedQuery = "'num_sequences' > 0";
          }
          if (filters.indexOf("genotyped") != -1) {
            genotypedQuery = "'num_genotypes' > 0";
          }
          if (filters.indexOf("phenotyped") != -1) {
            phenotypedQuery = "'num_phenotypes' > 0";
          }
          if (filters.indexOf("exact_gps") != -1 && gpsQuery == "") {//if both or none are set shows all
            gpsQuery = "'is_exact_gps_coordinate' = 'true'";
          }
          if (filters.indexOf("approx_gps") != -1 && gpsQuery == "") {
            gpsQuery = "'is_exact_gps_coordinate' = 'false'";
          }
          if (table == "tgdr"){
            return _.filter([yearsQuery,speciesTGDRQuery,accessionsQuery,tree_idTGDRQuery,sequencedQuery,genotypedQuery,phenotypedQuery,gpsQuery],function(string){ return string != ""}).join(' AND '); 
          } 
          else if (table == "sts_is"){
            return _.filter([familiesQuery, genusesQuery, speciesSTS_ISQuery, tree_idSTS_ISQuery, sequencedQuery, genotypedQuery, phenotypedQuery, gpsQuery],function(string){ return string != ""}).join(' AND '); 
          }
          else {//try_db or ameriflux
            return _.filter([sequencedQuery, genotypedQuery, phenotypedQuery, gpsQuery],function(string){ return string != ""}).join(' AND '); 
          }     
        },


        refreshLayer: function(table,whereClause,layer,layer_id){
          if(typeof(whereClause) === "undefined"){
            layer.setMap(null);
          }
          else{
            this.collection.meta(table+"WhereClause",whereClause); //sets the new where clause
	    if(!$("#toggle_heatmap").hasClass("selected")){//if heat map on, don't set layer
            layer.setOptions({
              query: {
                select: "lat",
                from: layer_id, 
                where: whereClause
              }
            });
            layer.setMap(this.map);
	}
          }

        },

        refreshLayers: function(){
          //tree nodes
          var all = this.getColumn("all");
          var environmental = this.getColumn("environmental");
          var phenotypes = this.getColumn("phenotypes");
          var ameriflux = this.getColumn("ameriflux");
          var try_db = this.getColumn("try_db");
          var studies = this.getColumn("studies");
          var taxa = this.getColumn("taxa");
          var years = this.getColumn("year");
          var families = this.getColumn("family");
          var genuses = this.getColumn("genus");
          var species_tgdr = this.getColumn("species_tgdr");
          var species_sts_is = this.getColumn("species_sts_is");
          var accessions = this.getColumn("accession");
          var tree_ids_tgdr = this.getColumn("tree_id_tgdr");
          var tree_ids_sts_is = this.getColumn("tree_id_sts_is");
          var filters = this.collection.pluck("filter");
          

          if (all.length > 0 || studies.length > 0 || years.length > 0 || species_tgdr.length > 0 || accessions.length > 0 || tree_ids_tgdr.length > 0 || filters > 0){
            var tgdrWhereClause = this.genQuery("tgdr",years,families,genuses,species_tgdr,species_sts_is,accessions,tree_ids_tgdr,tree_ids_sts_is,filters);
          }
          if (all.length > 0 || taxa.length > 0 || families.length > 0 || genuses.length > 0 || species_sts_is.length > 0 || tree_ids_sts_is.length > 0 || filters > 0){
            var sts_isWhereClause = this.genQuery("sts_is",years,families,genuses,species_tgdr,species_sts_is,accessions,tree_ids_tgdr,tree_ids_sts_is,filters);
          }
          if (all.length > 0 || phenotypes.length > 0 || try_db.length > 0 || filters > 0){
            var try_dbWhereClause = this.genQuery("try_db",years,families,genuses,species_tgdr,species_sts_is,accessions,tree_ids_tgdr,tree_ids_sts_is,filters);
          }
          if (all.length > 0 || environmental.length > 0 || ameriflux.length > 0 || filters > 0){
            var amerifluxWhereClause = this.genQuery("ameriflux",years,families,genuses,species_tgdr,species_sts_is,accessions,tree_ids_tgdr,tree_ids_sts_is,filters);
          }

          this.refreshLayer("tgdr",tgdrWhereClause,this.tgdrLayer,this.collection.meta("tgdr_id"));
          this.refreshLayer("sts_is",sts_isWhereClause,this.sts_isLayer,this.collection.meta("sts_is_id"));
          this.refreshLayer("try_db",try_dbWhereClause,this.try_dbLayer,this.collection.meta("try_db_id"));
          this.refreshLayer("ameriflux",amerifluxWhereClause,this.amerifluxLayer,this.collection.meta("ameriflux_id"));    
          //debug
          console.log(this.collection);
          console.log("tgdrWhereClause:"+this.collection.meta("tgdrWhereClause")+"\n"+
                  "sts_isWhereClause:"+this.collection.meta("sts_isWhereClause")+"\n"+
                  "rectangleWhereClause:"+this.collection.meta("rectangleWhereClause")+"\n"+
                  "try_dbWhereClause:"+this.collection.meta("try_dbWhereClause")+"\n"+
                  "amerifluxWhereClause:"+this.collection.meta("amerifluxWhereClause"));   
        },

        initialize: function(){
          var that = this;
          this.initMap();
          this.initLayers();
          this.initHeatMap();
          this.initInfoWindows();
          this.initDrawingManager();
          this.initContextMenu();
          this.collection.on('add remove reset',this.refreshLayers,this);
          if(this.collection.length > 0){// check if tree_ids are in url. if so, refresh map
            this.refreshLayers();
          }
        },


        render: function(){
          return this;
    	   }
      });
    	return MapView;
  });
