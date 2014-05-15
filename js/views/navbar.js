//Filename: data_buttons.js

define([
  // These are path alias that we configured in our bootstrap
  'jquery',     // lib/jquery/jquery
  'underscore', // lib/underscore/underscore
  'backbone',    // lib/backbone/backbone
], function($, _, Backbone){
  // Above we have passed in jQuery, Underscore and Backbone
  // They will not be accessible in the global scope
  var NavBarView = Backbone.View.extend({ 
    el: "#navbar",
    initialize: function(){

      $('#credits').popover({
          trigger:'hover',
          html:'true',
          content:
            "<div>"+
        		"<a href='http://backbonejs.org/' target='_blank'>Backbone</a><br>"+
        		"<a href='http://getbootstrap.com/'target='_blank'>Bootstrap</a><br>"+
        		"<a href='http://jquery.com/' target='_blank'>jQuery</a><br>"+
        		"<a href='https://developers.google.com/fusiontables/' target='_blank'>Google Fusion Tables</a><br>"+
        		"<a href='https://developers.google.com/maps/' target='_blank'>Google Maps</a><br>"+
        		"<a href='https://github.com/mleibman/SlickGrid/wiki' target='_blank'>Slickgrid</a><br>"+
        		"<a href='http://ivaynberg.github.io/select2/' target='_blank'>Select2</a>"+
            "</div>",
            container: "body"
	  // delay: { hide: 2000 }
    }).
    on({
      show: function (e) {
          var $this = $(this);

          // Currently hovering popover
          $this.data("hoveringPopover", true);

          // If it's still waiting to determine if it can be hovered, don't allow other handlers
          if ($this.data("waitingForPopoverTO")) {
              e.stopImmediatePropagation();
          }
      },
      hide: function (e) {
          var $this = $(this);

          // If timeout was reached, allow hide to occur
          if ($this.data("forceHidePopover")) {
              $this.data("forceHidePopover", false);
              return true;
          }

          // Prevent other `hide` handlers from executing
          e.stopImmediatePropagation();
            // Reset timeout checker
          clearTimeout($this.data("popoverTO"));

          // No longer hovering popover
          $this.data("hoveringPopover", false);

          // Flag for `show` event
          $this.data("waitingForPopoverTO", true);

          // In 1500ms, check to see if the popover is still not being hovered
          $this.data("popoverTO", setTimeout(function () {
              // If not being hovered, force the hide
              if (!$this.data("hoveringPopover")) {
                  $this.data("forceHidePopover", true);
                  $this.data("waitingForPopoverTO", false);
                  $this.popover("hide");
              }
          }, 1500));

          // Stop default behavior
          return false;
        }
      });

      // }).mouseenter(function(e) {
      //   $(this).popover('show');
      // }).mouseleave(function(e){
      //   $(this).popover('hide');
      // });
    }
  });

  return NavBarView; 
  // What we return here will be used by other modules
});

