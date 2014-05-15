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

//need to throw in case if they are disparate datasets, but for now unioning tgdr and inv_*

$q = "
	SELECT  
        t.tgdr_accession || '-' || s.id as tree_identifier,
        tgdr_phenotypes_per_individual.phenotype_name AS metric_description,
        tgdr_phenotypes_per_individual.value AS metric_value
        FROM 
                tgdr_data_availability_mv t,
                tgdr_samples s
        LEFT JOIN tgdr_phenotypes_per_individual ON s.id = tgdr_phenotypes_per_individual.tgdr_samples_id            
        WHERE 
                t.tgdr_accession || '-' || s.id IN ('".implode("','",$idArr)."')
        GROUP BY
                tree_identifier,
                tgdr_phenotypes_per_individual.phenotype_name,
                metric_value
UNION
	SELECT
		inv_samples.sample_barcode AS tree_identifier,
		inv_sample_metrics.descriptive_name as metric_description,
		inv_samples_sample_metrics.measurement_value as metric_value
		FROM inv_samples
		INNER JOIN inv_sample_sources ON inv_samples.inv_sample_sources_id = inv_sample_sources.id
		INNER JOIN inv_samples_sample_metrics ON inv_samples.id = inv_samples_sample_metrics.inv_samples_id
		INNER JOIN inv_sample_metrics ON inv_samples_sample_metrics.inv_sample_metrics_id = inv_sample_metrics.id
		WHERE inv_sample_metrics.metric_type = 'Phenotype' AND sample_barcode IN ( '".implode("','",$idArr)."' ) 
UNION
	SELECT
		cast(ecp_trydb.ecp_trydb_gps_groups_id as text) as tree_identifier,
		ecp_trydb.trait as metric_description,
		string_agg(cast(ecp_trydb.obsdataid as text),',') as metric_value
		FROM ecp_trydb
		WHERE cast(ecp_trydb.ecp_trydb_gps_groups_id as text) IN ( '".implode("','",$idArr)."' )
		GROUP BY ecp_trydb.trait, ecp_trydb.ecp_trydb_gps_groups_id
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
			$measurement_value = $r["metric_value"];
			
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
			if($tree_id_prev !== $row["tree_identifier"]){ 
				$tree_id_prev = $row["tree_identifier"]; //make new array for each new tree_id
				$phenos["tree_ids"][$tree_id_prev] = array(); 
			}
			array_push($phenos["phenotypes"],$row["metric_description"]); //populate column array
			array_push($phenos["tree_ids"][$tree_id_prev],array("phenotype" => $row["metric_description"], "value" => $row["metric_value"])); //populate tree id array
		}
		echo json_encode($phenos);
	}
}

?>
