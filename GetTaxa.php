<?php

//include_once("../includes/db_access/db_connect_sswap.php");
include_once("../../dev/includes/db_access/db_connect_sswap.php"); //for dev box

$q = "select distinct(family,genus,species) from ctree_fusion_table_is_sts_mv;";
$res = DBQuery($q);
$numrows = pg_num_rows($res);

if($numrows > 0) {
	$taxa = array();
	while($row = pg_fetch_assoc($res)){
 		$fields = explode(",",str_replace(array("(",")","\""), "", $row["row"]));
		$family = $fields[0];
		$genus = $fields[1];
		$species = $fields[2];
		$taxa[$family][$genus][] = $species; 
	}
	echo json_encode($taxa);
}


?>
