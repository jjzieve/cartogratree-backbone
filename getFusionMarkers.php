<?php
	$prefix = "https://www.googleapis.com/fusiontables/v1/query?sql="; 
	$key = "&key=AIzaSyBS-W0iAfwohml4fqqG-qOVtkSzQtv6Ic0";
	if (isset($_GET['tgdr_query']) && isset($_GET['sts_is_query']) && isset($_GET['try_db_query'])) {
		$tgdr_query = pg_escape_string(trim($_GET['tgdr_query']));
		$sts_is_query = pg_escape_string(trim($_GET['sts_is_query']));
		$try_db_query = pg_escape_string(trim($_GET['try_db_query']));
	}
	else{ // to test from command line 
		$sts_is_query = "SELECT%20icon_name,tree_id,lat,lng,num_sequences,num_genotypes,species%20FROM%201bL0GwAL_mlUutv9TVFqknjKLkwzq4sAn5mHiiaI";
		$tgdr_query = "SELECT%20icon_name,tree_id,lat,lng,num_sequences,num_genotypes,species%20FROM%20118Vk00La9Ap3wSg8z8LnZQG0mYz5iZ67o3uqa8M";
		$try_db_query = "SELECT%20icon_name,tree_id,lat,lng,num_sequences,num_genotypes,species%20FROM%201XwP3nc6H5_AUjdCjpXtrIlrSmtOHXr0Q9p_vrPw";
	}
		
	$tgdr_json_url = $prefix.$tgdr_query.$key;
	$sts_is_json_url = $prefix.$sts_is_query.$key;
	$try_db_json_url = $prefix.$try_db_query.$key;
    $tgdr_json = json_decode(file_get_contents($tgdr_json_url));
	$sts_is_json = json_decode(file_get_contents($sts_is_json_url));
	$try_db_json = json_decode(file_get_contents($try_db_json_url));
	$json = json_encode(array_merge(array_merge($tgdr_json->rows,$sts_is_json->rows),$try_db_json->rows));// needed to call ->rows to pull array out of php's stdClass
	//debug
//	var_dump($json);
	echo $json;
	

?>

