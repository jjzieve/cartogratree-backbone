//Filename: map.js
define([
  'jquery',     
  'underscore',
  'backbone',
  'goog!maps,3,other_params:sensor=false'
], function($, _, Backbone){
    MapModel = Backbone.Model.extend({
        defaults : {
            // mapOptions : {
            //     center: new google.maps.LatLng(50.120833, -122.954444),
            //     zoom: 12,
            //     mapTypeId: google.maps.MapTypeId.TERRAIN
            // }
            mapOptions : {
                zoom: 4,
                minZoom: 2,
                maxZoom: 25,
                center: new google.maps.LatLng(38.5539,-121.7381), //Davis, CA
                mapTypeId: 'terrain',
                mapTypeControl: true,
                mapTypeControlOptions: { 
                    style: google.maps.MapTypeControlStyle.DROPDOWN_MENU 
                },
                navigationControl: true,
                navigationControlOptions: { style: google.maps.NavigationControlStyle.ZOOM_PAN },
                scrollwheel: false,
                scaleControl: true
            }
        }
    });
    return MapModel;
});
