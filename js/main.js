//Filename: main.js
require.config({
	paths: {
        //Use these in production for speed boost
    	jquery: '//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min',
    	underscore: '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min',
    	backbone: '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min',
    	select2: 'libs/jquery/select2-3.4.5/select2',
        //Use these in testing
    	// jquery: 'libs/jquery/jquery',
    	// underscore: 'libs/underscore/underscore',
    	// backbone: 'libs/backbone/backbone',

        jquery_migrate: 'libs/jquery/jquery.migrate-1.2.1.min',
        jquery_ui: 'libs/jquery/jquery-ui-1.10.3.custom.min',
        jquery_drag: 'libs/jquery/jquery.event.drag-2.0.min',
        jquery_core: 'libs/jquery/jquery.ui.core',
        jquery_widget: 'libs/jquery/jquery.ui.widget',
        jquery_mouse: 'libs/jquery/jquery.ui.mouse',
        jquery_resizable: 'libs/jquery/jquery.ui.resizable',
        jquery_sortable: 'libs/jquery/jquery.ui.sortable',
    	context_menu: 'libs/maps/ContextMenu',
        tablesorter: 'libs/jquery/jquery.tablesorter',
        tablecloth: 'libs/jquery/jquery.tablecloth',
        lazyjson: 'libs/jquery/jquery.lazyjson.min',
        metadata: 'libs/jquery/jquery.metadata',
        bootstrap: 'libs/bootstrap/bootstrap',
        bootstrap_switch: 'libs/bootstrap/bootstrap-switch',
        bootstrap_slickgrid: 'libs/bootstrap/bootstrap-slickgrid',
    	slick_core: 'libs/slickgrid/slick.core',
    	slick_grid: 'libs/slickgrid/slick.grid',
    	slick_dataview: 'libs/slickgrid/slick.dataview',
    	slick_checkbox: 'libs/slickgrid/slick.checkboxselectcolumn',
    	slick_selection: 'libs/slickgrid/slick.rowselectionmodel',
        treetable: 'libs/jquery/jquery.treetable',
        dataTables: 'libs/jquery/jquery.dataTables',
        async: 'libs/require/async',
        goog: 'libs/require/goog',
        templates: '../templates',
        propertyParser : 'libs/require/propertyParser',
        text: 'libs/require/text',
        heatmap_data: 'heatmapdata',
        arcgis: 'libs/maps/arcgislink',
        sswap: 'sswap'
   	},
	shim: {
    	'backbone': {
                deps: ['underscore', 'jquery'],
                exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        },
    	'context_menu': {
	   deps: ['async!http://maps.google.com/maps/api/js?sensor=false&libraries=drawing,visualization']
    	},
    	'heatmap_data': {
	   deps: ['async!http://maps.google.com/maps/api/js?sensor=false&libraries=drawing,visualization']
    	},
    	'arcgis': {
	   deps: ['async!http://maps.google.com/maps/api/js?sensor=false&libraries=drawing,visualization']
    	},
        'jquery_migrate': {
            deps: ['jquery']
        },
        'jquery_core':{
            deps: ['jquery']
        },
        'jquery_widget':{
            deps: ['jquery_core']
        },
        'jquery_mouse':{
            deps: ['jquery_widget']
        },
        'jquery_resizable':{
            deps: ['jquery_mouse']
        },
        'jquery_sortable':{
            deps: ['jquery_resizable']
        },
        'slick_core':{
            deps: ['jquery_resizable','jquery_drag']
        },
        'slick_grid':{
            deps: ['slick_core']
        },
        'slick_dataview':{
            deps: ['slick_grid']
        },
        'slick_checkbox':{
            deps: ['slick_dataview']
        },
        'slick_selection':{
            deps: ['slick_checkbox']
        },
        'tablecloth':{
            deps: ['jquery']
        },
        'tablesorter':{
            deps: ['jquery']
        },
        'select2':{
            deps: ['jquery']
        }

	}
});

require(['app'], function(App){
	App.initialize();
});
 
