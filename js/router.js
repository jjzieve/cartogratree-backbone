//Filename: router.js

define([
	'jquery',
	'underscore',
	'backbone',
	'models/map',
	'models/tree_node',
	'collections/queries',
	'collections/filters',
	'views/map',
	'views/sidebar_selection_tree',
	'views/sidebar_filters',
	'views/data_tabs',
	'views/data_table',
	], function($, _, Backbone, MapModel, TreeNodeModel, 
					QueriesCollection, FiltersCollection,
					MapView, SelectionTreeView, FiltersView, 
					DataTabsView, DataTableView) {
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
				var filters = new FiltersCollection();
				var treeNode = new TreeNodeModel();
				var mapView = new MapView({collection: queries,model: map}); //get rid of generic endings "view,map"
				var selectionTree = new SelectionTreeView({collection: queries, model: treeNode});
				var filters = new FiltersView({collection: queries,model: map});
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
		
