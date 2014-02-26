# Cartogratree 3
This is a user and developer guide intended for Cartogratree. 
For any questions, email
me (jjzieve AT ucdavis DOT edu)
or 
treegenes (tg-help AT ucdavis DOT edu)

### Table of Contents (Users)
1. [Overview](https://github.com/jakeZieve/cartogratree-backbone/tree/dendrome#overview-users)
2. [Use case](https://github.com/jakeZieve/cartogratree-backbone/tree/dendrome#use-case)

### Table of Contents (Developers)
1. [Overview](https://github.com/jakeZieve/cartogratree-backbone/tree/dendrome#overview-developers)
2. [Backend/Database](https://github.com/jakeZieve/cartogratree-backbone/tree/dendrome#backenddatabase)
3. [Core frontend libraries](https://github.com/jakeZieve/cartogratree-backbone/tree/dendrome#core-frontend-libraries)
4. [Styling](https://github.com/jakeZieve/cartogratree-backbone/tree/dendrome#styling)
5. [Models & Collections](https://github.com/jakeZieve/cartogratree-backbone/tree/dendrome#models--collections)
6. [Views](https://github.com/jakeZieve/cartogratree-backbone/tree/dendrome#views)
7. [Router](https://github.com/jakeZieve/cartogratree-backbone/tree/dendrome#router)
7. [Code & design caveats](https://github.com/jakeZieve/cartogratree-backbone/tree/dendrome#code--design-caveats)
8. [TODO](https://github.com/jakeZieve/cartogratree-backbone/tree/dendrome#todo-in-order-of-importance)


#### Overview (Users)

#### Use case


#### Overview (Developers)
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
We essentially have two backends, Google's and our own (i.e. treegenes). We have 4 fusion tables (we only get max 5 for free!) that effectively mirror what we have in our db but provide the fast rendering on google maps.

#####Treegenes
Postgres tables worth mentioning:
- inv_* -> source of genotypes, phenotypes, and the original data for the "is" part of the fusion table "sts_is"
- sample_treesamples -> source of genotypes, phenotypes, and the original data for the "sts" part of the fusion table "sts_is"
- tgdr_* -> source of genotypes, phenotyes, and the original data for the "tgdr" fusion table
- ctree_fusion_table_mv -> source of the "Taxa" part of the sidebar selection tree, essentially a query of the above tables
- tgdr_data_availability_mv -> source of the "Published studies" part of the sidebar selection tree and the [tgdr page](https://dendrome.ucdavis.edu/tgdr/), also a query of the above tables

> The "mv" was my convention to denote materialized views. However, these are "snapshot" materialized views, if we have postgres 9.3+ installed, then they can be made more dynamic, or you can write some trigger functions, up to you. But for now, run update_scripts/create_ctree_fusion_table_mv.php and update_scripts/create_tgdr_data_availability_mv.php everytime there is an update to the tgdr_* tables. 

#####Fusion tables
Existing:
- [tgdr](https://www.google.com/fusiontables/DataSource?docid=1yGLoUUyGDoIxWF3I4iuKq3Y3-ru_7C4knPF4H2Y#rows:id=1)
- [sts_is](https://www.google.com/fusiontables/DataSource?docid=1bL0GwAL_mlUutv9TVFqknjKLkwzq4sAn5mHiiaI#rows:id=1)
- [try_db](https://www.google.com/fusiontables/DataSource?docid=1XwP3nc6H5_AUjdCjpXtrIlrSmtOHXr0Q9p_vrPw#rows:id=1)
- [ameriflux](https://www.google.com/fusiontables/DataSource?docid=1huZ12FnVaWgeUZKaXozbLR0lZfLcxZ_y9RF2h-A#rows:id=1)

> To update a fusion table, for example, tgdr:
1.  run update_scripts/genTSVtgdr.php > tgdr.tsv
2.	Login to the google account "treegenesdb" and go to drive (email me for the password).
3.	Upload tgdr.tsv as a fusion table
4.	Change icon style to reflect the "icon_name" column
5.	Make sure anyone with the link has access to the table (i.e. Cartogratree!)

For the more data-intensive queries such as viewing the genotypes, we query treegenes. See GetCommon*.php scripts



*Tips:*
- sts_is fusion table == inv_* + samples_treesamples tables, look at the queries in the php scripts to clarify
- sswap_agent is the db role calling all the queries to treegenes. So, if there is a wierd issue where you get a 200K and no data, check the permissions on this guy or check the apache logs

#### Core frontend libraries
- [jQuery](http://jquery.com/), basically the backbone of Backbone.js, used extensively in the DOM manipulation and event binding
- [Bootstrap v3.1.1](http://getbootstrap.com/), 90% of the widgets and styles are directly from pulled from these libraries, to give everything a "Web 2.0"ish vibe, and save significant time
- [jquery-treetable](http://ludo.cubicphuse.nl/jquery-treetable/), for the map display selection tree
- [select2](http://ivaynberg.github.io/select2/), for the map display tree id search
- After much debate on what js table API to use ([dataTables](https://datatables.net/),[tablecloth.js](http://tableclothjs.com/), etc.) we chose
[Slickgrid](https://github.com/mleibman/SlickGrid/wiki) for better or worse (mostly because of it's "out of the box" lazy loading capabilities)

#### Styling
I highly recommend re-doing all my terrible css with a pre-processor such as [LESS](http://lesscss.org/) or [SASS](http://sass-lang.com/). This was the most hacky part of the project, I'm truly sorry (I will hopefully never touch css again). If I left any inline styling in index.php, or "! important" tags in the main stylesheet, please email me angry threats. Alas, /css/style.css is the main stylesheet, the libraries also have corresponding sylesheets (e.g. slickgrid -> slick.grid.css + example-bootstrap.css)

#### Models & Collections
- js/models/tree_node.js, handles the data behind the selection tree on the left "Map display" panel. Admittedly, it was a way for me to practice template rendering with models
- js/(models|collections)/(query|queries).js, the core data element for selection. 

> Example: A user selects a "Pinus taeda" to be displayed on the map, a model with a unique id along with the column parameter (in this case, "species"), and its value (in this case, "Pinus taeda")are added to the queries collection, the queries collection constructs a meta variable for the sts_is fusion table (in this case, "species in ('Pinus taeda')"). If a user ctrl+clicks "Picea glauca" the same thing happens except the meta gets updated to "species in ('Pinus taeda','Picea glauca')". I highly recommend playing with the console and logging the queries collection as you click on different parts of the selection tree to see what I mean. After a user selects some trees with the rectangle select, the _meta queries and the rectangle coordinates are sent to google in the urls (QueryFusionTables.php) and are used to populate the analysis sample table.

- js/(models|collections)/tree_id(s).js, the main data shared within the grids in the analysis pane. It makes sense that its the tree ids because they basically act as the joining "key" across genotypes, phenotypes, etc. Its also used as a sub_collection for the sample_grid because that grid relies on the map's queries and the other grid's tree ids. <- This lead to a lot of race conditions, an unfortunate consequence of all the asynchronicity. 

#### Views

##### Top
- js/views/navbar.js, displays the nav-pills at the top of the page

##### Left
- js/views/sidebar_tree_id_search.js, uses the select2 library so a user can search for specific tree_ids, it also queries the fusion tables
- js/views/sidebar_selection_tree.js, pulls from the tree_node model but handles most of the logic for the queries collection.
- js/views/sidebar_filters.js, handles the rest of the logic to the queries collection. It also displays the numbers showing users how many samples for each filter category appear on the map (very buggy). The implementation is a bit convoluted because we couldn't decide whether we wanted a set addition or subtraction when selecting multiple filters. See online shopping websites for an example.

##### Right
- js/views/map.js, using the query collection, it queries google for the map rendering. It also handles the configuring of the map and the heatmap data, this is by far the largest file.

##### Bottom
- js/views/bottom_tabs.js, a controller *per se* for all the grids, when they should be destroyed,created,deleted from, inserted into, etc. based on the run_tools and view buttons
- js/views/*grid.js, slickgrids with corresponding data. My solution for how to handle destruction and creation for these through the tree_nodes_meta attributes is very hacky. Needs a lot of work!!

Hopefully this drawing can visually explain whats going on. Essentially, the models (circles) share the data with the views (rectangles) that they overlap. The arrows indicate directionality of data (e.g. the selection_tree can update the map, but not vice versa) and everything is roughly laid out how it is on the actual page.
![](images/ctree_code.png?raw=true)

####Router
A.k.a the "controller" in other MVC-like frameworks was under-utilized by myself in this single page app. The file (js/router.js) handles the models, collection, and view creation (order matters!). It also handles taking tree_ids from the url see [TODO](https://github.com/jakeZieve/cartogratree-backbone/tree/dendrome#todo-in-order-of-importance). If it was utilized to its full potential we could save states or handle user uploads by REST. Though, talking to the db more seamlessly, using a framework of some type (e.g [laravel](http://laravel.com/)) should be required for this level of integration.

#### Code & design caveats
- What the hell is 
```
var that = this;
```
 anyway? I use it alot in my ajax calls, here's a good [reference](http://stackoverflow.com/questions/4886632/what-does-var-that-this-mean-in-javascript). 
Related topics are [closures](http://stackoverflow.com/questions/111102/how-do-javascript-closures-work) and [callbacks](https://github.com/maxogden/art-of-node#callbacks)
- I made a _meta variable for the queries collection to hold the dynamic query strings that would be sent off to google. In object-orientated-speak you can think of this like a static class variable shared across the "query" objects/models.
- Often "snp", "genotype", "geno" and similarily for "pheno",etc., are used interchangeably in variable names, sorry about that, the same goes for bottom_ and data_
- I didn't atomize the model <-> view relationships as much as I should have in hindsight, but it seemed overkill for me to add a view for every element in the DOM. After all, it wasn't a [Java](http://steve-yegge.blogspot.com/2006/03/execution-in-kingdom-of-nouns.html) project haha 

#### TODO (in order of importance)
1. **Allow map display to reflect URI.** 
This is a significant problem because google won't allow a GET parameter to go beyond a certain number of chars and this is how the map is currently being filtered down (see [models and collections](https://github.com/jakeZieve/cartogratree-backbone/tree/dendrome#models--collections))
1. **Merge backend scripts and general code refactoring.** 
Example, GetCommonSNP.php and GetGenoData.php, effectively run the same query; they just return different things. Also, my code for the grids often uses the same functions, I realize it was bad design on my part but I was in a hurry, Modularize!
3. **Allow filtering in analysis tables.** 
Because the analysis tables are linked, this will allow a user to subset their data based on knowledge of metadata (e.g. only analyze the samples with a certain genotype). See the original [cartogratree](https://dendrome.ucdavis.edu/cartogratree/) and how filtering works for the amplicon table. Also relevant is how to apply filtering in [slickgrids](http://mleibman.github.io/SlickGrid/examples/example4-model.html)
4. **Allow phenotype search in the map display.** 
This would go under the tree id search and allow users to only show markers with certain phenotypes. Ontology may be necessary here, along with cleaning up some data in the backend.
5. **Integrate soil data.**
Ameriflux is too sparse a resource to really be utilized. If we could somehow mirror what was done with the worldclim data using the same source as the soil survey ArcGIS layer this could be invaluable. I also never fully integrated ameriflux with the analysis tables, this would be a start.
6. **Include genotype marker types**
For instance, right now our genotype grid sort of assumes the data is SNPs but the majority of our data is actually SSRs.
7. **TEST!!!!**
I'm sure there are countless bugs. Try using qunit.js and test.hml

