//Filename: router.js

define([
	'jquery',
	'underscore',
	'backbone',
	'views/MapView',
	], function($, _, Backbone, MapView) {
		console.log(Backbone);
		var AppRouter = Backbone.Router.extend({
			routes: {
				'*actions':'defaultAction'
			}
		});
	
		var initialize = function(){
		
			var app_router = new AppRouter();

			//var headerView = new HeaderView();
			
			app_router.on('route:defaultAction', function(actions){
				var map = new Map({zoom: 8, maxZoom: 18, minZoom: 8});
    				map.initMap({coords: {latitude: -34.397, longitude: 150.644}});
    				var mapView = new MapView({model: map});
    				mapView.render();
			});
			
			//var footerView = new FooterView();
			
			Backbone.history.start();
		};
		return {
			initialize: initialize
		};
});
		
