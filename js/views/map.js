//Filename: map.js
define([
  'jquery',
  'underscore',
  'backbone',
  'models/map',
  'goog!maps,3,other_params:libraries=drawing&sensor=false',
], function($,_, Backbone, MapModel){

  	var MapView = Backbone.View.extend({
        el : '#map_canvas',
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
          // draggableCursor : "url(http://s3.amazonaws.com/besport.com_images/status-pin.png), auto"
          // draggableCursor: 'crosshair'
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
         	this.map =  new google.maps.Map(this.el, this.mapOptions);
          this.markersLayer = new google.maps.FusionTablesLayer({
            query: this.query,
            map: this.map,
            styleId: 2,
            templateId: 2
          });
          google.maps.event.addListener(this.markersLayer, 'click', function(e){
            var id = e.row["tree_id"].value;
            var lat = e.row["lat"].value;
            var lng = e.row["lng"].value;
            var species= e.row["species"].value;
            $('#data_table').dataTable().fnAddData([
              id,lat,lng,species]);
          });

          google.maps.event.addListener(this.map, 'click', function(){
            $('#data_table').dataTable().fnClearTable();
          });

          google.maps.event.addListener(this.markersLayer, 'mouseover', function(e) {
            alert(e.row["icon_name"].value);
            // move to template
          //     <!--        <div id="legend">
          //   <table>
          //     <thead>
          //       <tr>
          //         <th>Legend</th>
          //       </tr>
          //     </thead>
          //     <tbody>
          //       <tr>
          //         http://kml4earth.appspot.com/icons.html/
          //         <td><img class="img-responsive" src="images/parks.png"></td>
          //         <td>Gymnosperm</td>
          //       </tr>
          //     </tbody>
          //   </table>
          // </div> -->
            });


          this.drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.MARKER,
            drawingControl: true,
            drawingControlOptions: {
              position: google.maps.ControlPosition.TOP_CENTER,
              drawingModes: [
                google.maps.drawing.OverlayType.POLYGON,
              ]
            },
            });
          this.drawingManager.setMap(this.map);


          this.map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(
            document.getElementById('legend'));
       	},
        

        render: function(){
          return this;
        }
    	});
    	return MapView;
  });
