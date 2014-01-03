<?php
if (isset($_GET['lat'])) {
	if(isset($_GET['lon'])){
                $escapedLat = pg_escape_string(trim($_GET['lat']));
                $escapedLon = pg_escape_string(trim($_GET['lon']));
	}
} else {
}


$jsonurl = "http://castle.iplantcollaborative.org:9000/info?lat=$escapedLat&lon=$escapedLon";
$json = file_get_contents($jsonurl);

$jsonarray = json_decode($json, true);


?>
                        <html>
                        <head>
                        
                        <!--<link type="text/css" href="css/themes/blue/style.css" rel="stylesheet" />-->
                        <meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
                        <script type="text/javascript" src="js/jquery-1.7.2.min.js"></script>
                        <script type="text/javascript" src="js/jquery-ui-1.8.20.custom.min.js"></script>
                        <style>
                        table {
                        	font-size:0.75em;
                        	border-collapse:collapse;
                        }
                        td{
                        	padding:5px 10px;
                        }
                        </style>
                        </head>
			<body>

<table class="table table-borderless table-condensed table-hover">

<?php
//echo "$json<br>";


				$mat = $jsonarray['mat'] / 10;
				$mdr = $jsonarray['mdr'] / 10;
				$iso = $jsonarray['iso'] / 10;
				$tsd = $jsonarray['tsd'] / 100;
				$maxtwm = $jsonarray['maxtwm'] / 10;
				$anntmin = $jsonarray['anntmin'] / 10;
				$tar = $jsonarray['tar'] / 10;
				$meantwq = $jsonarray['meantwq'] / 10;
				$meantdq = $jsonarray['meantdq'] / 10;
				$meantwaq = $jsonarray['meantwaq'] / 10;
				$meantcq = $jsonarray['meantcq'] / 10;
				$annprec = $jsonarray['annprec'];
				$precwm = $jsonarray['precwm'];
				$precdm = $jsonarray['precdm'];
				$precwq = $jsonarray['precwq'];
				$precdq = $jsonarray['precdq'];
				$precs = $jsonarray['precs'] / 100;
				$precwarmq = $jsonarray['precwarmq'];
				$preccq = $jsonarray['preccq'];

				$OUTPUT .= "<tr>";
				$OUTPUT .= '<td>Mean Annual Temperature [ &deg;C ]</td>';
				$OUTPUT .= "<td>$mat</td>";
				$OUTPUT .= "</tr><tr>";
				$OUTPUT .= '<td > Annual Temperature Range [ &deg;C ]</td>';
				$OUTPUT .= "<td>$tar</td>";
				$OUTPUT .= "</tr><tr>";
				$OUTPUT .= '<td > Max Temperature of Warmest Month [ &deg;C ]</td>';
				$OUTPUT .= "<td>$maxtwm</td>";
				$OUTPUT .= "</tr><tr>";
				$OUTPUT .= '<td > Min Temperature of Coldest Month [ &deg;C ]</td>';
				$OUTPUT .= "<td>$anntmin</td>";
				$OUTPUT .= "</tr><tr>";
				$OUTPUT .= '<td > Mean Temperature of Wettest Quarter [ &deg;C ]</td>';
				$OUTPUT .= "<td>$meantwq</td>";
				$OUTPUT .= "</tr><tr>";
				$OUTPUT .= '<td > Mean Temperature of Driest Quarter [ &deg;C ]</td>';
				$OUTPUT .= "<td>$meantdq</td>";
				$OUTPUT .= "</tr><tr>";
                                $OUTPUT .= '<td > Mean Temperature of Warmest Quarter [ &deg;C ]</td>';
				$OUTPUT .= "<td>$meantwaq</td>";
				$OUTPUT .= "</tr><tr>";
				$OUTPUT .= '<td > Mean Temperature of Coldest Quarter [ &deg;C ]</td>';
				$OUTPUT .= "<td>$meantcq</td>";
				$OUTPUT .= "</tr><tr>";
				$OUTPUT .= '<td > Temperature Seasonality (standard deviation)</td>';
				$OUTPUT .= "<td>$tsd</td>";
				$OUTPUT .= "</tr><tr>";
                               	$OUTPUT .= '<td > Mean Diurnal Range (Mean of monthly temp (max temp - min temp)) [ &deg;C ]</td>';
				$OUTPUT .= "<td>$mdr</td>";
				$OUTPUT .= "</tr><tr>";
                                $OUTPUT .= '<td > Isothermality (Mean Diurnal Range  / ((Max Temperature of Warmest Month) - (Min Temperature of Coldest Month))) [ &deg;C ]</td>';
				$OUTPUT .= "<td>$iso</td>";
				$OUTPUT .= "</tr><tr>";
				$OUTPUT .= '<td > Mean Annual Precipitation [ mm ]</td>';
				$OUTPUT .= "<td>$annprec</td>";
				$OUTPUT .= "</tr><tr>";
                                $OUTPUT .= '<td > Precipitation of Wettest Month [ mm ]</td>';
				$OUTPUT .= "<td>$precwm</td>";
				$OUTPUT .= "</tr><tr>";
				$OUTPUT .= '<td > Precipitation of Driest Month [ mm ]</td>';
				$OUTPUT .= "<td>$precdm</td>";
				$OUTPUT .= "</tr><tr>";
				$OUTPUT .= '<td > Precipitation of Wettest Quarter [ mm ]</td>';
				$OUTPUT .= "<td>$precwq</td>";
				$OUTPUT .= "</tr><tr>";
				$OUTPUT .= '<td > Precipitation of Driest Quarter [ mm ]</td>';
				$OUTPUT .= "<td>$precdq</td>";
				$OUTPUT .= "</tr><tr>";
				$OUTPUT .= '<td > Precipitation of Warmest Quarter [ mm ]</td>';
				$OUTPUT .= "<td>$precwarmq</td>";
				$OUTPUT .= "</tr><tr>";
				$OUTPUT .= '<td > Precipitation of Coldest Quarter [ mm ]</td>';
				$OUTPUT .= "<td>$preccq</td>";
				$OUTPUT .= "</tr><tr>";
				$OUTPUT .= '<td > Precipitation Seasonality (standard deviation)</th>';
				$OUTPUT .= "<td>$precs</td>";
				$OUTPUT .= "</tr>";
                                $OUTPUT .= "</table>";
                                print($OUTPUT);

?>
			</body>
			</html>


