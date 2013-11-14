//Filename: main.js
require.config({
	paths: {
        //font: 'libs/require/font',
        //image: 'libs/require/image',
        //json: 'libs/require/json',
        //noext: 'libs/require/noext',
        //mdown: 'libs/require/mdown',
        //markdownConverter : 'libs/Markdown.Converter'
		// jquery: '//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min',
		// underscore: '//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore-min',
		// backbone: '//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.0.0/backbone-min',
		jquery: 'libs/jquery/jquery',
        bootstrap: 'libs/bootstrap',
        treetable: 'libs/jquery/jquery.treetable',
        dataTables: 'libs/jquery/jquery.dataTables',
		underscore: 'libs/underscore/underscore',
		backbone: 'libs/backbone/backbone',
		async: 'libs/require/async',
        goog: 'libs/require/goog',
        propertyParser : 'libs/require/propertyParser',
	},
	shim: {
		'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        },

	}
});

require(['app'], function(App){
	App.initialize();
});
 
