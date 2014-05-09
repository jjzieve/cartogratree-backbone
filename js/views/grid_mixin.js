define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',
  ], function($, _, Backbone) {
		var GridMixin = {

			clearSlickGrid: function(type){
				if(type === "sample"){ //if the main grid
					$("#clear_table").trigger("click"); // map view listens to this to remove rectangles
				}
				this.data = [];//clear data
				this.dataView.beginUpdate();
				this.dataView.setItems(this.data);
				this.dataView.endUpdate();

				this.grid.updateRowCount();
				this.grid.render();
				this.dataView.syncGridSelection(this.grid, true);
				$(".slick-column-name input[type=checkbox]").attr('checked',false);
				$("#"+type+"_count").html(0); //reset selected count
				if(type === "sample"){ // reset checked rows, if sample grid the sub_collections has the checked rows
					this.sub_collection.reset();
				}
				else{
					this.collection.reset(); 
				}
			},

			setLoaderIcon: function(){
		      this.$el.css({
		          "background-image": "url(images/ajax-loader.gif)",
		          "background-repeat" : "no-repeat",
		          "background-position" : "center"
		      }).addClass("loading");
		    },
		    
		    unsetLoaderIcon: function(){
		      this.$el.css({"background-image":"none"}).removeClass("loading");
		    },

		    gridFunctions: function(){
		    	var sortCol = undefined;
				var sortDir = true;
				function comparer(a, b) {
				var x = a[sortCol], y = b[sortCol];
				return (x == y ? 0 : (x > y ? 1 : -1));
				}
				this.grid.onSort.subscribe(function (e, args) {
				  sortDir = args.sortAsc;
				  sortCol = args.sortCol.field;
				  this.dataView.sort(comparer, sortDir);
				  this.grid.invalidateAllRows();
				  this.grid.render();
				});

				// set the initial sorting to be shown in the header
				if (sortCol) {
				  this.grid.setSortColumn(sortCol, sortDir);
				}

				this.dataView.beginUpdate();
				this.dataView.setItems(this.data);
				// this.dataView.setFilterArgs({
				//   searchString: this.searchString
				// });
				// this.dataView.setFilter(this.myFilter);
				this.dataView.endUpdate();

				this.grid.updateRowCount();
				this.grid.render();

				this.dataView.syncGridSelection(this.grid, true);
		    }
			
		}
		return GridMixin;
});
