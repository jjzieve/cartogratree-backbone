//Filename: Map.js
define([
  'jquery',     
  'underscore',
  'backbone',
  'goog!maps,3,other_params:sensor=false'
], function($, _, Backbone){
    Map = Backbone.Model.extend({
        defaults: {
            id: '', currentLatLng: {}, mapOptions: {}, map: {},
            position: {}, zoom: 13, maxZoom: 16, minZoom: 12
        },
        initMap: function(position){
            this.set('position', position);
            var currentLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            this.set('currentLatLng', currentLatLng);
            var mapOptions = {
                zoom: this.get('zoom'),
                minZoom: this.get('minZoom'),
                maxZoom: this.get('maxZoom'),
                center: currentLatLng,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                mapTypeControl: false
            };
            this.set('mapOptions', mapOptions);
        }
    });
    return Map;
});
