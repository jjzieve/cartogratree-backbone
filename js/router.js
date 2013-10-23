//Filename: router.js

define([
	'jquery',
	'underscore',
	'backbone',
	'models/map',
	'views/map'
	], function($, _, Backbone, MapModel, MapView) {
		var AppRouter = Backbone.Router.extend({
			routes: {
				'(/)':'index',
				// 'about':'about',
				// 'contact':'contact'
			}
		});
	
		var initialize = function(){
			console.log('router');
			var appRouter = new AppRouter();
			//var headerView = new HeaderView();
			
			appRouter.on('route:index', function(actions){
				var map = new MapModel();
				var mapView = new MapView({model: map});
				console.log(mapView.el);
			//	mapView.render();
			});
			
			//var footerView = new FooterView();
			
			// Backbone.history.start({pushState:true});
			Backbone.history.start();
		};
		return {
			initialize: initialize
		};
});
		
