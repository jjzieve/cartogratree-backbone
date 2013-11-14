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
      	// id: 'gmaps-container',
      	// className: 'gmaps_container',
        //var self = this;
        initialize: function(){
          console.log('init map view');
         	this.map =  new google.maps.Map(this.el, this.model.get('mapOptions'));
          console.log(this.model.get('mapOptions'));
          console.log(this.map.zoom);
          this.render();
          this.markersLayer = new google.maps.FusionTablesLayer({
            query: {
              select: 'lat',
              //from: '1_LQUfIWCi4TT2usHdEbttaQqofmFiuixfzkem-A'
              // from: '1ffp9_kJA4D0xeYOBIaUQ8ox7CqqIuB_6sC4Ahww'
              // from: '1jASE5L0kFRWDq2H6BBbffZ2dm4lqOBBJYtWLKGI'
              from: '1AV4s_xvk7OQUMCvxoKjnduw3DjahoRjjKM9eAj8'
            },
            map: this.map,
            styleId: 2,
            templateId: 2
          });
          console.log('queried');
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
