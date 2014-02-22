<?php

//include_once("../includes/db_access/db_connect_sswap.php");
include_once("../../dev/includes/db_access/db_connect_sswap.php"); //for dev box

$q = "select distinct(t.year,t.species,t.tgdr_accession,a.author_name,j.journal_name)
from tgdr_data_availability_mv t, lit_author_r_paper rp, lit_author a, lit_paper p,lit_journal j, tgdr_study_sites tss, tgdr_samples ts
where t.paper_id = p.paper_id and p.paper_id = rp.paper_id and rp.authorship_position = 0 and rp.author_id = a.author_id and p.journal_id = j.journal_id
and t.tgdr_association_data_id = tss.tgdr_association_data_id and tss.id = ts.tgdr_study_sites_id and ts.gps_latitude <> '';";

$res = DBQuery($q);
$numrows = pg_num_rows($res);

if($numrows > 0) {
	$publications = array();
	$year = '';
	while($row = pg_fetch_assoc($res)){
		$fields = explode(",",str_replace(array("(",")","\""), "", $row["row"]));
		$year = $fields[0];
		$species = $fields[1];
		$accession = $fields[2];
		$name = $fields[3];
		$journal = $fields[5];
		$publications[$year][$species][] = $accession."|".$name." et al. (".$journal.")";
	}
	echo json_encode($publications);
}


?>
