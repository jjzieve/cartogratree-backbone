<?php
/*
   WorldClimData.php
   by Hans Vasquez
   Designed for use with SSWAP.

   Started: 6/8/12
   This Release: 6/8/12


*/
// DEBUG MODE.
ini_set('display_errors', 1);

include_once("../includes/db_access/db_connect.php");
//include_once("includes/incPGSQL.php");


$lat = $_GET['lat'];		// ameriflux site
$lon = $_GET['lon'];		// ameriflux site

function scrub($data)
{
    $str = preg_replace("/'/","&apos",$data);
    return $str;
}

function outputCSV($data) {
    $outstream = fopen("php://output", "w");
    function __outputCSV(&$vals, $key, $filehandler) {
        fputcsv($filehandler, $vals); // add parameters if you want
    }
    array_walk($data, "__outputCSV", $outstream);
    fclose($outstream);
}

if ($lat != "" && $lon != "") {
    $q = "
	SELECT 
		ecp_worldclim.lon_site,
		ecp_worldclim.lat_site,
		ecp_worldclim.tempannmean,
		ecp_worldclim.precipannmean,
		ecp_worldclim.tempmean1,
		ecp_worldclim.tempmean2,
		ecp_worldclim.tempmean3,
		ecp_worldclim.tempmean4,
		ecp_worldclim.tempmean5,
		ecp_worldclim.tempmean6,
		ecp_worldclim.tempmean7,
		ecp_worldclim.tempmean8,
		ecp_worldclim.tempmean9,
		ecp_worldclim.tempmean10,
		ecp_worldclim.tempmean11,
		ecp_worldclim.tempmean12,
		ecp_worldclim.precipmean1,
		ecp_worldclim.precipmean2,
		ecp_worldclim.precipmean3,
		ecp_worldclim.precipmean4,
		ecp_worldclim.precipmean5,
		ecp_worldclim.precipmean6,
		ecp_worldclim.precipmean7,
		ecp_worldclim.precipmean8,
		ecp_worldclim.precipmean9,
		ecp_worldclim.precipmean10,
		ecp_worldclim.precipmean11,
		ecp_worldclim.precipmean12,
		ecp_worldclim.isothermality,
		ecp_worldclim.tempseasonal,
		ecp_worldclim.koeppengeigerid,
		ecp_worldclim.awc_mm,
		ecp_worldclim.s_clay,
		ecp_worldclim.s_gravel,
		ecp_worldclim.s_oc,
		ecp_worldclim.s_sand,
		ecp_worldclim.s_silt,
		ecp_worldclim.t_clay,
		ecp_worldclim.t_gravel,
		ecp_worldclim.t_oc,
		ecp_worldclim.t_sand,
		ecp_worldclim.t_silt
	FROM ecp_worldclim
	WHERE lat_site = $lat AND lon_site = $lon 
	GROUP BY ecp_worldclim.lon_site,
		ecp_worldclim.lat_site,
		ecp_worldclim.tempannmean,
		ecp_worldclim.precipannmean,
		ecp_worldclim.tempmean1,
		ecp_worldclim.tempmean2,
		ecp_worldclim.tempmean3,
		ecp_worldclim.tempmean4,
		ecp_worldclim.tempmean5,
		ecp_worldclim.tempmean6,
		ecp_worldclim.tempmean7,
		ecp_worldclim.tempmean8,
		ecp_worldclim.tempmean9,
		ecp_worldclim.tempmean10,
		ecp_worldclim.tempmean11,
		ecp_worldclim.tempmean12,
		ecp_worldclim.precipmean1,
		ecp_worldclim.precipmean2,
		ecp_worldclim.precipmean3,
		ecp_worldclim.precipmean4,
		ecp_worldclim.precipmean5,
		ecp_worldclim.precipmean6,
		ecp_worldclim.precipmean7,
		ecp_worldclim.precipmean8,
		ecp_worldclim.precipmean9,
		ecp_worldclim.precipmean10,
		ecp_worldclim.precipmean11,
		ecp_worldclim.precipmean12,
		ecp_worldclim.isothermality,
		ecp_worldclim.tempseasonal,
		ecp_worldclim.koeppengeigerid,
		ecp_worldclim.awc_mm,
		ecp_worldclim.s_clay,
		ecp_worldclim.s_gravel,
		ecp_worldclim.s_oc,
		ecp_worldclim.s_sand,
		ecp_worldclim.s_silt,
		ecp_worldclim.t_clay,
		ecp_worldclim.t_gravel,
		ecp_worldclim.t_oc,
		ecp_worldclim.t_sand,
		ecp_worldclim.t_silt; 
	";

	//$setup = array("treegenes_development",$q);
	$setup = $q;
	$query = DBQuery($setup);
	
	if(isset($_GET['csv'])) {      		// boolean pretty print option 
		$csv = $_GET['csv'];		
		$arrayFromDb = array();
		if (pg_num_rows($query) > 0) {
			$array = array("lon_site","lat_site","tempannmean","precipannmean","tempmean1","tempmean2","tempmean3",
				"tempmean4","tempmean5","tempmean6","tempmean7","tempmean8","tempmean9","tempmean10","tempmean11","tempmean12",
				"precipmean1","precipmean2","precipmean3","precipmean4","precipmean5","precipmean6","precipmean7","precipmean8",
				"precipmean9","precipmean10","precipmean11","precipmean12","isothermality","tempseasonal","koeppengeigerid",
				"awc_mm","s_clay","s_gravel","s_oc","s_sand","s_silt","t_clay","t_gravel","t_oc","t_sand","t_silt");
			$arrayFromDb[] = $array;
			while ($res = pg_fetch_assoc($query)) {
				$arrayFromDb[] = $res;	
			}
		}
		// Prepare for download.
		header("Cache-control: private");
		header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
		header("Content-Description: File Transfer");
		//header("Content-Type: application/octet-stream");
		header("Content-Type: text/csv; charset=ansi");
		header("Content-disposition: attachment; filename=\"worldclim_spreadsheet.csv\"");
		header("Expires: 0");
		outputCSV($arrayFromDb);
	} else {
		if (pg_num_rows($query) > 0) {
				$OUTPUT = '';
				
				header('Content-Type: text/html');
			?>
			<html>
			<head>
			
			<!--<link type="text/css" href="css/themes/blue/style.css" rel="stylesheet" />-->
			<script type="text/javascript" src="js/jquery-1.7.2.min.js"></script>
			<script type="text/javascript" src="js/jquery-ui-1.8.20.custom.min.js"></script>
			<script type="text/javascript" src="js/jquery.tablesorter.js"></script>
			<script type="text/javascript">
				$(document).ready(function() 
					{ 
						$("#data_table").tablesorter({
							//debug: true,
							widgets: ['zebra']//turns on odd/even row coloring 
						}); 
					} 
				);
			</script>
			<style>
				table.tablesorter{
					border-collapse:separate;
					border-spacing:1px;
					width:4000;
					background-color: #CDCDCD; //fill in the border color
				}
				
				table.tablesorter thead tr th, table.tablesorter tfoot tr th {
					background-color: #e6EEEE;
					border: 1px solid #FFF;
					font-size: 8pt;
					padding: 5px;
					text-align:center;
					vertical-align:center;
				}

				table.tablesorter thead tr .header {
					background-image: url(css/images/bg.gif);
					background-position: center right;
					background-repeat: no-repeat;
					cursor:pointer;
				}
				
				table.tablesorter tbody td {			
					text-align:right;
					font-size:8pt;
					padding:5px 5px;
					width:200px;
					background-color: #FFF;
					color: #3D3D3D;
					//border: 1px solid grey;
					
				}
				
				table.tablesorter tbody tr.odd td{
					background-color:#F0F0F6;
				}
				
				table.tablesorter tbody tr:hover td{
					background-color:#d0d0d0;
				}
				
				table.tablesorter tbody tr:click td{
					background-color:#d0d0d0;
				}

				table.tablesorter thead tr .headerSortUp {
					background-image: url(css/images/asc.gif);
				}
				
				table.tablesorter thead tr .headerSortDown {
					background-image: url(css/images/desc.gif);
				}
				
				table.tablesorter thead tr .headerSortDown, table.tablesorter thead tr .headerSortUp {
					background-color: #8dbdd8;
				}
			</style>
			</head>
			<body>
			<table id=data_table class="tablesorter">
				<thead>
				<tr>
					<!--<th ><b title="Observation Id">Observation Id<br></b></th> -->
					<th ><b title="Mean Annual Temperature">TempAnnMean<br>[ &deg;C ]</b></th>
					<th ><b title="Mean Annual Precipitation">PrecipAnnMean<br>[ mm ]</b></th>
					<th ><b title="Mean Temperature in January">TempMean1<br>[ &deg;C ]</b></th>
					<th ><b title="Mean Temperature in February">TempMean2<br>[ &deg;C ]</b></th>
					<th ><b title="Mean Temperature in March">TempMean3<br>[ &deg;C ]</b></th>
					<th ><b title="Mean Temperature in April">TempMean4<br>[ &deg;C ]</b></th>
					<th ><b title="Mean Temperature in May">TempMean5<br>[ &deg;C ]</b></th>
					<th ><b title="Mean Temperature in June">TempMean6<br>[ &deg;C ]</b></th>
					<th ><b title="Mean Temperature in July">TempMean7<br>[ &deg;C ]</b></th>
					<th ><b title="Mean Temperature in August">TempMean8<br>[ &deg;C ]</b></th>
					<th ><b title="Mean Temperature in September">TempMean9<br>[ &deg;C ]</b></th>
					<th ><b title="Mean Temperature in October">TempMean10<br>[ &deg;C ]</b></th>
					<th ><b title="Mean Temperature in November">TempMean11<br>[ &deg;C ]</b></th>
					<th ><b title="Mean Temperature in December">TempMean12<br>[ &deg;C ]</b></th>
					<th ><b title="Mean Precipitation in January">PrecipMean1<br>[ mm ]</b></th>
					<th ><b title="Mean Precipitation in February">PrecipMean2<br>[ mm ]</b></th>
					<th ><b title="Mean Precipitation in March">PrecipMean3<br>[ mm ]</b></th>
					<th ><b title="Mean Precipitation in April">PrecipMean4<br>[ mm ]</b></th>
					<th ><b title="Mean Precipitation in May">PrecipMean5<br>[ mm ]</b></th>
					<th ><b title="Mean Precipitation in June">PrecipMean6<br>[ mm ]</b></th>
					<th ><b title="Mean Precipitation in July">PrecipMean7<br>[ mm ]</b></th>
					<th ><b title="Mean Precipitation in August">PrecipMean8<br>[ mm ]</b></th>
					<th ><b title="Mean Precipitation in September">PrecipMean9<br>[ mm ]</b></th>
					<th ><b title="Mean Precipitation in October">PrecipMean10<br>[ mm ]</b></th>
					<th ><b title="Mean Precipitation in November">PrecipMean11<br>[ mm ]</b></th>
					<th ><b title="Mean Precipitation in December">PrecipMean12<br>[ mm ]</b></th>
					<th ><b title="Isothermality (Mean Diurnal Range (Mean of monthly (max temp - min temp))) / ((Max Temperature of Warmest Month) - (Min Temperature of Coldest Month))">Isothermality<br></b></th>
					<th ><b title="Temperature Seasonality">TemperatureSeasonality</b></th>
					<th ><b title="Koeppen Geiger Climate Classification">KoeppenGeigerCode<br></b></th>
					<th ><b title="Available Water Storage Capacity">AWC_mm<br>[ mm / m ]</b></th>
					<th ><b title="Subsoil Clay Content">S_Clay_%<br>[ % ]</b></th>
					<th ><b title="Subsoil Gravel Content">S_Gravel_%<br>[ % ]</b></th>
					<th ><b title="Subsoil Organic Carbon Content">S_OC_%<br>[ % ]</b></th>
					<th ><b title="Subsoil Sand Content">S_Sand_%<br>[ % ]</b></th>
					<th ><b title="Subsoil Silt Content">S_Silt_%<br>[ % ]</b></th>
					<th ><b title="Topsoil Clay Content">T_Clay_%<br>[ % ]</b></th>
					<th ><b title="Topsoil Gravel Content">T_Gravel_%<br>[ % ]</b></th>
					<th ><b title="Topsoil Organic Carbon Content">T_OC_%<br>[ % ]</b></th>
					<th ><b title="Topsoil Sand Content">T_Sand_%<br>[ % ]</b></th>
					<th ><b title="Topsoil Silt Content">T_Silt_%<br>[ % ]</b></th>
				</tr>
				
				</thead>
				<tbody>
			<?php
				while ($res = pg_fetch_assoc($query)) {
					$lon_site		= $res["lon_site"];
					$lat_site		= $res["lat_site"];
					$tempannmean		= $res["tempannmean"];
					$precipannmean		= $res["precipannmean"];
					$tempmean1		= $res["tempmean1"];
					$tempmean2		= $res["tempmean2"];
					$tempmean3		= $res["tempmean3"];
					$tempmean4		= $res["tempmean4"];
					$tempmean5		= $res["tempmean5"];
					$tempmean6		= $res["tempmean6"];
					$tempmean7		= $res["tempmean7"];
					$tempmean8		= $res["tempmean8"];
					$tempmean9		= $res["tempmean9"];
					$tempmean10		= $res["tempmean10"];
					$tempmean11		= $res["tempmean11"];
					$tempmean12		= $res["tempmean12"];
					$precipmean1		= $res["precipmean1"];
					$precipmean2		= $res["precipmean2"];
					$precipmean3		= $res["precipmean3"];
					$precipmean4		= $res["precipmean4"];
					$precipmean5		= $res["precipmean5"];
					$precipmean6		= $res["precipmean6"];
					$precipmean7		= $res["precipmean7"];
					$precipmean8		= $res["precipmean8"];
					$precipmean9		= $res["precipmean9"];
					$precipmean10		= $res["precipmean10"];
					$precipmean11		= $res["precipmean11"];
					$precipmean12		= $res["precipmean12"];
					$isothermality		= $res["isothermality"];
					$tempseasonal		= $res["tempseasonal"];
					$koeppengeigerid	= $res["koeppengeigerid"];
					$awc_mm			= $res["awc_mm"];
					$s_clay			= $res["s_clay"];
					$s_gravel		= $res["s_gravel"];
					$s_oc			= $res["s_oc"];
					$s_sand			= $res["s_sand"];
					$s_silt			= $res["s_silt"];
					$t_clay			= $res["t_clay"];
					$t_gravel		= $res["t_gravel"];
					$t_oc			= $res["t_oc"];
					$t_sand			= $res["t_sand"];
					$t_silt			= $res["t_silt"];

					$OUTPUT .= "<tr>";
				//        $OUTPUT .= "<td>$lon_site</td><td>$lat_site</td>";
					$OUTPUT .= "<td>$tempannmean</td><td>$precipannmean</td>";
					$OUTPUT .= "<td>$tempmean1</td><td>$tempmean2</td>";
					$OUTPUT .= "<td>$tempmean3</td><td>$tempmean4</td>";
					$OUTPUT .= "<td>$tempmean5</td><td>$tempmean6</td>";
					$OUTPUT .= "<td>$tempmean7</td><td>$tempmean8</td>";
					$OUTPUT .= "<td>$tempmean9</td><td>$tempmean10</td>";
					$OUTPUT .= "<td>$tempmean11</td><td>$tempmean12</td>";
					$OUTPUT .= "<td>$precipmean1</td><td>$precipmean2</td>";
					$OUTPUT .= "<td>$precipmean3</td><td>$precipmean4</td>";
					$OUTPUT .= "<td>$precipmean5</td><td>$precipmean6</td>";
					$OUTPUT .= "<td>$precipmean7</td><td>$precipmean8</td>";
					$OUTPUT .= "<td>$precipmean9</td><td>$precipmean10</td>";
					$OUTPUT .= "<td>$precipmean11</td><td>$precipmean12</td>";
					$OUTPUT .= "<td>$isothermality</td><td>$tempseasonal</td>";
					$OUTPUT .= "<td>$koeppengeigerid</td><td>$awc_mm</td>";
					$OUTPUT .= "<td>$s_clay</td><td>$s_gravel</td>";
					$OUTPUT .= "<td>$s_oc</td><td>$s_sand</td>";
					$OUTPUT .= "<td>$s_silt</td>";
					$OUTPUT .= "<td>$t_clay</td><td>$t_gravel</td>";
					$OUTPUT .= "<td>$t_oc</td><td>$t_sand</td>";
					$OUTPUT .= "<td>$t_silt</td>";
					$OUTPUT .= "</tr>";
				}
				$OUTPUT .= "</tbody></table>";
				print($OUTPUT);
		}
		else{
			header('Content-Type: text/plain');
			print "no data found";
		}
	}
}
?>
