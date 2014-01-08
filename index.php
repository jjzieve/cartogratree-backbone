<!--

Author: Jacob Zieve <jjzieve@ucdavis.edu>
Author:  Hans Vasquez-Gross <havasquez-gross@ucdavis.edu>
CartograTree map interface with Google Map API as base

Version: 3.0.0
Released: 
Updated: 

-->
<html>
<head>
<meta name="viewport" content="initial-scale=1.0, user-scalable=no"/> 
<meta http-equiv="content-type" content="text/html; charset=UTF-8"/> 
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
<link type="text/css" href="css/bootstrap.css"  rel="stylesheet"/>
<link type="text/css" href="css/slick.grid.css"  rel="stylesheet"/>
<link type="text/css" href="css/example-bootstrap.css"  rel="stylesheet"/>
<link type="text/css" href="css/bootstrap-switch.css"  rel="stylesheet"/>
<!-- <link type="text/css" href="css/jquery-ui-1.10.3.custom.css"  rel="stylesheet"/> -->
<!-- <link type="text/css" href="css/tablecloth.css"  rel="stylesheet"/>
 --><link type="text/css" href="css/jquery.treetable.css"  rel="stylesheet"/>
<link type="text/css" href="css/jquery.treetable.theme.default.css" rel="stylesheet"/>
<link type="text/css" href="css/style.css"  rel="stylesheet"/>
<link rel="shortcut icon" href="images/favicon.ico?" type="image/x-icon"><!-- "?" is a hack for FF -->
<script data-main="js/main" src="//cdnjs.cloudflare.com/ajax/libs/require.js/2.1.8/require.min.js"></script>
<!-- <script data-main="js/main" src="js/libs/require/require.js"></script> -->

<title>CartograTree</title>
</head>

