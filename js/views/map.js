//Filename: map.js
define([
  'jquery',
  'underscore',
  'backbone',
  'models/map',
  'text!templates/infowindow.html',
  'goog!maps,3,other_params:libraries=drawing&sensor=false',
    // 'fusiontips'
], function($,_, Backbone, MapModel,legendTemplate){

  	var MapView = Backbone.View.extend({
        el : '#map_canvas',
        model: MapModel,
        template: _.template(legendTemplate),
        //var self = this;
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

        initialize: function(){
          var that = this;
         	this.map =  new google.maps.Map(this.el, this.mapOptions);
          this.markersLayer = new google.maps.FusionTablesLayer({
            query: this.model.get("query").attributes,
            map: this.map,
            styleId: 2,
            templateId: 2,
            suppressInfoWindows: true
          });
          var infoWindow = new google.maps.InfoWindow({maxWidth:250});
          google.maps.event.addListener(this.markersLayer, 'click', function(e){
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
              infoWindow.setContent(
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
              infoWindow.setPosition(new google.maps.LatLng(e.row["lat"].value,e.row["lng"].value));
              infoWindow.open(that.map);
            
            $('#data_table').dataTable().fnAddData([
              e.row["tree_id"].value,
              e.row["lat"].value,
              e.row["lng"].value,
              e.row["species"].value,
             ]);

          });

          google.maps.event.addListener(this.map, 'click', function(){
            infoWindow.close();
            $('#data_table').dataTable().fnClearTable();
          });

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

        render: function(){
          this.markersLayer.setOptions({
            query: this.model.get("query").attributes,
          });
          return this;
        }
    	});
    	return MapView;
  });
