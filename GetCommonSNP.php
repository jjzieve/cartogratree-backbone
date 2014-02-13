<?php

//include_once("../includes/db_access/db_connect_sswap.php");
include_once("../../dev/includes/db_access/db_connect_sswap.php");//for dev box

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
$q = "
SELECT 
	ins.sample_barcode AS identifier, 
	igdgr.allele1, 
	igdgr.allele2, 
	snp_accessions.snp_accession, 
	physical_pos 
FROM inv_samples AS ins
	LEFT JOIN inv_genotyping_data_genotype_results AS igdgr ON igdgr.inv_samples_id = ins.id 
	LEFT JOIN snps ON snps.id = igdgr.snps_id LEFT JOIN snp_accessions ON snp_accessions.id = snps.snp_accessions_id 
WHERE 
	ins.sample_barcode IN ( '".implode("','",$idArr)."' ) 
	AND snp_accessions.snp_accession IS NOT NULL 
	AND snp_accessions.snp_accession <> 'SNP_NULL' 
ORDER BY identifier ASC, snp_accession ASC;";
$res = DBQuery($q);

$numrows = pg_num_rows($res);
$numsamples = count($idArr);
$numsnps = $numrows / $numsamples;

// echo "num samples: ".$numsamples."\n";
// echo "num rows: ".$numrows."\n";
// echo "num snps: ".$numsnps."\n";


## CSV STUFF HERE
if(isset($_GET['csv'])) {

	header("Cache-control: private");
	header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
	header("Content-Description: File Transfer");
	//header("Content-Type: application/octet-stream");
	header("Content-Type: text/csv; charset=ansi");
	header("Content-disposition: attachment; filename=\"commonsnp_spreadsheet.csv\"");
	header("Expires: 0");

	//echo "NumRows:$numrows NumSNPS:$numsnps NumSamples:$numsamples<br>";
	if ($numrows > 0) {
		$tree_data_string = array();
		$col_flag = true;
		$col_names = array('"TreeID"');
		
		$prev_identifer = '';
		while ($r = pg_fetch_assoc($res)) {
			$identifier = $r["identifier"];
			$allele1 = $r["allele1"];
			$allele2 = $r["allele2"];
			$snp_accession = $r["snp_accession"];

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
				$col_names[] = '"'.$snp_accession.'"';
			}
			
			$tree_data_string[] = '"'.$allele1.$allele2.'"';
		}
		if($col_flag){
			echo implode(',',$col_names)."\n";
			$col_flag = false;
		}
		echo "$prev_identifier,".implode(',',$tree_data_string)."\n";
	}
} //csv
else {
	if($numrows >= 25){// to prevent rendering all 25 columns on the clientside
		$over_limit = true;
	}
	else{
		$over_limit = false;
	}

	$snps = array(
		"snp_accessions" => array(),
		"tree_ids" => array(),
		"over_limit" => $over_limit
		);

	$tree_id_prev = '';

	while($row = pg_fetch_assoc($res)){
		if($tree_id_prev === $row["identifier"]){
			array_push($snps["snp_accessions"],$row["snp_accession"]);
			array_push($snps["tree_ids"][$tree_id_prev],array("snp_accession" => $row["snp_accession"], "allele" => $row["allele1"].$row["allele2"]));
		}
		else{
			$tree_id_prev = $row["identifier"];
			$snps["tree_ids"][$tree_id_prev] = array();
		}
	}
	echo json_encode($snps);
	
}
?>
