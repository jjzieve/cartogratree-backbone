<?php

function outputCSV($data) {
    $outstream = fopen("php://output", "w");
    function __outputCSV(&$vals, $key, $filehandler) {
        fputcsv($filehandler, $vals); // add parameters if you want
    }   
    array_walk($data, "__outputCSV", $outstream);
    fclose($outstream);
}


if (isset($_GET['lat'])) {
	if(isset($_GET['lon'])){
		if(isset($_GET['id'])){
			$escapedLat = pg_escape_string(trim($_GET['lat']));
			$escapedLon = pg_escape_string(trim($_GET['lon']));
			$escapedId = pg_escape_string(trim($_GET['id']));
		}
	}
}

$latArr = explode(",", $escapedLat);
$lonArr = explode(",", $escapedLon);
$idArr = explode(",", $escapedId);

if(isset($_GET['csv'])) {
	$arrayForCSV = array();
	$tempArray = array();

	$tempArray[0] = "Identifier";
	$tempArray[1] = "Latitude";
	$tempArray[2] = "Longitude";
	$tempArray[3] = "MeanAnnualTemp";
	$tempArray[4] = "AnnualTempRange";
	$tempArray[5] = "MaxTempWarmMonth";
	$tempArray[6] = "MinTempColdMonth";
	$tempArray[7] = "MeanTempWetQuarter";
	$tempArray[8] = "MeanTempDryQuarter";
	$tempArray[9] = "MeanTempWarmQuarter";
	$tempArray[10] = "MeanTempColdQuarter";
	$tempArray[11] = "TempSeasonality";
	$tempArray[12] = "MeanDiurnalRange";
	$tempArray[13] = "Isothermality";
	$tempArray[14] = "MeanAnnualPrec";
	$tempArray[15] = "PrecWetMonth";
	$tempArray[16] = "PrecDryMonth";
	$tempArray[17] = "PrecWetQuarter";
	$tempArray[18] = "PrecDryQuarter";
	$tempArray[19] = "PrecWarmQuarter";
	$tempArray[20] = "PrecColdQuarter";
	$tempArray[21] = "PrecSeasonality";

	$arrayForCSV[] = $tempArray;
	
    for($i = 0; $i < count($latArr); $i++) {
        $lat = $latArr[$i];
        $lon = $lonArr[$i];
        $id = $idArr[$i];
		$tempArray = array();

        $jsonurl = "http://castle.iplantcollaborative.org:9000/info?lat=$lat&lon=$lon";
        $json = file_get_contents($jsonurl);

        $jsonarray = json_decode($json, true);

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

		$tempArray[0] = "$id";
		$tempArray[1] = "$lat";
		$tempArray[2] = "$lon";
		$tempArray[3] = "$mat";
		$tempArray[4] = "$tar";
		$tempArray[5] = "$maxtwm";
		$tempArray[6] = "$anntmin";
		$tempArray[7] = "$meantwq";
		$tempArray[8] = "$meantdq";
		$tempArray[9] = "$meantwaq";
		$tempArray[10] = "$meantcq";
		$tempArray[11] = "$tsd";
		$tempArray[12] = "$mdr";
		$tempArray[13] = "$iso";
		$tempArray[14] = "$annprec";
		$tempArray[15] = "$precwm";
		$tempArray[16] = "$precdm";
		$tempArray[17] = "$precwq";
		$tempArray[18] = "$precdq";
		$tempArray[19] = "$precwarmq";
		$tempArray[20] = "$preccq";
		$tempArray[21] = "$precs";
		
		$arrayForCSV[] = $tempArray;
	}
	
	// Prepare for download.
	header("Cache-control: private");
	header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
	header("Content-Description: File Transfer");
	//header("Content-Type: application/octet-stream");
	header("Content-Type: text/csv; charset=ansi");
	header("Content-disposition: attachment; filename=\"worldclim_spreadsheet.csv\"");
	header("Expires: 0");
	outputCSV($arrayForCSV);
} else {
	$json_array = array();
	for($i = 0; $i < count($latArr); $i++) {
		$lat = $latArr[$i];
		$lon = $lonArr[$i];
		$id = $idArr[$i];
		$jsonurl = "http://castle.iplantcollaborative.org:9000/info?lat=$lat&lon=$lon";
		$json = json_decode(file_get_contents($jsonurl));
		$json->mat = $json->mat / 10; 
        $json->mdr = $json->mdr / 10; 
        $json->iso = $json->iso / 10; 
        $json->tsd = $json->tsd / 100;
        $json->maxtwm = $json->maxtwm / 10; 
        $json->anntmin = $json->anntmin / 10; 
        $json->tar = $json->tar / 10;
        $json->meantwq = $json->meantwq / 10;
        $json->meantdq = $json->meantdq / 10;
        $json->meantwaq = $json->meantwaq / 10;
        $json->meantcq = $json->meantcq / 10;
        $json->precs = $json->precs / 100;
		$json->id = $id;
		array_push($json_array,$json);
	}
	echo json_encode($json_array);
}
