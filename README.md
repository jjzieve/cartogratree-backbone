# Cartogratree 3
This is a technical guide intended for further developing of Cartogratree. 

### Table of Contents
1. Overview
2. Libraries
3. Models & Collections
4. Views
5. Future directions and general thoughts

#### Overview
CTree is written in the [Backbone framework](http://backbonejs.org/) which is a frontend MVC. Do a tutorial or two to familiarize yourself before your dive into the code. 
Here's the ones I relied on most:
- [Backbone tutorials](http://backbonetutorials.com/organizing-backbone-using-modules/)
- [Code school: Anatomy of Backbone.js](https://www.codeschool.com/courses/anatomy-of-backbonejs)
- google and [stackoverflow!](http://stackoverflow.com/questions/tagged/backbone.js) (probably my best resources...)

The UI is almost completely [Bootstrap](http://getbootstrap.com/), mostly because I suck at styling but also because it looks "Web 2.0"ish and we designed the app to look 
more simple and usable than the previous iteration. 

<!-- I scrapped the code from the first iteration because we needed to integrate fusion table layers and make it extensible. Doing this with the old code would have been next to impossible. -->

The general file struture is as follows
├── about.html
├── AssociationRRG.php
├── css
│   ├── bootstrap.css
│   ├── bootstrap-switch.css
│   ├── example-bootstrap.css
│   ├── jquery.treetable.css
│   ├── jquery.treetable.theme.default.css
│   ├── jquery-ui-1.10.3.custom.css
│   ├── qunit-1.13.0.css
│   ├── slick.grid.css
│   ├── style.css
│   └── tablecloth.css
├── data
│   ├── all_markers.JSON
│   ├── pgToJSON.py
│   ├── studies.JSON
│   └── taxa.JSON
├── DiversitreeDownload.php
├── GetAmerifluxData.php
├── GetArcGISLegends.php
├── GetCommonAmplicon.php
├── GetCommonPheno.php
├── GetCommonSNP.php
├── GetGenoData.php
├── GetPhenoData.php
├── GetWorldClimData.php
├── images
│   ├── ajax-loader.gif
│   ├── asc.gif
│   ├── asc_light.gif
│   ├── bg-table-thead.png
│   ├── collapse-light.png
│   ├── collapse.png
│   ├── desc.gif
│   ├── desc_light.gif
│   ├── expand-light.png
│   ├── expand.png
│   ├── favicon.ico
│   ├── heatmap.jpg
│   ├── logo_cartogratree_v2.png
│   ├── measle_brown.png
│   ├── parks.png
│   ├── qmark.png
│   ├── ranger_station.png
│   ├── small_green.png
│   ├── small_yellow.png
│   ├── sort-asc.gif
│   ├── sort_asc.jpg
│   ├── sort_both.jpg
│   ├── sort-desc.gif
│   ├── sort_desc.jpg
│   └── sswapinfoicon.png
├── index.php
├── js
│   ├── app.js
│   ├── boilerplate.js
│   ├── collections
│   │   ├── queries.js
│   │   └── tree_ids.js
│   ├── heatmapdata.js
│   ├── libs
│   │   ├── backbone
│   │   │   └── backbone.js
│   │   ├── bootstrap
│   │   │   ├── bootstrap.js
│   │   │   ├── bootstrap-slickgrid.js
│   │   │   └── bootstrap-switch.js
│   │   ├── jquery
│   │   │   ├── jquery.dataTables.js
│   │   │   ├── jquery.event.drag-2.0.min.js
│   │   │   ├── jquery.event.drag.live-2.2.js
│   │   │   ├── jquery.event.drop-2.2.js
│   │   │   ├── jquery.event.drop.live-2.2.js
│   │   │   ├── jquery.js
│   │   │   ├── jquery.lazyjson.min.js
│   │   │   ├── jquery.metadata.js
│   │   │   ├── jquery.migrate-1.2.1.min.js
│   │   │   ├── jquery.tablecloth.js
│   │   │   ├── jquery.tablesorter.js
│   │   │   ├── jquery.treetable.js
│   │   │   ├── jquery-ui-1.10.3.custom.js
│   │   │   ├── jquery-ui-1.10.3.custom.min.js
│   │   │   ├── jquery.ui.core.js
│   │   │   ├── jquery.ui.mouse.js
│   │   │   ├── jquery.ui.resizable.js
│   │   │   ├── jquery.ui.sortable.js
│   │   │   ├── jquery.ui.widget.js
│   │   │   └── select2-3.4.5
│   │   │       ├── bower.json
│   │   │       ├── LICENSE
│   │   │       ├── README.md
│   │   │       ├── release.sh
│   │   │       ├── select2-bootstrap.css
│   │   │       ├── select2.css
│   │   │       ├── select2.jquery.json
│   │   │       ├── select2.js
│   │   │       ├── select2_locale_ar.js
│   │   │       ├── select2_locale_bg.js
│   │   │       ├── select2_locale_ca.js
│   │   │       ├── select2_locale_cs.js
│   │   │       ├── select2_locale_da.js
│   │   │       ├── select2_locale_de.js
│   │   │       ├── select2_locale_el.js
│   │   │       ├── select2_locale_en.js.template
│   │   │       ├── select2_locale_es.js
│   │   │       ├── select2_locale_et.js
│   │   │       ├── select2_locale_eu.js
│   │   │       ├── select2_locale_fa.js
│   │   │       ├── select2_locale_fi.js
│   │   │       ├── select2_locale_fr.js
│   │   │       ├── select2_locale_gl.js
│   │   │       ├── select2_locale_he.js
│   │   │       ├── select2_locale_hr.js
│   │   │       ├── select2_locale_hu.js
│   │   │       ├── select2_locale_id.js
│   │   │       ├── select2_locale_is.js
│   │   │       ├── select2_locale_it.js
│   │   │       ├── select2_locale_ja.js
│   │   │       ├── select2_locale_ko.js
│   │   │       ├── select2_locale_lt.js
│   │   │       ├── select2_locale_lv.js
│   │   │       ├── select2_locale_mk.js
│   │   │       ├── select2_locale_ms.js
│   │   │       ├── select2_locale_nl.js
│   │   │       ├── select2_locale_no.js
│   │   │       ├── select2_locale_pl.js
│   │   │       ├── select2_locale_pt-BR.js
│   │   │       ├── select2_locale_pt-PT.js
│   │   │       ├── select2_locale_ro.js
│   │   │       ├── select2_locale_ru.js
│   │   │       ├── select2_locale_sk.js
│   │   │       ├── select2_locale_sv.js
│   │   │       ├── select2_locale_th.js
│   │   │       ├── select2_locale_tr.js
│   │   │       ├── select2_locale_ua.js
│   │   │       ├── select2_locale_vi.js
│   │   │       ├── select2_locale_zh-CN.js
│   │   │       ├── select2_locale_zh-TW.js
│   │   │       ├── select2.min.js
│   │   │       ├── select2.png
│   │   │       ├── select2-spinner.gif
│   │   │       └── select2x2.png
│   │   ├── maps
│   │   │   ├── arcgislink.js
│   │   │   └── ContextMenu.js
│   │   ├── require
│   │   │   ├── async.js
│   │   │   ├── depend.js
│   │   │   ├── font.js
│   │   │   ├── goog.js
│   │   │   ├── image.js
│   │   │   ├── json.js
│   │   │   ├── Markdown.Converter.js
│   │   │   ├── mdown.js
│   │   │   ├── noext.js
│   │   │   ├── propertyParser.js
│   │   │   ├── require.js
│   │   │   └── text.js
│   │   ├── slickgrid
│   │   │   ├── slick.checkboxselectcolumn.js
│   │   │   ├── slick.core.js
│   │   │   ├── slick.dataview.js
│   │   │   ├── slick.grid.js
│   │   │   └── slick.rowselectionmodel.js
│   │   └── underscore
│   │       └── underscore.js
│   ├── main.js
│   ├── models
│   │   ├── query.js
│   │   ├── tree_id.js
│   │   └── tree_node.js
│   ├── router.js
│   ├── sswap.js
│   ├── tests
│   │   ├── qunit-1.13.0.js
│   │   └── tests.js
│   └── views
│       ├── amplicon_grid.js
│       ├── bottom_tabs.js
│       ├── map.js
│       ├── navbar.js
│       ├── phenotype_grid.js
│       ├── sample_grid.js
│       ├── sidebar_filters.js
│       ├── sidebar_selection_tree.js
│       ├── sidebar_tree_id_search.js
│       ├── snp_grid.js
│       └── worldclim_grid.js
├── QueryFusionTables.php
├── README.md
├── templates
│   ├── ameriflux_infowindow.html
│   ├── default_tool_dropdown.html
│   ├── sample_tool_dropdown.html
│   ├── sts_is_infowindow.html
│   ├── table_row.html
│   ├── tgdr_infowindow.html
│   └── try_db_infowindow.html
├── test.html
└── worldclimjson.php

**A note: **
*I decided to write it in a framework to attempt to adhere to best practices (e.g. DRY), how well I did that, is debatable... haha*
*This project was a learing experience for me in javascript, so forgive me for my noobish mistakes :)*

#### Libraries

#### Models & Collections

#### Views

#### Future directions and general thoughts