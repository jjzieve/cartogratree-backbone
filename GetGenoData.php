<?php
//testurl
//http://dendrome.ucdavis.edu/_dev/havasquezgross/cartogratree/GetGenoData.php?tid=GRI0001,GRI0002
ini_set('max_execution_time', 300);

include_once("../includes/db_access/db_connect_sswap.php");

function sortByChromAndPos($dataArray) {

    ksort($dataArray);
    foreach($dataArray as $id => &$value) {
        ksort(&$value);
    }

    return($dataArray);

}

function outputCSV($data) {
    $outstream = fopen("php://output", "w");
    function __outputCSV(&$vals, $key, $filehandler) {
        fputcsv($filehandler, $vals); // add parameters if you want
    }   
    array_walk($data, "__outputCSV", $outstream);
    fclose($outstream);
}

function printHeader($array) {

   $output_string = "rs#\talleles\tchrom\tpos\tstrand\tassembly#\tcenter\tprotLSID\tassayLSID\tpanelLSID\tQCcode";

    foreach($array as $value){
        $output_string = $output_string."\t$value";
    }
    echo $output_string."\n";
}
function printTable($dataArray, $idArray) {

    $output_string = "";
    foreach($dataArray as $chrom => $posArray) {
        foreach($posArray as $pos => $tidArray) {
            //print "$chrom\t$pos\t$tidArray\n";
            $snpid = "SNP_".$chrom."-".$pos;
            $output_string = $output_string."$snpid\tN/N\t$chrom\t$pos\t+\tdendrome\tcenter\tProtocol\tAssay\tPanel\tQC";
            foreach($idArray as $identifier){
                if(array_key_exists ($identifier, $dataArray[$chrom][$pos])) {
                    $genotype = $dataArray[$chrom][$pos][$identifier];
                    $genotype = str_replace(":","",$genotype);
                    $output_string = $output_string."\t".$genotype;

                } else {
                    $genotype = "NA";
                }
            }
            $output_string = $output_string."\n";
        } 
    }
    echo $output_string;

}

if (isset($_GET['tid'])) {
	$escapedId = pg_escape_string(trim($_GET['tid']));
} else {
}

$idArr = explode(",", $escapedId);
$tgdrArr = array();
$dtreeArr = array();
foreach($idArr as $tid) {
    if(strpos($tid, 'TGDR') !==false) {
        //true
        $tgdrArr[] = $tid;
    } else {
        $dtreeArr[] = $tid;
    }
}

