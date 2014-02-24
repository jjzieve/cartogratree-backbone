# Cartogratree 3
This is a user and technical guide intended for Cartogratree. 

### Table of Contents (Technical)
1. [Overview](https://github.com/jakeZieve/cartogratree-backbone/tree/dendrome#overview)
2. [Backend/Database](https://github.com/jakeZieve/cartogratree-backbone/tree/dendrome#backenddatabase)
3. [Core frontend libraries](https://github.com/jakeZieve/cartogratree-backbone/tree/dendrome#core-frontend-libraries)
4. [Styling](https://github.com/jakeZieve/cartogratree-backbone/tree/dendrome#styling)
5. [Models & Collections](https://github.com/jakeZieve/cartogratree-backbone/tree/dendrome#models--collections)
6. [Views](https://github.com/jakeZieve/cartogratree-backbone/tree/dendrome#views)
7. [Code & design caveats](https://github.com/jakeZieve/cartogratree-backbone/tree/dendrome#code--design-caveats)
8. [TODO](https://github.com/jakeZieve/cartogratree-backbone/tree/dendrome#todo-in-order-of-importance)

#### Overview
CTree is written in the [Backbone framework](http://backbonejs.org/) which is a frontend (Javascript) MVC. Do a tutorial or two to familiarize yourself before your dive into the code. 
Here's the ones I relied on most:
- [Code school: Anatomy of Backbone.js](https://www.codeschool.com/courses/anatomy-of-backbonejs) <- the basics
- [Backbone tutorials](http://backbonetutorials.com/organizing-backbone-using-modules/) <- Organizational tips and using [require.js](http://requirejs.org/) for AMD
- google and [stackoverflow!](http://stackoverflow.com/questions/tagged/backbone.js) (by far my best resources)

*Tips:*
*If you're an experienced web developer, just ignore me because you probably have better tools than me. But if you aren't, here are some tools that helped me along the way:*
- [RESTClient](https://addons.mozilla.org/en-US/firefox/addon/restclient/), Cool plugin Damian showed me for testing REST requests in your browser (like curl on command line)
- [Firebug](https://addons.mozilla.org/en-US/firefox/addon/firebug/), best development tool (imho) for my favorite browser
- [Empty Cache](https://addons.mozilla.org/en-US/firefox/addon/empty-cache-button/), useful for those times when "you don't know why your styles haven't been updated"


I decided to write ctree in a framework to attempt to adhere to coding best practices (e.g. DRY), how well I did that, is debatable... haha
This project was a learning experience for me, so forgive me for my [callback hell](http://callbackhell.com/) and spaghetti code :)
Have Fun!

####Backend/Database
We essentially have two backends, Google's and our own (i.e. treegenes). We have 4 fusion tables that effectively mirror what we have in our db but provide the fast rendering on google maps.

Fusion table layers:
- [tgdr](https://www.google.com/fusiontables/DataSource?docid=118Vk00La9Ap3wSg8z8LnZQG0mYz5iZ67o3uqa8M#rows:id=1)
- [sts_is](https://www.google.com/fusiontables/DataSource?docid=1bL0GwAL_mlUutv9TVFqknjKLkwzq4sAn5mHiiaI#rows:id=1)
- [try_db](https://www.google.com/fusiontables/DataSource?docid=1XwP3nc6H5_AUjdCjpXtrIlrSmtOHXr0Q9p_vrPw#rows:id=1)
- [ameriflux](https://www.google.com/fusiontables/DataSource?docid=1huZ12FnVaWgeUZKaXozbLR0lZfLcxZ_y9RF2h-A#rows:id=1)

For the more data-intensive queries such as viewing the genotypes, we query treegenes. See GetCommon.php scripts

Some static postgres tables worth mentioning:
- ctree_fusion_table_mv
- tgdr_data_availability_mv
The "_mv" was my convention to denote materialized views. However, they ARE NOT real materialized views, if we have postgres 9.3+ installed on treegenes by the time this document is read, then they can be made into real materialized views. But for now, run the scripts in sql/ everytime there is an update to the tgdr_* tables to re-generate these tables.

*Tips:*
- sts_is == inv_* tables, look at the queries in the php scripts to clarify
- sswap_agent is the db role calling all the queries to treegenes. So, if there is a wierd issue where you get a 200K and no data, check the permissions on this guy or check the apache logs

#### Core frontend libraries
- [jQuery](http://jquery.com/), basically the backbone of Backbone.js, used extensively in the DOM manipulation and event binding
- [Bootstrap](http://getbootstrap.com/), 90% of the widgets and styles are directly from pulled from these libraries, to give everything a "Web 2.0"ish vibe
- [jquery-treetable](http://ludo.cubicphuse.nl/jquery-treetable/), for the map display selection tree
- [select2](http://ivaynberg.github.io/select2/), for the map display tree id search
- After much debate on what js table API to use ([dataTables](https://datatables.net/),[tablecloth.js](http://tableclothjs.com/), etc.) we chose
[Slickgrid](https://github.com/mleibman/SlickGrid/wiki) for better or worse (mostly because of it's "out of the box" lazy loading capabilities)

#### Styling
I highly recommend re-doing all my terrible css with a pre-processor such as [LESS](http://lesscss.org/) or [SASS](http://sass-lang.com/). This was the most hacky part of the project, I'm truly sorry (I will hopefully never touch css again) and if I left any inline styling in index.php, or "! important" tags in the main stylesheet; please email me angry threats. Alas, /css/style.css is the main stylesheet, and the libraries also have corresponding sylesheets (e.g. slickgrid -> slick.grid.css + example-bootstrap.css)

#### Models & Collections
<!-- update with tree_node -->
![](images/ctree_code.png?raw=true)

#### Views
- js/views/amplicon_grid.js
- js/views/bottom_tabs.js
- js/views/genotype_grid.js
- js/views/map.js
- js/views/navbar.js
- js/views/phenotype_grid.js
- js/views/sample_grid.js
- js/views/sidebar_filters.js
- js/views/sidebar_selection_tree.js
- js/views/sidebar_tree_id_search.js
- js/views/worldclim_grid.js

#### Code & design caveats
- What the hell is "var that = this;" anyway? I use it alot in my ajax calls, here's a good [reference](http://stackoverflow.com/questions/4886632/what-does-var-that-this-mean-in-javascript). 
Related topics are [closures](http://stackoverflow.com/questions/111102/how-do-javascript-closures-work) and [callbacks](https://github.com/maxogden/art-of-node#callbacks)
- I made a _meta variable for the queries collection to hold the dynamic query strings that would be sent off to google. In object-orientated-speak you can think of this like a static class variable shared across the "query" objects/models.
- Often "snp", "genotype", "geno" and similarily for "pheno",etc. are used interchangeably in variable names, sorry about that...

#### TODO (in order of importance)
1. **Allow map display to reflect URI.** 
This is a significant problem because google won't allow a GET parameter to go beyond a certain number of chars and this is how the map is currently being filtered down (see [models and collections](https://github.com/jakeZieve/cartogratree-backbone/tree/dendrome#models--collections))
1. **Merge backend scripts and general code refactoring.** 
Example, GetCommonSNP.php and GetGenoData.php, effectively run the same query; they just return different things. Also, my code for the grids often uses the same functions, I realize it was bad design on my part but I was in a hurry, Modularize!
3. **Allow filtering in analysis tables.** 
Because the analysis tables are linked, this will allow a user to subset their data based on knowledge of metadata (e.g. only analyze the samples with a certain genotype). See the original [cartogratree](https://dendrome.ucdavis.edu/cartogratree/) and how filtering works for the amplicon table. Also relevant is how to apply filtering in [slickgrids](http://mleibman.github.io/SlickGrid/examples/example4-model.html)
4. **Allow phenotype search in the map display.** 
This would go under the tree id search and allow users to only show markers with certain phenotypes. Ontology may be necessary here, along with cleaning up some data in the backend.
5. **Integrate soil data.
Ameriflux is too sparse a resource to really be utilized. If we could somehow mirror what was done with the worldclim data using the same source as the soil survey ArcGIS layer this could be invaluable
6. **TEST!!!!**
I'm sure there are countless bugs. Try using qunit.js and test.hml

