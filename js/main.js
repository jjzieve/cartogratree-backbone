//Filename: main.js
require.config({
	paths: {
		//jquery: 'libs/jquery/jquery.min',
		jquery: '//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min',
		underscore: 'libs/underscore/underscore-min',
		backbone: 'libs/backbone/backbone-min'
	}
});

require(['app'], function(App){
	App.initialize();
});
 
