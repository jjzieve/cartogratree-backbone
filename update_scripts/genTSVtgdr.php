<?php
	
require("utils.php");

$q = "
select 
	t.tgdr_accession || '-' || ts.id tree_id,
	t.tgdr_accession as accession,
	'true' as is_exact_gps_coordinate,
	ts.gps_latitude as lat,
	ts.gps_longitude as lng,
	p.paper_id as tg_pid,
	t.title as title,
	t.year as year,
	string_agg(a.author_name, ',') as authors,
	t.species as species,
	0 as num_sequences,
	(select count(*) from tgdr_genotypes tg where tg.tgdr_samples_id = ts.id) as num_genotypes,
	(select count(*) from tgdr_phenotypes_per_individual tp where tp.tgdr_samples_id = ts.id) as num_phenotypes
from 
	tgdr_data_availability t,
	tgdr_study_sites tss,
	tgdr_samples ts,
	lit_author_r_paper p,
	lit_author a
where
	ts.gps_latitude <> '' 
	and
	ts.gps_latitude <> '.'
        and
        t.tgdr_association_data_id = tss.tgdr_association_data_id
        and 
        ts.tgdr_study_sites_id = tss.id
        and
        t.paper_id = p.paper_id
        and
        a.author_id = p.author_id
group by 
	tree_id,
	accession,
	is_exact_gps_coordinate,
	lat,
	lng,
	tg_pid,
	title,
	year,
	species,
	num_sequences,
	num_genotypes,
	num_phenotypes;
";


//Header Line
echo "tree_id\taccession\tis_exact_gps_coordinate\tlat\tlng\ttg_pid\ttitle\tyear\tauthors\tspecies\tnum_sequences\tnum_genotypes\tnum_phenotypes\ticon_name\n";
$result = DbQuery($q);

// Iterate through the rows, printing XML nodes for each
while ($row = pg_fetch_assoc($result)){
	echo parseToXML($row['tree_id']). "\t";
	echo parseToXML($row['accession']). "\t";
	echo parseToXML($row['is_exact_gps_coordinate']). "\t";
	$lat = $row['lat'];
	$lng = $row['lng'];
        if (isDMS($lat)){
            	$lat = convertDMStoDeg($lat);
	}
	if (isDMS($lng)){
		$lng = convertDMStoDeg($lng);
	}
	echo $lat."\t";
	echo $lng."\t";
	echo parseToXML($row['tg_pid']). "\t";//just in case ajax call for lit info later...
	echo parseToXML($row['title']). "\t";
	echo parseToXML($row['year']). "\t";
	echo parseToXML($row['authors']). "\t";
	echo parseToXML($row['species']). "\t";//can hopefully search by species name in ajax...
	echo parseToXML($row['num_sequences']). "\t"; //may change to more than zero in future
	echo parseToXML($row['num_genotypes']). "\t";
	echo parseToXML($row['num_phenotypes']). "\t";
	echo "small_green\n";
	// ADD TO XML DOCUMENT NODE
}


//echo "tree_id\tspecies\tgenus\tspecies_id\tlat\tlng\telev\tgps\ttype\ticon_name\tgenotyped\tgenotype_plate\tsequenced\tphenotype\tfamily\ttitle\tyear\tauthors\n";
?>
