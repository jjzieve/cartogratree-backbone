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
			 					'value="<%= value %>"><%= display %></td></tr>'),
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
					if(type == "accession"){ // hack to show author names and journals
						this.model.set("value",data.split("|")[0]);
						this.model.set("display",data.split("|")[1]);
					}
					else{
						this.model.set("value",data);
						this.model.set("display",data);
					}
					

					
					// console.log(type);
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
							that.model.set("display",value);
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
    					return "species_sts_is"; //must make distinction between the two species (in tgdr and in sts_is)
    				}
    			}
    			else { //branch_name is studies
    				if (depth == 1){
    					return "year";
    				}
    				if (depth == 2){
    					return "species_tgdr";
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
				if (this.collection.length == 0){ //if no tree_ids in url
					this.$('[name="all"]').toggleClass('selected');	//toggle all markers shown by default	
					this.collection.add({
	                	id: "1",
	                	column: "all",
	               		value: "all"
	              	});  
				}
			
			},

			events: {
			    "click": "toggleSelection",
			},

			toggleSelection: function(event){
		  		var id = $(event.target).parent().attr('data-tt-id'); //just using this as an id to delete from the collection
  				var column = $(event.target).attr('name');
				var value = $(event.target).attr('value');
  				if (column && value){
  					if (!(event.ctrlKey || event.metaKey)){ //if ctrl-click we want to not reset the queries
  						this.collection.reset();
  					}
					$(event.target).toggleClass('selected');
	  				if ($(event.target).hasClass('selected'))
  					{
						this.collection.add(
	  					{
	  						id: id,
	  						column: column,
	  						value: value,
	  					});
  					}
  					else {
						this.collection.remove(id);
					}
  					if (!(event.ctrlKey || event.metaKey)){ //if ctrl-click we want to not reset the selected classes (i.e. highlighted rows)
  						$("#selection_tree .selected").not(event.target).removeClass("selected");
  					}
		  			
		  		}
	  		},
	  				
			render: function(){
				return this
			}
	});
  return SelectionTreeView;
  // What we return here will be used by other modules
});
