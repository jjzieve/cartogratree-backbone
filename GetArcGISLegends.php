<?php
	if(isset($_GET["url"])){
		$url = pg_escape_string($_GET["url"]);
	}
	$json = file_get_contents($url);
	echo $json;
?>
