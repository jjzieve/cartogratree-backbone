//Filename: router.js

define([
	'jquery',
	'underscore',
	'backbone',
	'models/map',
	'models/data_tree',
	'views/map',
	'views/data_tree',
	'views/data_buttons',
	'views/data_tabs',
	'views/data_table'
	], function($, _, Backbone, MapModel, DataTreeModel, MapView, DataTreeView, DataButtonsView, DataTabsView, DataTableView) {
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
				var dataTreeModel = new DataTreeModel();
				var mapView = new MapView({model: map});
				var dataTreeView = new DataTreeView({model: dataTreeModel});
				var dataButtonsView = new DataButtonsView({model: dataTreeModel});
				var dataTabsView = new DataTabsView({model: map});
				var dataTableView = new DataTableView({model: map});
				dataTreeView.render();
				dataTabsView.render()
				// dataButtonsView.render();

				mapView.render();
			});
			
			// Backbone.history.start({pushState:true});
			Backbone.history.start();
		};
		return {
			initialize: initialize
		};
});
		
