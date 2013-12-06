//Filename: router.js

define([
	'jquery',
	'underscore',
	'backbone',
	'models/map',
	'collections/queries',
	'views/map',
	'views/sidebar_selection_tree',
	'views/sidebar_filters',
	'views/data_tabs',
	'views/data_table',
	], function($, _, Backbone, MapModel, QueriesCollection, MapView, SelectionTreeView, FiltersView, DataTabsView, DataTableView) {
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
				var queries = new QueriesCollection();
				// queries.add({test:"test"});
				// console.log(queries);
				// var mapView = new MapView({model: map});
				var mapView = new MapView({collection: queries}); //get rid of generic endings "view,map"
				var selectionTree = new SelectionTreeView({collection: queries});
				var filters = new FiltersView({model: map});
				var dataTabs = new DataTabsView({model: map});
				var dataTable = new DataTableView({model: map});
			});
			
			// Backbone.history.start({pushState:true});
			Backbone.history.start();
		};
		return {
			initialize: initialize
		};
});
		
