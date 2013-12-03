//Filename: map.js
define([
  'jquery',
  'underscore',
  'backbone',
  'models/map',
  'text!templates/legend.html',
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
          google.maps.event.addListener(this.markersLayer, 'click', function(e){
            if(infowindow){
              infowindow.close();
            }
            else{
              var infowindow = new google.maps.InfoWindow();
              infowindow.setContent(
                that.template({
                  icon_name: e.row["icon_name"].value,
                  icon_type: e.row["type"].value
                  })
              );
              infowindow.setPosition(new google.maps.LatLng(e.row["lat"].value,e.row["lng"].value));
              infowindow.open(that.map);
            }
            
            $('#data_table').dataTable().fnAddData([
              e.row["tree_id"].value,
              e.row["lat"].value,
              e.row["lng"].value,
              e.row["species"].value,
             ]);

          });

          google.maps.event.addListener(this.map, 'click', function(){
            $('#data_table').dataTable().fnClearTable();
          });

          // this.markersLayer.enableMapTips({
          //   select: "'icon_name','lat'",
          //   from: '1AV4s_xvk7OQUMCvxoKjnduw3DjahoRjjKM9eAj8',
          //   key: 'AIzaSyA2trAEtQxoCMr9vVNxOM7LiHeUuRDVqvk',
          //   geometryColumn: 'icon_name', // geometry column name
          //   suppressMapTips: false, // optional, whether to show map tips. default false
          //   delay: 200, // milliseconds mouse pause before send a server query. default 300.
          //   tolerance: 8 // tolerance in pixel around mouse. default is 6.


          // });

          // google.maps.event.addListener(this.markersLayer, 'mouseover', function(e) {
          //  // console.log(e.row["icon_name"].value);
          // });

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


          // this.map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(
          //   document.getElementById('legend'));
       	},

        render: function(){
          console.log("render");
          console.log(this.model.get("query").attributes);
          console.log(this.markersLayer);
          this.markersLayer.setOptions({
            query: this.model.get("query").attributes,
            styleId: 2,
            templateId: 2,
          });
          this.markersLayer.setMap(this.map);
          return this;
        }
    	});
    	return MapView;
  });
