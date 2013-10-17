//Filename: MapView.js
define([
  'jquery',
  'underscore',
  'backbone',
  'models/Map',
  'goog!maps,3,other_params:sensor=false',
], function($,_, Backbone, Map){
	var MapView = Backbone.View.extend({
    	defaults:{region: 'us', language: 'en'},
    	id: 'gmaps-container',
    	className: 'gmaps_container',
      	initialize: function(){
			// var url = "http://maps.googleapis.com/maps/api/js?sensor=false";
			// $.ajax({
			//     url: url,
			//     dataType: "script",
			//     async: false,
			//     success: function(){
			//         console.log('script loaded');
			//     }
			// });
        	this.model.set('map', new google.maps.Map(this.el, this.model.get('mapOptions')));
     	},
      	render: function(){
        	console.log('init map');
        	$('#' + this.id).replaceWith(this.el);
        	return this;
      	}	
  	});
  	return MapView;
});
