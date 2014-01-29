//Filename: router.js

define([
	'jquery',
	'underscore',
	'backbone',
	'models/query',
	'models/tree_node',
	'models/tree_id',
	'collections/queries',
	'collections/tree_ids',
	'views/navbar',
	'views/map',
	'views/sidebar_selection_tree',
	'views/sidebar_tree_id_search',
	'views/sidebar_filters',
	'views/bottom_tabs',
	'views/bottom_table',
	], function($, _, Backbone, QueryModel, TreeNodeModel, TreeIDModel,
		QueriesCollection, TreeIDCollection,
		NavBarView, MapView, SelectionTreeView, TreeIDSearchView, FiltersView, BottomTabsView, BottomTableView) {
		var AppRouter = Backbone.Router.extend({
			routes: {
				'(/)(?tid=:tree_ids)':'index',
				// '/about':'about',
			},
		});
	
		var initialize = function(){
			var appRouter = new AppRouter();
			
			appRouter.on('route:index', function(tree_ids){

				var navbar = new NavBarView();
				var query = new QueryModel();
				var queries = new QueriesCollection();
				var selected_tree_id = new TreeIDModel();
				var selected_tree_ids = new TreeIDCollection();
				if (tree_ids){//add tree_ids from url to the collection
					var tree_ids_array = tree_ids.split(',');
					$.each(tree_ids_array,function(index,tree_id){
						if(tree_id.substr(0,4) == "TGDR"){
							var column = "tree_id_tgdr";
						}
						else{
							var column = "tree_id_sts_is";
						}
						queries.add({
							id: tree_id,
							column: column,
							value: tree_id
						});
					});
					console.log("Number of tree_ids supplied: "+tree_ids_array.length);
				}

 				var treeNode = new TreeNodeModel();
				var map = new MapView({collection: queries,model: query}); //get rid of generic endings "view,map"
				var selectionTree = new SelectionTreeView({collection: queries, model: treeNode});
				var treeIDSearch = new TreeIDSearchView({collection: queries});
				var filters = new FiltersView({collection: queries,model: query});
				var tabs = new BottomTabsView({collection: selected_tree_ids,model: selected_tree_id});
				var table = new BottomTableView({collection: queries, sub_collection: selected_tree_ids, model: query});


			});
			// appRouter.on('about', function(){
   //    			this.navigate("about.html")
   //  		});
			// Backbone.history.start({pushState:true});
			Backbone.history.start();
		};
		return {
			initialize: initialize
		};
});
		
