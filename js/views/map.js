//Filename: map.js
define([
  'jquery',
  'underscore',
  'backbone',
  'models/query',
  'collections/queries',
  'text!templates/infowindow.html',
  'text!templates/infowindow_ameriflux.html',
  'goog!maps,3,other_params:libraries=drawing&sensor=false',

], function($,_, Backbone, QueryModel, QueriesCollection, legendTemplate,amerifluxInfoWindow){

  	var MapView = Backbone.View.extend({
        el : '#map_canvas',
        model: QueryModel,
        collection: QueriesCollection,
        template: _.template(legendTemplate),
        templateAmeriflux: _.template(amerifluxInfoWindow),
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
              'satellite'
            ],
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU 
          },
          navigationControl: true,
          navigationControlOptions: { 
            style: google.maps.NavigationControlStyle.ZOOM_PAN 
          },
          scrollwheel: false,
          scaleControl: true,
        },

        initInfoWindows: function(){
          var that = this; //to handle closure
          this.infoWindow = new google.maps.InfoWindow({maxWidth:250});
          this.infoWindowAmeriflux = new google.maps.InfoWindow({maxWidth:250});
          google.maps.event.addListener(this.markersLayer, 'click', function(e){
              //remove these if-else branches by reflecting it in the table
              if (e.row["type"].value == "gymno"){ 
                var type = "Gymnosperm";
              }
              else{
                var type = "Angiosperm";
              }
              that.infoWindow.setContent(
                that.template({
                  icon_name: e.row["icon_name"].value,//for icon images -> http://kml4earth.appspot.com/icons.html
                  icon_type: type,
                  family: e.row["family"].value,
                  species: e.row["species"].value,
                  elev: e.row["elev"].value,
                  lat: e.row["lat"].value,
                  lng: e.row["lng"].value,
                  sequenced: e.row["sequenced"].value,
                  genotyped: e.row["genotyped"].value,
                  phenotype: e.row["phenotype"].value,
                  accession: e.row["accession"].value
                  })
              );
              that.infoWindow.setPosition(new google.maps.LatLng(e.row["lat"].value,e.row["lng"].value));
              that.infoWindow.open(that.map);
          });
          google.maps.event.addListener(this.amerifluxLayer, 'click', function(e){
              //remove these if-else branches by reflecting it in the table
              that.infoWindowAmeriflux.setContent(
                that.templateAmeriflux({
                  icon_name: e.row["icon_name"].value,//for icon images -> http://kml4earth.appspot.com/icons.html
                  site_id: e.row["site_id"].value,
                  src_url: e.row["src_url"].value,
                  site_name: e.row["site_name"].value,
                  type: e.row["type"].value,
                  lat: e.row["lat"].value,
                  lng: e.row["lng"].value,
                  })
              );
              that.infoWindowAmeriflux.setPosition(new google.maps.LatLng(e.row["lat"].value,e.row["lng"].value));
              that.infoWindowAmeriflux.open(that.map);
          });
        },

        initDrawingManager: function() {
          this.drawingManager = new google.maps.drawing.DrawingManager({
            drawingControl: true,
            drawingControlOptions: {
              position: google.maps.ControlPosition.TOP_CENTER,
              drawingModes: [
                google.maps.drawing.OverlayType.POLYGON,
              ]
            },
          });
          this.drawingManager.setMap(this.map);
          google.maps.event.addListen
        },

        initMap: function() {
          this.map =  new google.maps.Map(this.el, this.mapOptions);
        },

        initLayers: function() {
          this.markersLayer = new google.maps.FusionTablesLayer({
            query: {
              select: "lat",
              from: this.model.get("fusion_table_id")//"1AV4s_xvk7OQUMCvxoKjnduw3DjahoRjjKM9eAj8", 
            }, 
            map: this.map,
            styleId: 2,
            templateId: 2,
            suppressInfoWindows: true
          });
           this.trydbLayer = new google.maps.FusionTablesLayer({
            query: {
              select: "lat",
              from: "1spNwsogd3q7p04Dt26mSAbM6owaPIeFnKBrRM00",
            }, 
            map: this.map,
            styleId: 2,
            templateId: 2,
            suppressInfoWindows: true
          });
          this.amerifluxLayer = new google.maps.FusionTablesLayer({
            query: {
              select: "lat",
              from: "1xr5d5jXjzWZtDxoIOOwXhMQ5yg8_9wn050FkJf0",
            }, 
            map: this.map,
            styleId: 2,
            templateId: 2,
            suppressInfoWindows: true
          });
        },

        initialize: function(){
          this.initMap();
          this.initLayers();
          this.initInfoWindows();
          this.initDrawingManager();
          this.collection.on('add remove reset',this.refreshMarkersLayer,this);
          google.maps.event.addListener(this.map, 'click', function(){
            $('#data_table').dataTable().fnClearTable();
          });
        },

        getColumn: function(column){
          return (this.collection.filter(function(query){return query.get("column") === column}).map(function(query){return query.get("value")}));
        },

        genQuery: function(studies,taxa,years,families,genuses,species,accessions,filters){
          var studiesQuery = "";
          var taxaQuery = "";
          var yearsQuery = "";
          var familiesQuery = "";
          var genusesQuery = "";
          var speciesQuery = "";
          var accessionsQuery = "";
          var sequencedQuery = "";
          var genotypedQuery = "";
          var phenotypedQuery = "";
          var gpsQuery = "";
          if (studies.length > 0 ){
            studiesQuery = "data_source = 'tgdr'";
          }
          if (taxa.length > 0){
            taxaQuery = "data_source IN ('is','sts')";
          }
          if (years.length > 0){
            yearsQuery = "'year' IN ('"+years.join("','")+"')";
          }
          if (families.length > 0){
            familiesQuery = "'family' IN ('"+families.join("','")+"')";
          }
          if (genuses.length > 0){
            genusesQuery = "'genus' IN ('"+genuses.join("','")+"')";
          }
          if (species.length > 0){
            speciesQuery = "'species' IN ('"+species.join("','")+"')";
          }
          if (accessions.length > 0){ // uncomment when fusion table is fixed
            accessionsQuery = "'accession' IN ('"+accessions.join("','")+"')";
          }
          if (filters.indexOf("sequenced") != -1) {
            sequencedQuery = "'sequenced' NOT EQUAL TO 'No'";
          }
          if (filters.indexOf("genotyped") != -1) {
            genotypedQuery = "'genotyped' NOT EQUAL TO 'No'";
          }
          if (filters.indexOf("phenotyped") != -1) {
            phenotypedQuery = "'phenotype' NOT EQUAL TO ''";
          }
          if (filters.indexOf("exact_gps") != -1) {
            if (gpsQuery == ""){
              gpsQuery = "'gps' = 'exact'";
            }
            else {
              gpsQuery = "'gps' IN ('exact','estimate')";
            }
          }
          if (filters.indexOf("approx_gps") != -1) {
            if (gpsQuery == ""){
              gpsQuery = "'gps' = 'estimate'";
            }
            else {
              gpsQuery = "'gps' IN ('exact','estimate')";
            }
          }
                              
          return _.filter([
            studiesQuery,
            taxaQuery,
            yearsQuery,
            familiesQuery,
            genusesQuery,
            speciesQuery,
            accessionsQuery,
            sequencedQuery,
            genotypedQuery,
            phenotypedQuery,
            gpsQuery],function(string){ return string != ""}).join(' AND ');          
        },

        allOn: function(){
          this.markersLayer.setOptions({
            query: {
              select: "lat",
              from: this.model.get("fusion_table_id"), 

            }
          });
          console.log('allOn');
          this.phenotypesOn();
          this.environmentalOn();
        },
        allOff: function(){
          this.markersLayer.setOptions({
            query: {
              select: "lat",
              from: this.model.get("fusion_table_id"), 
              where: "species = ''"
            }
          });
          // this.phenotypesOff();
          // this.environmentalOff();
          console.log('allOff');
        },
        phenotypesOn: function(){
          this.trydbLayer.setOptions({
            query: {
              select: "lat",
              from: "1spNwsogd3q7p04Dt26mSAbM6owaPIeFnKBrRM00",
            }, 
           });
          console.log('phenotypesOn');
        },
        phenotypesOff: function(){
          this.trydbLayer.setOptions({
            query: {
              select: "lat",
              from: "1spNwsogd3q7p04Dt26mSAbM6owaPIeFnKBrRM00",
              where: "id = ''",
            }, 
           });
          console.log('phenotypesOff');
        },
        environmentalOn: function(){
          this.amerifluxLayer.setOptions({
            query: {
              select: "lat",
              from: "1xr5d5jXjzWZtDxoIOOwXhMQ5yg8_9wn050FkJf0"
            }, 
          });
          console.log('environmentalOn');
        },
        environmentalOff: function(){
          this.amerifluxLayer.setOptions({
            query: {
              select: "lat",
              from: "1xr5d5jXjzWZtDxoIOOwXhMQ5yg8_9wn050FkJf0",
              where: "site_id = ''"
            }, 
          });
          console.log('environmentalOff');
        },

        toggleEnvironmentAndPhenotypes:function(environmental,phenotypes,ameriflux,try_db){
           if (environmental.length > 0 || ameriflux.length > 0){// may change if we get more than ameriflux sites
                this.environmentalOn();
              }
              else {
                this.environmentalOff();
              }
              if (phenotypes.length > 0 || try_db.length > 0){
                this.phenotypesOn();
              }
              else {
                this.phenotypesOff();
              }
        },

        refreshMarkersLayer: function(){
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
          var species = this.getColumn("species");
          var filters = this.collection.pluck("filter");
          var accessions = this.getColumn("accession"); // uncomment when fusion table is fixed
          var whereClause = this.genQuery(studies,taxa,years,families,genuses,species,accessions,filters);
          
          if (!whereClause){//essentially nothing is selected
            if (all.length > 0){
              this.allOn();
              this.collection.add({
                id: "1",
                column: "all",
                value: "all"
              });   

            }
            else {
              this.collection.remove("1");
              this.allOff();
              this.toggleEnvironmentAndPhenotypes(environmental,phenotypes,ameriflux,try_db);
            }
          }
          else {
            this.collection.meta("currentQuery",whereClause);        
            this.markersLayer.setOptions({
              query: {
                select: "lat",
                from: this.model.get("fusion_table_id"), 
                where: whereClause
              }
            });
            this.toggleEnvironmentAndPhenotypes(environmental,phenotypes,ameriflux,try_db);
          }
         
        },

        render: function(){
          return this;
    	   }
      });
    	return MapView;
  });