<body>
    <!--MAIN-->
	<div class="container">
		<!--NAVBAR/HEADER-->
		<div id="navbar" class="row">
			<div class="col-xs-4">
				<a href="#"><img class="img-responsive" id="ctree_logo" src="images/logo_cartogratree_v2.png"></a>
			</div>
			<div class="col-xs-7 col-xs-offset-1">
				<ul class="nav nav-pills">
					<li><a href="about.html">About</a></li>
					<li><a href="http://dendrome.ucdavis.edu/treegenes/" >TreeGenes</a></li>
					<li><a href="http://dendrome.ucdavis.edu/DiversiTree/">DiversiTree</a></li>
					<li><a href="http://loblolly.ucdavis.edu/bipod/ftp/Documentation/CartogratreeDocumentation.pdf">Documentation</a></li>
					<li><a href="mailto:tg-help.ucdavis.edu">Contact</a>
					<li><a id="credits" data-toggle="popover" data-placement="bottom" title="Credits" href="#">Credits</a></li>
				</ul>
			</div>
		</div>
		<div class="row">
			<!--SIDE BAR/DATA PANE-->
			<div id="sidebar" class="col-xs-4">
				<div id="sidebar_selection" class="well well-sm">
					<div id="select_tree_header">
						<h4>Map Display</h4>
					</div>
					<div class="filler"></div>
					<div id="selection_tree_container">
						<table id="selection_tree">
							<tr data-tt-id="1" class="root">
								<td name="all" value="all">All</td>
							<tr data-tt-id="1-1" data-tt-parent-id="1">
								<td name="studies" value="studies">Published Studies</td>
							</tr>
							<tr data-tt-id="1-2" data-tt-parent-id="1">
								<td name="taxa" value="taxa">Taxa</td>
							</tr>
							<tr data-tt-id="1-3" data-tt-parent-id="1">
								<td name="environmental" value="environmental">Environmental</td>
							</tr>
							<tr data-tt-id="1-3-0" data-tt-parent-id="1-3">
								<td name="ameriflux" value="ameriflux"><img class="inline_image" src="images/ranger_station.png"> Ameriflux</td>
							</tr>
							<tr data-tt-id="1-4" data-tt-parent-id="1">
								<td name="phenotypes" value="phenotypes">Phenotypes</td>
							</tr>
							<tr data-tt-id="1-4-0" data-tt-parent-id="1-4">
								<td name="try_db" value="try_db"><img class="inline_image" src="images/measle_brown.png">TRY-DB</td>
							</tr>
						</table>
					</div>
				</div>
				
				<div id="filters" class="well well-sm">
					<div id="filter_header">
						<h4>Filter Map Display</h4>
					</div>
					<div class="filler"></div>
					<!-- should load with templates -->
					<div class="checkbox">
					    <label>
					      <input type="checkbox" id="sequenced" value="Sequenced">Sequenced (0)
					    </label>
					    <span id="sequenced_qmark" data-original-title="Sequenced samples" data-content="These tree samples have had some amount of sequencing performed on them but not necessarily genotyped" title="" data-toggle="popover">
								<a href="#">
									<img src='images/qmark.png'>
								</a>
						</span>				
					</div>
					<div class="checkbox">
					    <label>
					      <input type="checkbox" id="genotyped" value="Genotyped">Genotyped (0)	      
					    </label>
					    <span id="genotyped_qmark" data-original-title="Genotyped samples" data-content="These tree samples have been genotyped by SNPs and/or other genetic markers" title="" data-toggle="popover">
								<a href="#">
									<img src='images/qmark.png'>
								</a>
						</span>	
					</div>
					<div class="checkbox">
					    <label>
					      <input type="checkbox" id="phenotyped" value="Phenotyped">Phenotyped (0)					      
					    </label>
					    <span id="phenotyped_qmark" data-original-title="Phenotyped samples" data-content="These tree samples have had phenotypes assessed for them" title="" data-toggle="popover">
								<a href="#">
									<img src='images/qmark.png'>
								</a>
						</span>	
					</div>
					<b>GPS Resolution</b>
					<br>
					<div class="checkbox gps">
					    <label>
					      <input type="checkbox" id="exact_gps" value="Exact GPS"><img class="inline_image" src="images/small_green.png">Exact (0)			      
					    </label>
					    <span id="exact_gps_qmark" data-original-title="Exact GPS samples" data-content="Sites with specific and well-defined latitude and longitude coordinates" title="" data-toggle="popover">
								<a href="#">
									<img src='images/qmark.png'>
								</a>
						</span>		
					</div>
					<div class="checkbox gps">
					    <label>
					      <input type="checkbox" id="approx_gps" value="Approximate GPS"><img class="inline_image" src="images/small_yellow.png">Approximate (0)					      
					    </label>
					    <span id="approx_gps_qmark" data-original-title="Approximate GPS samples" data-content="Sites with estimated coordinates which may be as broadly defined as the region or county" title="" data-toggle="popover">
								<a href="#">
									<img src='images/qmark.png'>
								</a>
						</span>	
					</div>
				</div>

			</div>
			<!--MAP-->
			<div class="col-xs-8">
				<div id="map_canvas"></div>
			</div>
		</div>
			<!--ANALYSIS PANE-->
		<div id= "analysis_pane" class="row">
			<div class="col-xs-12">
				<div class="well well-sm">
					<h4>Analyze the data</h4>
					<div class="btn-group pull-right">
					 		<button id="run_tool" type="button" class="btn btn-default">Run tool</button>
						<div class="btn-group pull-right">
						<button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">Tools<span class="caret"></span></button>
							<ul class="dropdown-menu">
							  	<li role="presentation"><a role="menuitem" tabindex="-1" href="#">Get Common Amplicon</a></li>
							    <li role="presentation"><a role="menuitem" tabindex="-1" href="#">Get Common SNP</a></li>
							    <li role="presentation"><a role="menuitem" tabindex="-1" href="#">Get Common Phenotypes</a></li>
							    <li role="presentation"><a role="menuitem" tabindex="-1" href="#">Get WorldClim data</a></li>
							    <li role="presentation"><a role="menuitem" tabindex="-1" href="#">Diversitree Input file</a></li>
							    <li role="presentation" class="divider"></li>
								<li role="presentation"><a role="menuitem" tabindex="-1" href="#">SSWAP/TASSEL Analysis</a></li>
							</ul>
						</div>
					</div>
					<ul class="nav nav-tabs" id="data_tabs">
						<li>
							<a href="#markers" data-toggle="tab">Samples</a>
						</li>
					</ul>
					<div id="data_table_container" class="tab-content">
						<div class="tab-pane fade in" id="markers">
							<div class="btn-group">
								<button class="table_tools btn btn-default" type="button" id="remove_selected">Remove selected</button>
								<button class="table_tools btn btn-default" type="button" id="clear_table">Clear table</button>
							</div>
							<table id="data_table"> 
						    	<td valign="top" class="grid-col">
									<div id="grid" class="grid"></div>
								</td>
							</table>
							Total samples selected: <span id="sample_count">0</span>
						</div>
				</div>
			</div>
		</div>
		<!--FOOTER-->
		<div class="row" id="footer">
			<p>
      				<a href="http://dendrome.ucdavis.edu/treegenes/" target=new>
					<img src="http://dendrome.ucdavis.edu/images/logo_treegenes.png">
				</a>
      			        <a href="http://www.iplantcollaborative.org/" target=new>
					<img src="http://dendrome.ucdavis.edu/iplant/images/iplant_collab_logo.jpg">
				</a>
      			        <a href="http://public.ornl.gov/ameriflux/index.html" target=new>
					<img src="http://dendrome.ucdavis.edu/iplant/images/amerifluxlogo.gif">
				</a>
      			        <a href="http://try-db.org/pmwiki/index.php" target=new>
					<img src="http://dendrome.ucdavis.edu/iplant/images/try_logo.jpg">
				</a>
      			        <a href="http://www.worldclim.org" target=new>
					<img src="http://dendrome.ucdavis.edu/iplant/images/worldclim_logo.png">
				</a>
      			</p>
      			<div id="version_num">v3.0.0</div>
		</div>			

</body>

</html>
