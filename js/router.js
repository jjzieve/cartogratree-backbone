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
	'views/grid_mixin',
	'views/sample_grid',
	'views/genotype_grid',
	'views/phenotype_grid',
	'views/worldclim_grid',
	'views/amplicon_grid',
	'views/bottom_tabs',
	], function($, _, Backbone, QueryModel, TreeNodeModel, TreeIDModel,
		QueriesCollection, TreeIDCollection,
		NavBarView, MapView, SelectionTreeView, TreeIDSearchView, FiltersView, GridMixin, SamplesView, GenotypeView, PhenotypeView, WorldClimView, AmpliconView, BottomTabsView) {
		var AppRouter = Backbone.Router.extend({
			routes: {
				'(/)(?tid=:tree_ids)':'index',
				'(/)about':'about',
			},
			navigate: function (url) { 
				window.location = url; 
			}
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

				//add some functions from the Mixin to the views to maintain DRY
				_.extend(SamplesView.prototype, GridMixin);
				_.extend(GenotypeView.prototype, GridMixin);
				_.extend(PhenotypeView.prototype, GridMixin);
				_.extend(WorldClimView.prototype, GridMixin);
				_.extend(AmpliconView.prototype, GridMixin);


 				var treeNode = new TreeNodeModel();
				var map = new MapView({collection: queries,model: query}); //get rid of generic endings "view,map"
				var selectionTree = new SelectionTreeView({collection: queries, model: treeNode});
				var treeIDSearch = new TreeIDSearchView({collection: queries});
				var filters = new FiltersView({collection: queries,model: query});
				var tabs = new BottomTabsView({collection: selected_tree_ids,model: selected_tree_id});
				var sample_table = new SamplesView({collection: queries, sub_collection: selected_tree_ids, model: query}); //parent of the other tables
				var geno_table = new GenotypeView({collection: selected_tree_ids,model:selected_tree_id});
				var pheno_table = new PhenotypeView({collection: selected_tree_ids,model:selected_tree_id});
				var worldclim_table = new WorldClimView({collection: selected_tree_ids,model:selected_tree_id});
				var amplicon_table = new AmpliconView({collection: selected_tree_ids,model:selected_tree_id});


			});
			appRouter.on('route:about', function(){
				console.log('about');
   	   			this.navigate("about.html");
   	  		});
			//Backbone.history.start({pushState:true});
			Backbone.history.start();
		};
		return {
			initialize: initialize
		};
});
		
