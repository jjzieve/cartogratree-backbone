//Filename: main.js
require.config({
	paths: {
        // ***Use these in production for speed boost*** 
		// jquery: '//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min',
		// underscore: '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min',
		// backbone: '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min',
		jquery: 'libs/jquery/jquery',
        tablesorter: 'libs/jquery/jquery.tablesorter',
        tablecloth: 'libs/jquery/jquery.tablecloth',
        metadata: 'libs/jquery/jquery.metadata',
        // jquery_ui: 'libs/jquery/jquery-ui-1.10.3.custom',
        bootstrap: 'libs/bootstrap',
        bootstrap_switch: 'libs/bootstrap-switch',
        treetable: 'libs/jquery/jquery.treetable',
        dataTables: 'libs/jquery/jquery.dataTables',
		underscore: 'libs/underscore/underscore',
		backbone: 'libs/backbone/backbone',
		async: 'libs/require/async',
        goog: 'libs/require/goog',
        templates: '../templates',
        propertyParser : 'libs/require/propertyParser',
        text: 'libs/require/text',
        // fusiontips:'libs/fusiontips',
        //font: 'libs/require/font',
        //image: 'libs/require/image',
        //json: 'libs/require/json',
        //noext: 'libs/require/noext',
        //mdown: 'libs/require/mdown',
        //markdownConverter : 'libs/Markdown.Converter'
	},
	shim: {
		'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        },
        // 'fusiontips': {
        //     deps: ['goog!maps,3,other_params:libraries=drawing&sensor=false']
        // }

	}
});

require(['app'], function(App){
	App.initialize();
});
 
