//Filename: router.js

define([
	'jquery',
	'underscore',
	'backbone',
	'models/map',
	'views/map',
	'views/sidebar_selection_tree',
	'views/sidebar_filters',
	'views/data_tabs',
	'views/data_table'
	], function($, _, Backbone, MapModel, MapView, SelectionTreeView, FiltersView, DataTabsView, DataTableView) {
		var AppRouter = Backbone.Router.extend({
			routes: {
				'(/)':'index',
				// 'about':'about',
				// 'contact':'contact'
			}
		});
	
		var initialize = function(){
			var appRouter = new AppRouter();
			
			appRouter.on('route:index', function(actions){
				var map = new MapModel();
				var mapView = new MapView({model: map});
				var selectionTreeView = new SelectionTreeView({model: map});
				var filtersView = new FiltersView({model: map});
				var dataTabsView = new DataTabsView({model: map});
				var dataTableView = new DataTableView({model: map});
				mapView.listenTo(map,"change",mapView.render);
			});
			
			// Backbone.history.start({pushState:true});
			Backbone.history.start();
		};
		return {
			initialize: initialize
		};
});
		
