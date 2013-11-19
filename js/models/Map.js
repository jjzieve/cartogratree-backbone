//Filename: map.js
define([
  'jquery',     
  'underscore',
  'backbone',
  'goog!maps,3,other_params:sensor=false'
], function($, _, Backbone){
    MapModel = Backbone.Model.extend({
        defaults : {
            mapOptions : {
                zoom: 4,
                minZoom: 2,
                maxZoom: 25,
                center: new google.maps.LatLng(38.5539,-121.7381), //Davis, CA
                mapTypeId: 'terrain',
                mapTypeControl: true,
                mapTypeControlOptions: { 
                    style: google.maps.MapTypeControlStyle.DROPDOWN_MENU 
                },
                navigationControl: true,
                navigationControlOptions: { style: google.maps.NavigationControlStyle.ZOOM_PAN },
                scrollwheel: false,
                scaleControl: true
            },
            query: {
              select: 'lat',
              //from: '1_LQUfIWCi4TT2usHdEbttaQqofmFiuixfzkem-A'
              // from: '1ffp9_kJA4D0xeYOBIaUQ8ox7CqqIuB_6sC4Ahww'
              // from: '1jASE5L0kFRWDq2H6BBbffZ2dm4lqOBBJYtWLKGI'
              from: '1AV4s_xvk7OQUMCvxoKjnduw3DjahoRjjKM9eAj8'
            }
        }
    });
    return MapModel;
});
