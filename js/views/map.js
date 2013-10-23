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
        initialize: function(){
          console.log('init map view');
         	this.map =  new google.maps.Map(this.el, this.model.get('mapOptions'));
          console.log(this.model.get('mapOptions'));
          console.log(this.map.zoom);
          this.render();
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