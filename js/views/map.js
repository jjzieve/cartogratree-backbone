//Filename: map.js
define([
  'jquery',
  'underscore',
  'backbone',
  'models/map',
  'collections/queries',
  'text!templates/infowindow.html',
  'goog!maps,3,other_params:libraries=drawing&sensor=false',

], function($,_, Backbone, MapModel, QueriesCollection, legendTemplate){

  	var MapView = Backbone.View.extend({
        el : '#map_canvas',
        model: MapModel,
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
              from: "1AV4s_xvk7OQUMCvxoKjnduw3DjahoRjjKM9eAj8", 
              where: "",
            }, 
            map: this.map,
            styleId: 2,
            templateId: 2,
            suppressInfoWindows: true
          });
        },

        initialize: function(){
          this.initMap();
          this.initMarkersLayer();
          this.initInfoWindow();
          this.initDrawingManager();
          this.collection.on('add remove',this.refreshMarkersLayer,this);
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

        genQuery: function(years,families,genuses,species,accessions){
          yearsQuery = "";
          familiesQuery = "";
          genusesQuery = "";
          speciesQuery = "";
          accessionsQuery = "";
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
            accessionsQuery = "'accessions' IN ('"+years.join("','")+"')";
          }
          return _.filter([
            yearsQuery,
            familiesQuery,
            genusesQuery,
            speciesQuery,
            accessionsQuery],function(string){ return string != ""}).join(' AND ');          
        },

        refreshMarkersLayer: function(){
          var years = this.getColumn("year");
          var families = this.getColumn("family");
          var genuses = this.getColumn("genus");
          var species = this.getColumn("species");
          // var accessions = this.getColumn("accession"); // uncomment when fusion table is fixed
          var accessions = []; // delete when fusion table is fixed
          var whereClause = this.genQuery(years,families,genuses,species,accessions);  
          console.log(whereClause);        
          this.markersLayer.setOptions({
            query: {
              select: "lat",
              from: "1AV4s_xvk7OQUMCvxoKjnduw3DjahoRjjKM9eAj8", 
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
