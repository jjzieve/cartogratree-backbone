//Filename: map.js
define([
  'jquery',
  'underscore',
  'backbone',
  'models/map',
  'goog!maps,3,other_params:sensor=false',
], function($,_, Backbone, MapModel){

  	var MapView = Backbone.View.extend({
        el : '#map_canvas',
        //var self = this;
        initialize: function(){
         	this.map =  new google.maps.Map(this.el, this.model.get('mapOptions'));
          this.render();
          this.markersLayer = new google.maps.FusionTablesLayer({
            query: this.model.get("query"),
            map: this.map,
            styleId: 2,
            templateId: 2
          });
          google.maps.event.addListener(this.markersLayer, 'click', function(e){
            var id = e.row["tree_id"].value;
            var lat = e.row["lat"].value;
            var lng = e.row["lng"].value;
            var species= e.row["species"].value;
            $('#data_table').dataTable().fnAddData([
              id,lat,lng,species]);
          });
          google.maps.event.addListener(this.map, 'click', function(){
            $('#data_table').dataTable().fnClearTable();
          });

       	},
        

        render: function(){
          return this;
           // $('#' + this.id).replaceWith(this.el);
         	 //this.$el.append(this.model.get('map'));
          // console.log(this.model.get('map'));
        }
        //   $('#' + this.id).append(this.el);
        //  	return this;
        // }	
    	});
    	return MapView;
  });
