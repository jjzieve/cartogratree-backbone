//Filename: router.js

define([
	'jquery',
	'underscore',
	'backbone',
	'models/query',
	'models/tree_node',
	'collections/queries',
	'views/map',
	'views/sidebar_selection_tree',
	'views/sidebar_filters',
	'views/data_tabs',
	'views/data_table',
	], function($, _, Backbone, QueryModel, TreeNodeModel, QueriesCollection, MapView, SelectionTreeView, FiltersView,DataTabsView, DataTableView) {
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
				var query = new QueryModel();
				var queries = new QueriesCollection();
 				var treeNode = new TreeNodeModel();
				var mapView = new MapView({collection: queries,model: query}); //get rid of generic endings "view,map"
				var selectionTree = new SelectionTreeView({collection: queries, model: treeNode});
				var filters = new FiltersView({collection: queries,model: query});
				var dataTabs = new DataTabsView({model: query});
				var dataTable = new DataTableView({model: query});
			});
			
			// Backbone.history.start({pushState:true});
			Backbone.history.start();
		};
		return {
			initialize: initialize
		};
});
		
