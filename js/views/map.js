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
        query: {
          select: 'lat',
          //from: '1_LQUfIWCi4TT2usHdEbttaQqofmFiuixfzkem-A'
          // from: '1ffp9_kJA4D0xeYOBIaUQ8ox7CqqIuB_6sC4Ahww'
          // from: '1jASE5L0kFRWDq2H6BBbffZ2dm4lqOBBJYtWLKGI'
          from: '1AV4s_xvk7OQUMCvxoKjnduw3DjahoRjjKM9eAj8'
        },
        // fusion_table_id = "1Cynob736T_hpL1eKgvONNooCRM5RK1UuSL4bCGc";
        // fusion_table_query_url = "https://www.googleapis.com/fusiontables/v1/query?sql=";
        // fusion_table_key = "&key=AIzaSyA2trAEtQxoCMr9vVNxOM7LiHeUuRDVqvk";

        initialize: function(){
          var that = this;
         	this.map =  new google.maps.Map(this.el, this.mapOptions);
          this.markersLayer = new google.maps.FusionTablesLayer({
            query: this.query,
            map: this.map,
            styleId: 2,
            templateId: 2
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
          return this;
        }
    	});
    	return MapView;
  });
