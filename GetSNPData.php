<?php

include_once("../includes/db_access/db_connect_sswap.php");

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

$snpSearch = array();
$snp_list = array();
foreach($idArr as $snpId) {
	$snpSearch[] = "(
	SELECT snp_accessions.snp_accession 
	FROM inv_samples AS ins 
		LEFT JOIN inv_genotyping_data_genotype_results AS igdgr ON igdgr.inv_samples_id = ins.id 
		LEFT JOIN snps ON snps.id = igdgr.snps_id 
		LEFT JOIN snp_accessions ON snp_accessions.id = snps.snp_accessions_id 
	WHERE 
		ins.sample_barcode = '$snpId' 
		AND snp_accessions.snp_accession IS NOT NULL 
					AND snp_accessions.snp_accession <> 'SNP_NULL'
	
	
	)";
	$snp_list[] = "'$snpId'";
}    

$q = "
SELECT 
	ins.sample_barcode AS identifier, 
	s2.species, 
	CASE 
		WHEN iss.gps_latitude IS NOT NULL AND strpos(CAST(iss.gps_latitude AS text), '.') > 0 AND substr(rtrim(CAST(iss.gps_latitude AS text),'0'), length(rtrim(CAST(iss.gps_latitude AS text),'0')), 1) = '.' 
			THEN substr(CAST(iss.gps_latitude AS text), 1, strpos(CAST(iss.gps_latitude AS text), '.') - 1) 
		WHEN iss.gps_latitude IS NOT NULL AND strpos(CAST(iss.gps_latitude AS text), '.') > 0 
			THEN rtrim(CAST(iss.gps_latitude AS text), '0') 
		WHEN iss.gps_latitude IS NOT NULL 
			THEN CAST(iss.gps_latitude AS text) 
		ELSE '' 
	END AS latitude, 
	CASE 
		WHEN iss.gps_longitude IS NOT NULL AND strpos(CAST(iss.gps_longitude AS text), '.') > 0 AND substr(rtrim(CAST(iss.gps_longitude AS text),'0'), length(rtrim(CAST(iss.gps_longitude AS text),'0')), 1) = '.' 
			THEN substr(CAST(iss.gps_longitude AS text), 1, strpos(CAST(iss.gps_longitude AS text), '.') - 1) 
		WHEN iss.gps_longitude IS NOT NULL AND strpos(CAST(iss.gps_longitude AS text), '.') > 0 
			THEN rtrim(CAST(iss.gps_longitude AS text), '0') 
		WHEN iss.gps_longitude IS NOT NULL 
			THEN CAST(iss.gps_longitude AS text) 
		ELSE '' 
	END AS longitude, 
	igdgr.allele1, 
	igdgr.allele2, 
	snp_accessions.snp_accession, 
	physical_pos 
FROM species AS s2 
	LEFT JOIN inv_sample_sources AS iss ON s2.species_id = iss.species_id 
	LEFT JOIN inv_samples ins ON iss.id = ins.inv_sample_sources_id 
	LEFT JOIN inv_genotyping_data_genotype_results AS igdgr ON igdgr.inv_samples_id = ins.id 
	LEFT JOIN snps ON snps.id = igdgr.snps_id LEFT JOIN snp_accessions ON snp_accessions.id = snps.snp_accessions_id 
WHERE 
	ins.sample_barcode IN ( ".implode(',',$snp_list)." ) 
	AND snp_accessions.snp_accession IS NOT NULL 
	AND snp_accessions.snp_accession <> 'SNP_NULL' 
	AND snp_accessions.snp_accession IN ( 
		SELECT * FROM (
		".implode(" INTERSECT ",$snpSearch)."
	) AS tmp
)
ORDER BY identifier ASC, snp_accession ASC;";
$res = DBQuery($q);
$numrows = pg_num_rows($res);
$numsamples = count($idArr);
$numsnps = $numrows / $numsamples;


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

?>

	<html>
	<head>
	
	<!--<link type="text/css" href="css/themes/blue/style.css" rel="stylesheet" />-->
	<meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
	<script type="text/javascript" src="js/jquery-1.7.2.min.js"></script>
	<script type="text/javascript" src="js/jquery-ui-1.8.20.custom.min.js"></script>
	<script type="text/javascript" src="js/jquery.tablesorter.js"></script>
	<link type="text/css" href="css/style_gettools.css" rel="stylesheet" />
	<script>
		$(document).ready(function(){
			$("#data_table").tablesorter({
				widgets: ['zebra']
			});	
		});
	</script>
	</head>
	<body>
	<table id="data_table" class="tablesorter">
<?php

	if($numrows > 0) {
		$tree_data_string = array();
		$col_flag = true;
		$col_names = array('<th>TreeID</th>');
		
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
					echo "<thead><tr>".implode('',$col_names)."</tr></thead><tbody>\n";
					$col_flag = false;
				}
				
				echo "<tr><td>$prev_identifier</td>".implode('',$tree_data_string)."</tr>\n";
				$prev_identifier = $identifier;
				$tree_data_string = array();
			}
			
			if($col_flag){
				$col_names[] = "<th>$snp_accession</th>";
			}
			
			$tree_data_string[] = "<td>$allele1$allele2</td>";
		}
		if($col_flag){
			echo "<thead><tr>".implode('',$col_names)."</tr></thead><tbody>\n";
			$col_flag = false;
		}
		echo "<tr><td>$prev_identifier</td>".implode('',$tree_data_string)."</tr>\n";
	}
	echo "\n</tbody></table></body></html>";
}
?>
