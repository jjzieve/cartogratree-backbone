<?php
/*
   AmerifluxData.php
   by Hans Vasquez
   Designed for use with SSWAP.

   Started: 4/25/12
   This Release: 5/2/12


*/
// DEBUG MODE.
ini_set('display_errors', 1);

//include_once("../includes/db_access/db_connect.php");
//include_once("includes/incPGSQL.php");
include_once("../../dev/includes/db_access/db_connect_sswap.php");


function scrub($data)
{
    $str = preg_replace("/'/","&apos",$data);
    return $str;
}

if(isset($_GET['tid'])) {      		// boolean pretty print option 
	$escapedTids = pg_escape_string(trim($_GET['tid']));
	$tidarray = explode(',', $escapedTids);

	// Prepare for download.
	header("Cache-control: private");
	header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
	header("Content-Description: File Transfer");
	header("Content-Type: application/octet-stream");
	//header("Content-Type: application/msexcel; charset=ansi");
	header("Content-disposition: attachment; filename=\"diversitree_bulk_upload_inputfile.csv\"");
	header("Expires: 0");

	foreach($tidarray as $j => $value) {
		print "$value\n";
	}
}
?>
