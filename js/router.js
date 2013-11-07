//Filename: router.js

define([
	'jquery',
	'underscore',
	'backbone',
	'models/map',
	'models/data_tree',
	'views/map',
	'views/data_tree'
	], function($, _, Backbone, MapModel, DataTreeModel, MapView, DataTreeView) {
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
				var dataTreeModel = new DataTreeModel();
				var mapView = new MapView({model: map});
				var dataTreeView = new DataTreeView({model: dataTreeModel});

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
		
