define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',
  ], function($, _, Backbone) {
		var GridMixin = {

			data: [],
			options: {
				enableCellNavigation: true,
				enableColumnReorder: true,
				// forceFitColumns: true,
				rowHeight: 35,
				topPanelHeight: 25
			},

			arrayCmp: function(arr1,arr2){ //returns true if same elements and lengths of two arrays, not necessarily in same order
        		return !($(arr1).not(arr2).length == 0 && $(arr1).not(arr2).length == 0);
      		}, 

			listenToSelectedRows: function(){
				if(this.grid){
					var that = this;
					this.grid.onSelectedRowsChanged.subscribe(function(){  // update selected count and set the sub collection to the selected ids
						$("#"+that.type+"_count").html(that.grid.getSelectedRows().length);
						if(that.type === "sample"){	//only update the collection from the "parent" sample tab, the other grids shouldn't effect one another
							that.sub_collection.reset();
							$.each(that.grid.getSelectedRows(), function(index,idx){ //add newly selected ones
							    var id = that.dataView.getItemByIdx(idx)["id"];//.replace(/\.\d+$/,""); maybe add back in
							    var lat = that.dataView.getItemByIdx(idx)["lat"]; //lat and lng for world_clim tool
							    var lng = that.dataView.getItemByIdx(idx)["lng"];
							    var index = index;
							    that.sub_collection.add({
									id: id,
									lat: lat,
									lng: lng,
									index: index
							    }); 
						  	});
					  		that.sub_collection.trigger("done");
						}
					});
				}

			},

			removeSelected: function(){
				var that = this;
				if (this.grid.getSelectedRows().length == this.grid.getDataLength()){ // clear if all selected, not iterate remove
					this.clearSlickGrid();
				}
				else{
					var ids = this.dataView.mapRowsToIds(this.grid.getSelectedRows());
					$.each(ids,function(index,id){
	  					console.log("deleting: "+id);
	  					that.dataView.deleteItem(id);
					});
					this.grid.invalidate();
				}
			},

			pollForOpenTab: function(){
				if(this.type === "amplicon" && this.collection.meta("amplicon_pill_open")){
       				this.setElement("#amplicon_table_container"); //set the el for this when the amplicon DOM is added
   					this.updateSlickGrid();
			    }
				else if(this.collection.meta(this.type+"_tab_open")){
					this.updateSlickGrid();
					this.listenTo(this.collection,"close_"+this.type+"_tab", this.deleteGrid);
				}
			},

			clearSlickGrid: function(){
				if(this.type === "sample"){ //if the main grid
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
				$("#"+this.type+"_count").html(0); //reset selected count
				if(this.type === "sample"){ // reset checked rows, if sample grid the sub_collections has the checked rows
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
		    	var that = this; //for the onSort method, otherwise contexts get messed up
		    	var sortCol = undefined;
				var sortDir = true;
				function comparer(a, b) {
				var x = a[sortCol], y = b[sortCol];
				return (x == y ? 0 : (x > y ? 1 : -1));
				}
				this.grid.onSort.subscribe(function (e, args) {
				  sortDir = args.sortAsc;
				  sortCol = args.sortCol.field;
				  that.dataView.sort(comparer, sortDir);
				  that.grid.invalidateAllRows();
				  that.grid.render();
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
		    },
		    
		    initGrid: function(){
		      this.dataView = new Slick.Data.DataView();
		      this.grid = new Slick.Grid("#"+this.type+"_grid", this.dataView, this.columns, this.options);
		      this.grid.setSelectionModel(new Slick.RowSelectionModel());
		      this.grid.registerPlugin(this.checkboxSelector);
		    },

		    deleteGrid: function(){ //should probably use backbone native view.remove()
		      console.log('deleteGrid '+this.type);
		      $("#"+this.type+"_grid").empty();// clear the html though the next commands should have done that anyways
		      delete this.columns;
		      delete this.grid;
		      delete this.dataView;
		      delete this.prev_accessions;
		      delete this.prev_phenotypes;

		    },
			
		}
		return GridMixin;
});
