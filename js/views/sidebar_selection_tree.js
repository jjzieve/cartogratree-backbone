//Filename: data_tree.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',    // lib/backbone/backbone
  'treetable',
  'models/map',
  'collections/queries'
  // 'goog!maps,3,other_params:sensor=false'
], function($, _, Backbone, MapModel,QueriesCollection){
		var SelectionTreeView = Backbone.View.extend({
			el: "#selection_tree",
			collection: QueriesCollection,
			loadBranch: function(data,node_num,index,depth,branch_name){ //need to add type genus, year, species, accession,etc.
				var that = this;
				if( (typeof data) != "object"){//base case
					var parent_node = that.$el.treetable("node", node_num);
					var new_node_num = node_num+'-'+index;
					var type = that.convertDepthToType(depth,branch_name);
					that.$el.treetable("loadBranch",parent_node,'<tr data-tt-parent-id="'+node_num+'" data-tt-id="'+new_node_num+'"><td name="'+type+'" value="'+data+'">'+data+'</td></tr>');
					that.$el.treetable("collapseNode",node_num);
				}
				else{
					depth++;
					$.each(data,function(value,object){
						if( (typeof object) != "object"){
							that.loadBranch(object,node_num,index++,depth,branch_name);//throw to base case
						}
						else{
							var parent_node = that.$el.treetable("node", node_num);
							var new_node_num = node_num+'-'+index;
							var type = that.convertDepthToType(depth,branch_name);
							that.$el.treetable("loadBranch",parent_node,'<tr data-tt-parent-id="'+node_num+'" data-tt-id="'+new_node_num+'"><td name="'+type+'" value="'+value+'">'+value+'</td></tr>');
							that.loadBranch(object,new_node_num,index++,depth,branch_name);//recurse
						}
					});
					that.$el.treetable("collapseNode",node_num);
				}

			},
    		convertDepthToType: function(depth,branch_name){
    			if (branch_name == "taxa"){
    				if (depth == 1){
    					return "family";
    				}
    				else if (depth == 2){
    					return "genus";
    				}
    				else{ //depth = 3
    					return "species";
    				}
    			}
    			else { //branch_name is studies
    				if (depth == 1){
    					return "year";
    				}
    				if (depth == 2){
    					return "species";
    				}
    				else{ //depth = 3
    					return "accession";
    				}
    			}
    		},

			initialize: function(){
				var that = this;
				this.$el.treetable({expandable:true});

				$.getJSON('data/studies.JSON',
					function(data){
						that.loadBranch(data,"1-1",0,0,"studies");
					}
				);
				$.getJSON('data/taxa.JSON',
					function(data){
						that.loadBranch(data,"1-2",0,0,"taxa");
					}
				);
				$("#all").toggleClass('selected');				

			},

			events: {
			    "click": "toggleSelection",
			},

			// genFusionWhereStatement: function(target){
			// 	var column = $(target).attr('name');
			// 	var value = $(target).attr('value');
			// 	if (column && value){
			// 		return "'"+column+"' = '"+value+"'";
			// 	}
			// 	else {
			// 		return "";
			// 	}
			// },
  			toggleSelection: function(event){
  				var id = $(event.target).parent().attr('data-tt-id'); //just using this as an id to delete from the collection
  				var column = $(event.target).attr('name');
				var value = $(event.target).attr('value');
  				if (column && value){
  					if ($(event.target).hasClass('selected'))
  					{
  						this.collection.remove(id);
  					}
  					else {
  						this.collection.add(
	  					{
	  						id: id,
	  						column: column,
	  						value: value,
	  					});
  					}
  				$(event.target).toggleClass('selected');
  				}
  			},

			render: function(){
				return this
			}
	});
  return SelectionTreeView;
  // What we return here will be used by other modules
});
