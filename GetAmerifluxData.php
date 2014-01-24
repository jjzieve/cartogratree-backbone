<?php
/*
   AmerifluxData.php
   by Hans Vasquez
   Designed for use with SSWAP.

   Started: 4/25/12
   This Release: 5/2/12


*/
// DEBUG MODE.
ini_set('display_errors', 1);

include_once("../includes/db_access/db_connect.php");
//include_once("includes/incPGSQL.php");


$site = $_GET['siteid'];		// ameriflux site

function scrub($data)
{
    $str = preg_replace("/'/","&apos",$data);
    return $str;
}

if ($site != "") {
    $q = "
	SELECT
		ameriflux_sites.site_byid,
		ameriflux_year_averages.site_indicator,
		ameriflux_year_averages.year,
		ameriflux_year_averages.rg_f,
		ameriflux_year_averages.rg_sqc,
		ameriflux_year_averages.ta_f,
		ameriflux_year_averages.ta_sqc,
		ameriflux_year_averages.vpd_f,
		ameriflux_year_averages.vpd_sqc,
		ameriflux_year_averages.ts_f,
		ameriflux_year_averages.ts_sqc,
		ameriflux_year_averages.precip,
		ameriflux_year_averages.swc,
		ameriflux_year_averages.h_f,
		ameriflux_year_averages.h_sqc,
		ameriflux_year_averages.le_f,
		ameriflux_year_averages.le_sqc,
		ameriflux_year_averages.reco_st,
		ameriflux_year_averages.reco_or,
		ameriflux_year_averages.nee_st_fmds,
		ameriflux_year_averages.nee_st_fmdssqc,
		ameriflux_year_averages.gpp_st_mds,
		ameriflux_year_averages.nee_or_fmds,
		ameriflux_year_averages.nee_or_fmdssqc,
		ameriflux_year_averages.gpp_or_mds,
		ameriflux_year_averages.nee_st_fann,
		ameriflux_year_averages.nee_st_fannsqc,
		ameriflux_year_averages.gpp_st_ann,
		ameriflux_year_averages.nee_or_fann,
		ameriflux_year_averages.nee_or_fannsqc,
		ameriflux_year_averages.gpp_or_ann
	FROM ameriflux_sites
	INNER JOIN ameriflux_year_averages ON
		CASE
			WHEN replace(lower(ameriflux_sites.site_byid), '-', '') = lower(ameriflux_year_averages.site_indicator)
			THEN true
			WHEN 'amf_' || replace(lower(ameriflux_sites.site_byid), '-', '') = lower(ameriflux_year_averages.site_indicator)
			THEN true
			ELSE false
		END
	WHERE (ameriflux_sites.site_byid = '$site' AND ameriflux_year_averages.rg_f IS NOT NULL)
	ORDER BY ameriflux_sites.site_byid;
	";

	//$setup = array("treegenes_development",$q);
	$setup = $q;
	$query = DBQuery($setup);
	
	if (pg_num_rows($query) > 0) {
		if(isset($_GET['csv'])) {      		// boolean pretty print option 
			$csv = $_GET['csv'];		
			$OUTPUT = '';
			$OUTPUT .= "site_id,year,rg_f,rg_sqc,ta_f,rg_sqc,vpd_f,vpd_sqc,ts_f,ts_sqc,precip,swc,h_f,h_sqc,le_f,le_sqc,reco_st,reco_or,";
			$OUTPUT .= "nee_st_fmds,nee_st_fmdssqc,gpp_st_mds,nee_or_fmds,nee_or_fmdssqc,gpp_or_mds";
			$OUTPUT .= "nee_st_fann,nee_st_fannsqc,gpp_st_ann,nee_or_fann,nee_or_fannsqc,gpp_or_ann\r\n";
			while ($res = pg_fetch_assoc($query)) {
				$sid               = $res["site_byid"];
				$year              = $res["year"];
				$rg_f              = $res["rg_f"];
				$rg_sqc            = $res["rg_sqc"];
				$ta_f              = $res["ta_f"];
				$ta_sqc            = $res["ta_sqc"];
				$vpd_f             = $res["vpd_f"];
				$vpd_sqc           = $res["vpd_sqc"];
				$ts_f              = $res["ts_f"];
				$ts_sqc            = $res["ts_sqc"];
				$precip            = $res["precip"];
				$swc               = $res["swc"];
				$h_f               = $res["h_f"];
				$h_sqc             = $res["h_sqc"];
				$le_f              = $res["le_f"];
				$le_sqc            = $res["le_sqc"];
				$reco_st           = $res["reco_st"];
				$reco_or           = $res["reco_or"];
				$nee_st_fmds       = $res["nee_st_fmds"];
				$nee_st_fmdssqc    = $res["nee_st_fmdssqc"];
				$gpp_st_mds        = $res["gpp_st_mds"];
				$nee_or_fmds       = $res["nee_or_fmds"];
				$nee_or_fmdssqc    = $res["nee_or_fmdssqc"];
				$gpp_or_mds        = $res["gpp_or_mds"];
				$nee_st_fann       = $res["nee_st_fann"];
				$nee_st_fannsqc    = $res["nee_st_fannsqc"];
				$gpp_st_ann        = $res["gpp_st_ann"];
				$nee_or_fann       = $res["nee_or_fann"];
				$nee_or_fannsqc    = $res["nee_or_fannsqc"];
				$gpp_or_ann        = $res["gpp_or_ann"];

				$OUTPUT .= "$sid,$year,";
				$OUTPUT .= "$rg_f,$rg_sqc,";
				$OUTPUT .= "$ta_f,$ta_sqc,";
				$OUTPUT .= "$vpd_f,$vpd_sqc,";
				$OUTPUT .= "$ts_f,$ts_sqc,";
				$OUTPUT .= "$precip,$swc,";
				$OUTPUT .= "$h_f,$h_sqc,";
				$OUTPUT .= "$le_f,$le_sqc,";
				$OUTPUT .= "$reco_st,$reco_or,";
				$OUTPUT .= "$nee_st_fmds,$nee_st_fmdssqc,$gpp_st_mds,";
				$OUTPUT .= "$nee_or_fmds,$nee_or_fmdssqc,$gpp_or_mds";
				$OUTPUT .= "$nee_st_fann,$nee_st_fannsqc,$gpp_st_ann,";
				$OUTPUT .= "$nee_or_fann,$nee_or_fannsqc,$gpp_or_ann\r\n";
			}
			// Prepare for download.
			header("Cache-control: private");
			header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
			header("Content-Description: File Transfer");
			//header("Content-Type: application/octet-stream");
			header("Content-Type: text/csv; charset=ansi");
			header("Content-disposition: attachment; filename=\"amerifluxsite_$sid"."_spreadsheet.csv\"");
			header("Expires: 0");
			print($OUTPUT);
			
		} else { 
			$OUTPUT = '';
			
			header('Content-Type: text/html');
		?>
		<html>
		<head>
		<script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>
		<script type="text/javascript" src="js/libs/bootstrap/bootstrap.js"></script>
		<script type="text/javascript" src="js/libs/jquery/jquery.tablesorter.js"></script>
		<script type="text/javascript" src="js/libs/jquery/jquery.metadata.js"></script>
		<script type="text/javascript" src="js/libs/jquery/jquery.tablecloth.js"></script>
    		<script type="text/javascript" charset="utf-8">
      			$(document).ready(function() {
 			       $("#ameriflux_table").tablecloth({
 			         theme: "default",
 			         striped: true,
 			         sortable: true,
 			         condensed: true
 			       });
 			     });
 		</script>
		<link type="text/css" href="css/tablecloth.css"  rel="stylesheet"/>
		<link type="text/css" href="css/bootstrap.css"  rel="stylesheet"/>
		<style>
			#ameriflux_table{
				font-size:10px;
				font-weight:bold;
			}
		</style>
		</head>
		<body>
		<table id="ameriflux_table">
			<thead>
			<tr>
				<th >Site_ID</th>
				<th >Year</th>
				<th ><b title="GLOBAL RADIATION FILLED">Rg_f<br>[ <sup>MJ</sup>&frasl;<sub>m&sup2;&middot;day</sub> ]</b></th>
				<th ><b title="GLOBAL RADIATION SUMMARY QUALITY FLAG, INDICATES THE FRACTION OF HALF HOURLY DATA WITH QC = 0 OR 1 USED IN THE AGGREGATION">Rg_sqc</b></th>
				<th ><b title="AIR TEMPERATURE FILLED">Ta_f<br>[ &deg;C ]</b></th>
				<th ><b title="AIR TEMPERATURE SUMMARY QUALITY FLAG, INDICATES THE FRACTION OF HALF HOURLY DATA WITH QC = 0 OR 1 USED IN THE AGGREGATION">Ta_sqc</b></th>
				<th ><b title="VAPOUR PRESSURE DEFICIT">VPD_f<br>[ hPa ]</b></th>
				<th ><b title="VAPOUR PRESSURE DEFICIT SUMMARY QUALITY FLAG, INDICATES THE FRACTION OF HALF HOURLY DATA WITH QC = 0 OR 1 USED IN THE AGGREGATION">VPD_sqc </b></th>
				<th ><b title="SOIL TEMPERATURE FILLED">Ts_f<br>[ &deg;C ]</b></th>
				<th ><b title="SOIL TEMPERATURE SUMMARY QUALITY FLAG, INDICATES THE FRACTION OF HALF HOURLY DATA WITH QC = 0 OR 1 USED IN THE AGGREGATION">Ts_sqc</b></th>
				<th ><b title="PRECIPITATION">Precip<br>[ <sup>mm</sup>&frasl;<sub>day</sub> ]</b></th>
				<th ><b title="SOIL WATER CONTENT">SWC<br>[ %vol ]</b></th>
				<th ><b title="MEAN SENSIBLE HEAT FLUX FILLED">H_f<br>[ <sup>W</sup>&frasl;<sub>m&sup2;</sub> ]</b></th>
				<th ><b title="MEAN SENSIBLE HEAT FLUX SUMMARY QUALITY FLAG, INDICATES THE FRACTION OF HALF HOURLY DATA WITH QC = 0 OR 1 USED IN THE AGGREGATION">H_sqc</b></th>
				<th ><b title="MEAN LATENT HEAT FLUX FILLED">LE_f<br>[ <sup>W</sup>&frasl;<sub>m&sup2;</sub> ]</b></th>
				<th ><b title="MEAN LATENT HEAT FLUX SUMMARY QUALITY FLAG, INDICATES THE FRACTION OF HALF HOURLY DATA WITH QC = 0 OR 1 USED IN THE AGGREGATION">LE_sqc</b></th>
				<th ><b title="ECOSYSTEM RESPIRATION BASED ON NEE_ST">Reco_st<br>[ <sup>gC</sup>&frasl;<sub>m&sup2;&middot;day</sub> ]</b></th>
				<th ><b title="ECOSYSTEM RESPIRATION BASED ON NEE_OR">Reco_or<br>[ <sup>gC</sup>&frasl;<sub>m&sup2;&middot;day</sub> ]</b></th>
				<th ><b title="NEE_ST FILLED USING THE MARGINAL DISTRIBUTION SAMPLING METHOD">NEE_st_fMDS<br>[ <sup>gC</sup>&frasl;<sub>m&sup2;&middot;day</sub> ]</b></th>
				<th ><b title="NEE_ST SUMMARY QUALITY FLAG, INDICATES THE FRACTION OF HALF HOURLY DATA WITH QC = 0 OR 1 USED IN THE AGGREGATION">NEE_st_fMDSsqc</b></th>
				<th ><b title="GROSS PRIMARY PRODUCTION BASED ON NEE_ST FILLED WITH THE MARGINAL DISTRIBUTION SAMPLING METHOD">GPP_st_MDS<br>[ <sup>gC</sup>&frasl;<sub>m&sup2;&middot;day</sub> ]</b></th>
				<th ><b title="NEE_OR FILLED USING THE MARGINAL DISTRIBUTION SAMPLING METHOD">NEE_or_fMDS<br>[ <sup>gC</sup>&frasl;<sub>m&sup2;&middot;day</sub> ]</b></th>
				<th ><b title="NEE_OR SUMMARY QUALITY FLAG, INDICATES THE FRACTION OF HALF HOURLY DATA WITH QC = 0 OR 1 USED IN THE AGGREGATION">NEE_or_fMDSsqc</b></th>
				<th ><b title="GROSS PRIMARY PRODUCTION BASED ON NEE_OR FILLED WITH THE MARGINAL DISTRIBUTION SAMPLING METHOD">GPP_or_MDS<br>[ <sup>gC</sup>&frasl;<sub>m&sup2;&middot;day</sub> ]</b></th>
				<th ><b title="NEE_ST FILLED USING THE ARTIFICIAL NEURAL NETWORK METHOD">NEE_st_fANN<br>[ <sup>gC</sup>&frasl;<sub>m&sup2;&middot;day</sub> ]</b></th>
				<th ><b title="NEE_ST SUMMARY QUALITY FLAG, INDICATES THE FRACTION OF HALF HOURLY DATA WITH QC = 0 OR 1 USED IN THE AGGREGATION">NEE_st_fANNsqc</b></th>
				<th ><b title="GROSS PRIMARY PRODUCTION BASED ON NEE_ST FILLED WITH THE ARTIFICIAL NEURAL NETWORK METHOD">GPP_st_ANN<br>[ <sup>gC</sup>&frasl;<sub>m&sup2;&middot;day</sub> ]</b></th>
				<th ><b title="NEE_OR FILLED USING THE ARTIFICIAL NEURAL NETWORK METHOD">NEE_or_fANN<br>[ <sup>gC</sup>&frasl;<sub>m&sup2;&middot;day</sub> ]</b></th>
				<th ><b title="NEE_OR SUMMARY QUALITY FLAG, INDICATES THE FRACTION OF HALF HOURLY DATA WITH QC = 0 OR 1 USED IN THE AGGREGATION">NEE_or_fANNsqc</b></th>
				<th ><b title="GROSS PRIMARY PRODUCTION BASED ON NEE_OR FILLED WITH THE ARTIFICIAL NEURAL NETWORK METHOD">GPP_or_ANN<br>[ <sup>gC</sup>&frasl;<sub>m&sup2;&middot;day</sub> ]</b></th>
			</tr>
			
			</thead>
			<tbody>
		<?php
			while ($res = pg_fetch_assoc($query)) {
				$sid               = $res["site_byid"];
				$year              = $res["year"];
				$rg_f              = rtrim($res["rg_f"], "0");
				$rg_sqc            = rtrim($res["rg_sqc"], "0");
				$ta_f              = rtrim($res["ta_f"], "0");
				$ta_sqc            = rtrim($res["ta_sqc"], "0");
				$vpd_f             = rtrim($res["vpd_f"], "0");
				$vpd_sqc           = rtrim($res["vpd_sqc"], "0");
				$ts_f              = rtrim($res["ts_f"], "0");
				$ts_sqc            = rtrim($res["ts_sqc"], "0");
				$precip            = rtrim($res["precip"], "0");
				$swc               = rtrim($res["swc"], "0");
				$h_f               = rtrim($res["h_f"], "0");
				$h_sqc             = rtrim($res["h_sqc"], "0");
				$le_f              = rtrim($res["le_f"], "0");
				$le_sqc            = rtrim($res["le_sqc"], "0");
				$reco_st           = rtrim($res["reco_st"], "0");
				$reco_or           = rtrim($res["reco_or"], "0");
				$nee_st_fmds       = rtrim($res["nee_st_fmds"], "0");
				$nee_st_fmdssqc    = rtrim($res["nee_st_fmdssqc"], "0");
				$gpp_st_mds        = rtrim($res["gpp_st_mds"], "0");
				$nee_or_fmds       = rtrim($res["nee_or_fmds"], "0");
				$nee_or_fmdssqc    = rtrim($res["nee_or_fmdssqc"], "0");
				$gpp_or_mds        = rtrim($res["gpp_or_mds"], "0");
				$nee_st_fann       = rtrim($res["nee_st_fann"], "0");
				$nee_st_fannsqc    = rtrim($res["nee_st_fannsqc"], "0");
				$gpp_st_ann        = rtrim($res["gpp_st_ann"], "0");
				$nee_or_fann       = rtrim($res["nee_or_fann"], "0");
				$nee_or_fannsqc    = rtrim($res["nee_or_fannsqc"], "0");
				$gpp_or_ann        = rtrim($res["gpp_or_ann"], "0");

				$OUTPUT .= "<tr>";
                                $OUTPUT .= "<td style=\"text-align:center;width:80px\">$sid</td><td style=\"text-align:center;width:80px\">$year</td>";
                                $OUTPUT .= "<td>$rg_f</td><td>$rg_sqc</td>";
                                $OUTPUT .= "<td>$ta_f</td><td>$ta_sqc</td>";
                                $OUTPUT .= "<td>$vpd_f</td><td>$vpd_sqc</td>";
                                $OUTPUT .= "<td>$ts_f</td><td>$ts_sqc</td>";
                                $OUTPUT .= "<td>$precip</td><td>$swc</td>";
                                $OUTPUT .= "<td>$h_f</td><td>$h_sqc</td>";
                                $OUTPUT .= "<td>$le_f</td><td>$le_sqc</td>";
                                $OUTPUT .= "<td>$reco_st</td><td>$reco_or</td>";
                                $OUTPUT .= "<td>$nee_st_fmds</td><td>$nee_st_fmdssqc</td><td>$gpp_st_mds</td>";
                                $OUTPUT .= "<td>$nee_or_fmds</td><td>$nee_or_fmdssqc</td><td>$gpp_or_mds</td>";
                                $OUTPUT .= "<td>$nee_st_fann</td><td>$nee_st_fannsqc</td><td>$gpp_st_ann</td>";
                                $OUTPUT .= "<td>$nee_or_fann</td><td>$nee_or_fannsqc</td><td>$gpp_or_ann</td>\r\n";
                                $OUTPUT .= "</tr>";
			}
			$OUTPUT .= "</tbody></table>";
			print($OUTPUT);
		} 
	} else{
		header('Content-Type: text/plain');
		print "no data found";
	}
}
?>
