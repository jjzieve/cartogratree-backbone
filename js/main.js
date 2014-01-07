//Filename: main.js
require.config({
	paths: {
        // ***Use these in production for speed boost*** 
	// jquery: '//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min',
	// underscore: '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min',
	// backbone: '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min',
	jquery: 'libs/jquery/jquery',
	underscore: 'libs/underscore/underscore',
	backbone: 'libs/backbone/backbone',
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
    //font: 'libs/require/font',
    //image: 'libs/require/image',
    //json: 'libs/require/json',
    //noext: 'libs/require/noext',
    //mdown: 'libs/require/mdown',
    //markdownConverter : 'libs/require/Markdown.Converter'
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
    	   deps: ['goog!maps,3,other_params:libraries=drawing&sensor=false']
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
            deps: ['jquery_core','jquery_widget']
        },
        'jquery_resizable':{
            deps: ['jquery_core','jquery_widget','jquery_mouse']
        },
        'jquery_sortable':{
            deps: ['jquery_core','jquery_widget','jquery_mouse','jquery_resizable']
        },
        'slick_grid':{
            deps: ['jquery','jquery_drag']
        },

	}
});

require(['app'], function(App){
	App.initialize();
});
 
