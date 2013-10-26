//Filename: marker.js

define([
  'jquery',     
  'underscore', 
  'backbone',
  'goog!maps,3,other_params:sensor=false'   
], function($, _, Backbone){
 	var MarkerModel = Backbone.Model.extend({
 		defaults: {
 			lat: 0.0,
 			lng: 0.0,
 			label: null
 		}
 		toMarker: function() {
 			return new google.maps.LatLng(this.get('lat'), this.get('lng'));
 		}
 	});
  return MarkerModel;
});
