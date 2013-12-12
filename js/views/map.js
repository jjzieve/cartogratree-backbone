//Filename: map.js
define([
  'jquery',
  'underscore',
  'backbone',
  'models/query',
  'collections/queries',
  'text!templates/infowindow.html',
  'goog!maps,3,other_params:libraries=drawing&sensor=false',

], function($,_, Backbone, QueryModel, QueriesCollection, legendTemplate){

  	var MapView = Backbone.View.extend({
        el : '#map_canvas',
        model: QueryModel,
        collection: QueriesCollection,
        template: _.template(legendTemplate),
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

        initInfoWindow: function(){
          var that = this; //to handle closure
          this.infoWindow = new google.maps.InfoWindow({maxWidth:250});
          google.maps.event.addListener(this.markersLayer, 'click', function(e){
              //remove these if-else branches by reflecting it in the table
              if (e.row["type"].value == "gymno"){ 
                var type = "Gymnosperm";
              }
              else{
                var type = "Angiosperm";
              }
              if (e.row["data_source"].value == "tgdr"){

                var accession = e.row["tree_id"].value.substr(0,7);
              }
              else{
                var accession = "";
              }
              that.infoWindow.setContent(
                that.template({
                  icon_name: e.row["icon_name"].value,
                  icon_type: type,
                  family: e.row["family"].value,
                  species: e.row["species"].value,
                  elev: e.row["elev"].value,
                  lat: e.row["lat"].value,
                  lng: e.row["lng"].value,
                  sequenced: e.row["sequenced"].value,
                  genotyped: e.row["genotyped"].value,
                  phenotype: e.row["phenotype"].value,
                  accession: accession
                  })
              );
              that.infoWindow.setPosition(new google.maps.LatLng(e.row["lat"].value,e.row["lng"].value));
              that.infoWindow.open(that.map);
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
        },

        initMap: function() {
          this.map =  new google.maps.Map(this.el, this.mapOptions);
        },

        initMarkersLayer: function() {
          this.markersLayer = new google.maps.FusionTablesLayer({
            query: {
              select: "lat",
              from: this.model.get("fusion_table_id"),//"1AV4s_xvk7OQUMCvxoKjnduw3DjahoRjjKM9eAj8", 
              where: "",
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
              where: "",
            }, 
            map: this.map,
            styleId: 2,
            templateId: 2,
          });
          this.amerifluxLayer = new google.maps.FusionTablesLayer({
            query: {
              select: "lat",
              from: "1xr5d5jXjzWZtDxoIOOwXhMQ5yg8_9wn050FkJf0",
              where: "",
            }, 
            map: this.map,
            styleId: 2,
            templateId: 2,
          });
        },

        initialize: function(){
          this.initMap();
          this.initMarkersLayer();
          this.initInfoWindow();
          this.initDrawingManager();
          this.collection.on('add remove reset',this.refreshMarkersLayer,this);
            //need a cleaner way to do this
            // $('#data_table').dataTable().fnAddData([
            //   e.row["tree_id"].value,
            //   e.row["lat"].value,
            //   e.row["lng"].value,
            //   e.row["species"].value,
          // google.maps.event.addListener(this.map, 'click', function(){
          //   infoWindow.close();
          //   $('#data_table').dataTable().fnClearTable();
          // });
       	},

        getColumn: function(column){
          return (this.collection.filter(function(query){return query.get("column") === column}).map(function(query){return query.get("value")}));
        },

        genQuery: function(years,families,genuses,species,accessions,filters){
          yearsQuery = "";
          familiesQuery = "";
          genusesQuery = "";
          speciesQuery = "";
          accessionsQuery = "";
          sequencedQuery = "";
          genotypedQuery = "";
          phenotypedQuery = "";
          gpsQuery = "";
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


        refreshMarkersLayer: function(){
          var years = this.getColumn("year");
          var families = this.getColumn("family");
          var genuses = this.getColumn("genus");
          var species = this.getColumn("species");
          var filters = this.collection.pluck("filter");
          var accessions = this.getColumn("accession"); // uncomment when fusion table is fixed
          var whereClause = this.genQuery(years,families,genuses,species,accessions,filters);
          console.log(whereClause);
          this.collection.meta("currentQuery",whereClause);        
          this.markersLayer.setOptions({
            query: {
              select: "lat",
              from: this.model.get("fusion_table_id"), 
              where: whereClause
            }
          });
        },

        render: function(){
          return this;
    	   }
      });
    	return MapView;
  });
