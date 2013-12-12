//Filename: data_tree.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',    // lib/backbone/backbone
  'treetable',
  'models/tree_node',
  'collections/queries',
  // 'goog!maps,3,other_params:sensor=false'
], function($, _, Backbone, TreeNodeModel , QueriesCollection){
		var SelectionTreeView = Backbone.View.extend({
			el: "#selection_tree",
			template: _.template('<tr data-tt-parent-id="<%= node_num %>"'+
			 					'data-tt-id="<%= new_node_num %>"><td name="<%= type %>"'+
			 					'value="<%= value %>"><%= value %></td></tr>'),
			// template: _.template(treeNodeTemplate), // can't get this to load right
			model: TreeNodeModel,
			collection: QueriesCollection,

			loadBranch: function(data,node_num,index,depth,branch_name){ //can modularize more
				var that = this;
				if( (typeof data) != "object"){//base case
					var parent_node = that.$el.treetable("node", node_num);
					var new_node_num = node_num+'-'+index;
					var type = that.convertDepthToType(depth,branch_name);
					this.model.clear();
					this.model.set("node_num",node_num);
					this.model.set("new_node_num",new_node_num);
					this.model.set("type",type);
					this.model.set("value",data);
					this.$el.treetable("loadBranch",parent_node,that.template(this.model.toJSON()));
					this.$el.treetable("collapseNode",node_num);
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
							that.model.clear();
							that.model.set("node_num",node_num);
							that.model.set("new_node_num",new_node_num);
							that.model.set("type",type);
							that.model.set("value",value);
							that.$el.treetable("loadBranch",parent_node,that.template(that.model.toJSON()));
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
				// console.log(treeNodeTemplate.text);
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
				this.$('[name="all"]').toggleClass('selected');	//toggle all markers shown by default	
				this.collection.add({
					id: "1",
					column: "all",
					value: "all"
				});		

			},

			events: {
			    "click": "toggleSelection",
			},
			ctrlSelect: function(event) {
				var id = $(event.target).parent().attr('data-tt-id'); //just using this as an id to delete from the collection
  				var column = $(event.target).attr('name');
				var value = $(event.target).attr('value');
				if(column && value){//ensures it doesn't deselect on branch expansion
					if ($(this).hasClass('selected'))
					{
						$(this).removeClass("selected");
						this.collection.remove(id);
					}
					else {
						this.collection.add({
							id: id,
							column: column,
							value: value,
						});
					}
	  				$(event.target).toggleClass('selected');
	  			}
			},

  			toggleSelection: function(event){
  				if (event.ctrlKey || event.metaKey) { //meta for "command" on macs
		  			this.ctrlSelect(event);
		  		}
		  		else if (event.shiftKey) { 
		  			console.log("shift");
		  		}
		  		else {
			  		var id = $(event.target).parent().attr('data-tt-id'); //just using this as an id to delete from the collection
	  				var column = $(event.target).attr('name');
					var value = $(event.target).attr('value');

	  				if (column && value){
		  				this.collection.reset();
		  				this.collection.meta("currentQuery",""); 
		  				$(event.target).toggleClass('selected');
		  				if ($(event.target).hasClass('selected'))
	  					{
	  						console.log(column);
							console.log(value);
							this.collection.add(
		  					{
		  						id: id,
		  						column: column,
		  						value: value,
		  					});
	  					}
	  					console.log(this.collection);
			  			$(".selected").not(event.target).removeClass("selected");
		  			}
	  		}
	  				
	  				// $(event.target).toggleClass('selected');
		  		// }  				
  			},

			render: function(){
				return this
			}
	});
  return SelectionTreeView;
  // What we return here will be used by other modules
});