if(count($dtreeArr) > 0) {
    $snpSearch = array();
    $snp_list = array();
    foreach($dtreeArr as $snpId) {
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
        snp_accessions.sequence_id,
        snps.genotype,
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
    ORDER BY snp_accession ASC, identifier ASC;";
}

if(count($tgdrArr) > 0) {
    $tid_list = array();
    foreach($tgdrArr as $tid) {
        $tid_list[] = "'$tid'";
    }
    $queryTidString = implode(",", $tid_list);
    foreach($tgdrArr as $tid) {
        $q = "SELECT  
        t.tgdr_accession || '-' || s.id as identifier,
        tgdr_genotypes.genotype_value,
        tgdr_genotypes.genetic_marker_name as snp_accession,
        'tgdr' AS data_source    
        FROM 
                tgdr_data_availability_mv t,
                tgdr_samples s
        LEFT JOIN tgdr_genotypes ON s.id = tgdr_genotypes.tgdr_samples_id            
       WHERE 
                t.tgdr_accession || '-' || s.id IN ($queryTidString)
    ORDER BY snp_accession ASC, identifier ASC;";
    }
}

header("Content-Type: text/plain; charset=ansi");
//echo $q;
//exit();
$res = DBQuery($q);
$numrows = pg_num_rows($res);
$numsamples = count($idArr);
$numsnps = $numrows / $numsamples;


## CSV STUFF HERE
if(isset($_GET['csv'])) {

	//header("Cache-control: private");
	//header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
	//header("Content-Description: File Transfer");
	//header("Content-Type: text/csv; charset=ansi");
	//header("Content-disposition: attachment; filename=\"commonsnp_spreadsheet.csv\"");
	//header("Expires: 0");

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
//elseif(isset($_GET['hapmap'])) {
else{

	header("Content-Type: text/plain; charset=ansi");
	if ($numrows > 0) {
		$tree_data_string = array();
		$prev_identifer = '';
        $begin_id = NULL;
        $idArr = array();
        $dataArray = array();
        while ($r = pg_fetch_assoc($res)) {

			$identifier = $r["identifier"];
            $idArr[] = $identifier;

        }
        $idArr = array_unique($idArr);
        //echo var_dump($idArr);
        printHeader($idArr);

        //Reset pointer
        pg_result_seek($res, 0);
		
        $count = 0;
        $first_treeid = "";
        $output_string = "";
        $minorAllele = "";
        $majorAllele = "";
        $finalpart_string = "";
        $saved_accession = "";
        $dataArray = array();
		//$prev_identifer = '';
        if(count($dtreeArr) > 0) {
            while ($r = pg_fetch_assoc($res)) {
                $identifier = $r["identifier"];
                $allele1 = $r["allele1"];
                $allele2 = $r["allele2"];
                $snp_accession = $r["snp_accession"];
                $seqid = $r["sequence_id"];
                //$genotype = $r["genotype"];
                $physical_pos = $r["physical_pos"];

                if($count == 0) {
                    $first_treeid = $identifier;
                }
                if($allele2 != $allele1) {
                    $minorAllele = $allele2;
                    $majorAllele = $allele1;
                }

                if($identifier == $first_treeid && $count != 0) {
                    $output_string = "$saved_accession\t$majorAllele/$minorAllele\t$seqid\t$physical_pos\t+\tdendrome\tcenter\tProtocol\tAssay\tPanel\tQC".$finalpart_string;
                    //$output_string = "$saved_accession\t$majorAllele/$minorAllele\t$seqid\t$physical_pos\t+\tdendrome\tcenter\turn:dendrome.ucdavis.edu:Protocol\turn:dendrome.ucdavis.edu:Assay\turn:dendrome.ucdavis.edu:Panel\tQC+".$finalpart_string;
                    //$output_string = "$saved_accession\t / \t$seqid\t$physical_pos\t+\tdendrome\tcenter\turn:dendrome.ucdavis.edu:Protocol\turn:dendrome.ucdavis.edu:Assay\turn:dendrome.ucdavis.edu:Panel\tQC+".$finalpart_string;
                    //echo "HAPMAP:$output_string\n";


                    ///////echo "$output_string\n";
                    //$unique_id = "$seqid:$physical_pos";
                    //$dataArray[$unique_id] = $output_string;
                    $dataArray[$seqid][$physical_pos] = $output_string;
                    $finalpart_string = "";
                    $minorAllele = "";
                    $majorAllele = "";
                }

                if($saved_accession != $snp_accession) {
                    $saved_accession = $snp_accession;
                }
                
                //echo "TEST:$snp_accession\t$allele1$allele2\t$identifier\n";
                $finalpart_string = $finalpart_string."\t$allele1$allele2";

                $count += 1;
                
            }
            ksort($dataArray);
            foreach($dataArray as $id => &$value) {
                //print "$id\t$value\n";
                ksort(&$value);
            }
            //var_dump($dataArray);
            foreach($dataArray as $id => &$value) {
                foreach($value as $k => $v) {
                    //print "$id\t$k\n";
                    print "$v\n";
                } 
            }
        } // ifdtree
        else {
            while ($r = pg_fetch_assoc($res)) {
                $identifier = $r["identifier"];
                $genotype = $r["genotype_value"];
                $snp_accession = $r["snp_accession"];
                $splitArr = explode("-",$snp_accession);
                $chrom = $splitArr[0];
                $pos = $splitArr[1];
                $dataArray[$chrom][$pos][$identifier] = $genotype;
            }
            $dataArray = sortByChromAndPos($dataArray);
            //echo var_dump($dataArray);
            printTable($dataArray, $idArr);
            
        } //iftgdr

	}
} 
?>
