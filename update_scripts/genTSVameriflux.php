<?php
require("utils.php");
$q = "SELECT distinct(site_byid), site_byname, site_name, latitude, longitude, igbp_vegetation_type, 
		CASE
			WHEN source_url <> '' THEN substring(source_url from 0 for strrpos(source_url,'/')+1)
			ELSE ''
		END as source_url,
		CASE 
			WHEN (ameriflux_year_averages.site_indicator <> '' AND source_url ~ 'Level4') THEN '1'
			ELSE '0'
		END AS data_flag
	FROM ameriflux_sites left JOIN ameriflux_year_averages ON
	CASE
		WHEN replace(lower(ameriflux_sites.site_byid), '-', '') = lower(ameriflux_year_averages.site_indicator) THEN true
		WHEN 'amf_' || replace(lower(ameriflux_sites.site_byid), '-', '') = lower(ameriflux_year_averages.site_indicator) THEN true
		ELSE false
	END";
$result = DbQuery($q);
echo "site_id\tsite_name\tlat\tlng\tsrc_url\ttype\tdata\ticon_name\tis_exact_gps_coordinate\tnum_sequences\tnum_genotypes\tnum_phenotypes\n";
while ($row = pg_fetch_assoc($result)){
	echo    parseToCSV($row['site_byid']). "\t" .
		parseToCSV($row['site_byname']). "\t".
		parseToCSV($row['latitude']). "\t".
		parseToCSV($row['longitude']). "\t".
		parseToCSV($row['source_url']). "\t".
		parseToCSV($row['igbp_vegetation_type']). "\t".
		parseToCSV($row['data_flag']) . "\t" .
		"ranger_station\ttrue\t0\t0\t0\n";
}

?>
