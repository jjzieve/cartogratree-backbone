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
} 

$idArr = explode(",", $escapedId);
$tgdrArr = array();
$dtreeArr = array();
foreach($idArr as $tid) {
    if(strpos($tid, 'TGDR') !== false) {
        //true
        $tgdrArr[] = $tid;
        // var_dump($tgdrArr);
    } else {
        $dtreeArr[] = $tid;
    }
}

//need to throw in case if they are disparate datasets
if (count($tgdrArr) > 0){
	$q = "
	SELECT  
        s.id as sample_id,
        t.tgdr_accession || '-' || s.id as tree_identifier,
        tgdr_phenotypes_per_individual.phenotype_name AS metric_description,
        tgdr_phenotypes_per_individual.value AS metric_value,
        'tgdr' AS data_source    
        FROM 
                tgdr_data_availability_mv t,
                tgdr_samples s
        LEFT JOIN tgdr_phenotypes_per_individual ON s.id = tgdr_phenotypes_per_individual.tgdr_samples_id            
        WHERE 
                t.tgdr_accession || '-' || s.id IN ('".implode("','",$idArr)."')
        GROUP BY
                sample_id, 
                tree_identifier,
                tgdr_phenotypes_per_individual.phenotype_name,
                metric_value
	ORDER BY tree_identifier ASC, metric_description ASC;";
}
else if(count($dtreeArr)){
	$q = "
	SELECT
		inv_samples.sample_barcode AS tree_identifier,
		inv_sample_metrics.metric_description,
		inv_samples_sample_metrics.metric_measurement as metric_value
	FROM inv_samples
	INNER JOIN inv_sample_sources ON inv_samples.inv_sample_sources_id = inv_sample_sources.id
	INNER JOIN inv_samples_sample_metrics ON inv_samples.id = inv_samples_sample_metrics.inv_samples_id
	INNER JOIN inv_sample_metrics ON inv_samples_sample_metrics.inv_sample_metrics_id = inv_sample_metrics.id
	WHERE inv_sample_metrics.metric_type = 'Phenotype' AND sample_barcode IN ( '".implode("','",$idArr)."' ) 
	ORDER BY tree_identifier ASC, metric_description ASC;";
}
else{
	$q = "";
}

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

else {// echo to populate slickgrid

	if($numrows > 0) {
		$phenos = array(
		"phenotypes" => array(),
		"tree_ids" => array(),
		);

		$tree_id_prev = '';
		while($row = pg_fetch_assoc($res)){
			if($tree_id_prev === $row["tree_identifier"]){
				array_push($phenos["phenotypes"],$row["metric_description"]);
				array_push($phenos["tree_ids"][$tree_id_prev],array("phenotype" => $row["metric_description"], "value" => $row["metric_value"]));
			}
			else{
				$tree_id_prev = $row["tree_identifier"];
				$phenos["tree_ids"][$tree_id_prev] = array();
			}
		}
		echo json_encode($phenos);
	}
}

?>
