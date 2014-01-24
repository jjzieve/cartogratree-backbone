<?php

//include_once("../includes/db_access/db_connect_sswap.php");
include_once("../../dev/includes/db_access/db_connect_sswap.php"); //for dev box

function outputCSV($data) {
    $outstream = fopen("php://output", "w");
    function __outputCSV(&$vals, $key, $filehandler) {
        fputcsv($filehandler, $vals); // add parameters if you want
    }   
    array_walk($data, "__outputCSV", $outstream);
    fclose($outstream);
}


if (isset($_GET['tid'])) {
	$escapedId = pg_escape_string(trim($_GET['tid']));
} else {
}

$idArr = explode(",", $escapedId);

$tidSearch = array();
$tid_list = array();
foreach($idArr as $tid) {
	$tidSearch[] = "(
	SELECT 	inv_sample_metrics.metric_description
	FROM inv_samples
	LEFT JOIN inv_sample_sources ON inv_samples.inv_sample_sources_id = inv_sample_sources.id
	LEFT JOIN inv_samples_sample_metrics ON inv_samples.id = inv_samples_sample_metrics.inv_samples_id
	LEFT JOIN inv_sample_metrics ON inv_samples_sample_metrics.inv_sample_metrics_id = inv_sample_metrics.id
	WHERE inv_samples.sample_barcode = '$tid'
	)";
	$tid_list[] = "'$tid'";
}    

$q = "
SELECT
	inv_samples.sample_barcode AS tree_identifier,
	inv_sample_metrics.metric_description,
	inv_samples_sample_metrics.measurement_value
FROM inv_samples
INNER JOIN inv_sample_sources ON inv_samples.inv_sample_sources_id = inv_sample_sources.id
INNER JOIN inv_samples_sample_metrics ON inv_samples.id = inv_samples_sample_metrics.inv_samples_id
INNER JOIN inv_sample_metrics ON inv_samples_sample_metrics.inv_sample_metrics_id = inv_sample_metrics.id
WHERE inv_sample_metrics.metric_type = 'Phenotype' AND sample_barcode IN (".implode(',',$tid_list).")  AND inv_sample_metrics.metric_description IN (
		SELECT * FROM (	
		".implode(" INTERSECT ",$tidSearch)."
		) AS tmp
	)
ORDER BY tree_identifier ASC, metric_description ASC;";

$res = DBQuery($q);
$numrows = pg_num_rows($res);
$numsamples = count($idArr);
$numpheno = $numrows / $numsamples;


## CSV STUFF HERE
if(isset($_GET['csv'])) {

	header("Cache-control: private");
	header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
	header("Content-Description: File Transfer");
	//header("Content-Type: application/octet-stream");
	header("Content-Type: text/csv; charset=ansi");
	header("Content-disposition: attachment; filename=\"commonphenotype_spreadsheet.csv\"");
	header("Expires: 0");

	//echo "NumRows:$numrows NumPheno:$numpheno NumSamples:$numsamples<br>";
	if ($numrows > 0) {
		$tree_data_string = array();
		$col_flag = true;
		$col_names = array('"TreeID"');
		
		$prev_identifer = '';
		while ($r = pg_fetch_assoc($res)) {
			$identifier = $r["tree_identifier"];
			$metric_description = $r["metric_description"];
			$measurement_value = $r["measurement_value"];
			
			if($prev_identifier == ''){
				$prev_identifier = $identifier;
			}
			if($identifier != $prev_identifier){
				if($col_flag){
					echo implode(',',$col_names)."\n";
					$col_flag = false;
				}
				
				echo "$prev_identifier,".implode(',',$tree_data_string)."\n";
				$prev_identifier = $identifier;
				$tree_data_string = array();
			}
			
			if($col_flag){
				$col_names[] = '"'.$metric_description.'"';
			}
			
			$tree_data_string[] = '"'.$measurement_value.'"';
		}
		if($col_flag){
			echo implode(',',$col_names)."\n";
			$col_flag = false;
		}
		echo "$prev_identifier,".implode(',',$tree_data_string)."\n";
	}
}//csv

else {

	if($numrows > 0) {
		echo "<table id='common_pheno_table' style='font-size:14px'>";
		$tree_data_string = array();
		$col_flag = true;
		$col_names = array('<th>TreeID</th>');
		
		$prev_identifer = '';
		while ($r = pg_fetch_assoc($res)) {
			$identifier = $r["tree_identifier"];
			$metric_description = $r["metric_description"];
			$measurement_value = $r["measurement_value"];
			
			if($prev_identifier == ''){
				$prev_identifier = $identifier;
			}
			if($identifier != $prev_identifier){
				if($col_flag){
					echo "<thead><tr>".implode('',$col_names)."</tr></thead><tbody>\n";
					$col_flag = false;
				}
				
				echo "<tr><td>$prev_identifier</td>".implode('',$tree_data_string)."</tr>\n";
				$prev_identifier = $identifier;
				$tree_data_string = array();
			}
			
			if($col_flag){
				$col_names[] = "<th>$metric_description</th>";
			}
			
			$tree_data_string[] = "<td>$measurement_value</td>";
		}
		if($col_flag){
			echo "<thead><tr>".implode('',$col_names)."</tr></thead><tbody>\n";
			$col_flag = false;
		}
		echo "<tr><td>$prev_identifier</td>".implode('',$tree_data_string)."</tr>\n";
		echo "</tbody></table>";
	}
	else{
		echo "N/A";
	}
}
?>
