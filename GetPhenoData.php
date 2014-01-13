<?php
//testurl
//http://dendrome.ucdavis.edu/_dev/havasquezgross/cartogratree/GetGenoData.php?tid=NC000895,NC000887&hapmap

include_once("../includes/db_access/db_connect_sswap.php");

function printHeader($array) {
   
   $output_string = "<Trait>";

    foreach($array as $value){
        $output_string = $output_string."\t$value";
    }
    echo $output_string."\n";
}

function printTable($dataArray, $metricDescArr) {
  
    $output_string = "";
    //echo var_dump($metricDescArr);
    //echo var_dump($dataArray);
    foreach($dataArray as $tid => $value) {
        $output_string = $output_string."$tid";
        foreach($metricDescArr as $metric_description){
            if(array_key_exists ($metric_description, $dataArray[$tid])) {
                $output_string = $output_string."\t".$dataArray[$tid][$metric_description];
            } else {
                $output_string = $output_string."\t-999";
            }
        }
        $output_string = $output_string."\n";
    }
    echo $output_string;
}

if (isset($_GET['tid'])) {
	$escapedId = pg_escape_string(trim($_GET['tid']));
} else {
}

$idArr = explode(",", $escapedId);

$tid_list = array();
foreach($idArr as $tid) {
	$tid_list[] = "'$tid'";
}    
$queryTidString = implode(",", $tid_list);

$q = "
(SELECT
                st.sample_id,
                st.tree_identifier AS identifier,
                '' AS metric_description,
                '' AS metric_value,
                 'sts' data_source
        FROM sample_treesamples st
        LEFT JOIN species s USING (species_id)
        LEFT JOIN sample_locations sl USING (location_id)
        LEFT JOIN sample_states ss USING (state_id)
        WHERE
               tree_identifier IN ($queryTidString)

 )
 UNION ALL (
        SELECT
                ins.id AS sample_id,
                ins.sample_barcode AS identifier,
                inv_sample_metrics.descriptive_name AS metric_description,
                inv_samples_sample_metrics.measurement_value AS metric_value,
                'is' data_source
        FROM species AS s2
        LEFT JOIN inv_sample_sources AS iss ON s2.species_id = iss.species_id
        LEFT JOIN inv_samples ON iss.id = inv_samples.inv_sample_sources_id
        LEFT JOIN inv_samples_sample_metrics ON inv_samples.id = inv_samples_sample_metrics.inv_samples_id
        LEFT JOIN inv_sample_metrics ON inv_samples_sample_metrics.inv_sample_metrics_id = inv_sample_metrics.id
        LEFT JOIN inv_samples ins ON iss.id = ins.inv_sample_sources_id
        WHERE ins.sample_barcode IN ($queryTidString)
        GROUP BY ins.id, ins.sample_barcode, data_source, inv_sample_metrics.descriptive_name, metric_value

) 
UNION ALL (
    SELECT  
        s.id as sample_id,
        t.tgdr_accession || '-' || s.id as identifier,
        tgdr_phenotypes_per_individual.phenotype_name AS metric_description,
        tgdr_phenotypes_per_individual.value AS metric_value,
        'tgdr' AS data_source    
        FROM 
                tgdr_data_availability_mv t,
                tgdr_samples s
        LEFT JOIN tgdr_phenotypes_per_individual ON s.id = tgdr_phenotypes_per_individual.tgdr_samples_id            
        WHERE 
                t.tgdr_accession || '-' || s.id IN ($queryTidString)
        GROUP BY
                sample_id, 
                identifier,
                tgdr_phenotypes_per_individual.phenotype_name,
                metric_value
)
ORDER BY identifier ASC, metric_description ASC;
";
header("Content-Type: text/plain; charset=ansi");
//echo $q;
//exit();
$res = DBQuery($q);
$numrows = pg_num_rows($res);
$numsamples = count($idArr);
$numsnps = $numrows / $numsamples;



if ($numrows > 0) {

    $metricDescArr = array();
    while ($r = pg_fetch_assoc($res)) {

        $metric_description = $r["metric_description"];
        if($metric_description != "") {
            $metric_description = str_replace(" ","_",$metric_description);
            $metricDescArr[] = $metric_description;
        }

    }
    $metricDescArr = array_unique($metricDescArr);
    $dataArray = array();
    pg_result_seek($res, 0);

    while ($r = pg_fetch_assoc($res)) {
        $identifier = $r["identifier"];
        $metric_description = $r["metric_description"];
        $metric_value = $r["metric_value"];
        $metric_description = str_replace(" ","_",$metric_description);

        //$dataArray[$metric_description][$identifier] = $metric_value;
        $dataArray[$identifier][$metric_description]= $metric_value;
    }

    //echo var_dump($dataArray);
    printHeader($metricDescArr);
    printTable($dataArray, $metricDescArr);

}

?>
