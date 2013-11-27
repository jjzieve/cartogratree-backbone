//Filename: data_tree.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',    // lib/backbone/backbone
  'treetable',
  'models/data_tree'
  // 'models/map',
  // 'goog!maps,3,other_params:sensor=false'
], function($, _, Backbone, DataTreeModel){//MapModel){
		var DataTreeView = Backbone.View.extend({
			el: "#data_tree",

			loadBranch: function(data,node_num){
				var that = this;
				if( (typeof data) != "object"){
					$.each(data,function(index,value){
						var parent_node = that.$el.treetable("node", node_num);
						var new_node_num = node_num+'-'+index
						that.$el.treetable("loadBranch",parent_node,'<tr data-tt-parent-id="'+node_num+'" data-tt-id="'+new_node_num+'"><td>'+value+'</td></tr>');
					});
					that.$el.treetable("collapseNode",node_num);
				}
				else{
					var index = 0;
					$.each(data,function(value,object){
						var parent_node = that.$el.treetable("node", node_num);
						var new_node_num = node_num+'-'+index
						that.$el.treetable("loadBranch",parent_node,'<tr data-tt-parent-id="'+node_num+'" data-tt-id="'+new_node_num+'"><td>'+value+'</td></tr>');
						index++;
						that.loadBranch(object,new_node_num);
					});
					that.$el.treetable("collapseNode",node_num);
				}
			},
    			

			initialize: function(){
				var that = this;
				this.$el.treetable({expandable:true});
				var studies_root =  this.$el.treetable("node", "1");
				var taxa_root =  this.$el.treetable("node", "2");
				$.getJSON('data/taxa.JSON',// should implement recursively this is messy
					function(data){
						// that.loadBranch(data,"2");
						var index1 = 0;
						$.each(data,function(i,val){
							console.log(i);

							that.$el.treetable("loadBranch",taxa_root,'<tr data-tt-parent-id="2" data-tt-id="2-'+index1+'"><td>'+i+'</td></tr>');
							$.each(val,function(j,val2){
								var index2 = 0;
								var parent_node = that.$el.treetable("node", "2-"+index1);
								that.$el.treetable("loadBranch",parent_node,'<tr data-tt-parent-id="2-'+index1+'" data-tt-id="2-'+index1+'-'+index2+'"><td>'+j+'</td></tr>');
								console.log('\t'+j);
								$.each(val2,function(k,val3){
									console.log(typeof val3)
									var index3 = 0;
									var parent_node = that.$el.treetable("node", "2-"+index1+"-"+index2);
									that.$el.treetable("loadBranch",parent_node,'<tr data-tt-parent-id="2-'+index1+'-'+index2+'" data-tt-id="2-'+index1+'-'+index2+'-'+index3+'"><td>'+val3+'</td></tr>');
									console.log('\t\t'+k);	
									index3++;
								})
								that.$el.treetable("collapseNode","2-"+index1+"-"+index2);
								index2++;
							})
							that.$el.treetable("collapseNode","2-"+index1);
							index1++;
						})
						that.$el.treetable("collapseNode","2");
					}
				);

			},

			events: {
			    "click": "highlight",
			},

  			highlight: function(e){
  				if($(e.target).hasClass("clicked")){
					$(e.target).removeClass("clicked");
				}
				else {
  					$(e.target).addClass("clicked");
  				}
  			},

			render: function(){
				return this
			}
	});
  return DataTreeView;
  // What we return here will be used by other modules
});
