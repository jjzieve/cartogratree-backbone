<?php
require("utils.php");	

$q = "
(
   SELECT
                cast(st.sample_id as text),
                st.tree_identifier AS identifier,
                st.species_id,
                s.species,
                s.family as family,
                s.genus as genus,
                cast(sl.is_exact_gps_coordinate AS TEXT),
		0 as num_phenotypes,
		'' AS metric_description,
                CASE
                        WHEN sl.latitude IS NULL OR sl.longitude IS NULL
                        THEN
                                CASE
                                        WHEN (SELECT intptlat FROM gov_census_us_counties gcuc WHERE lower(gcuc.stusps) = lower(ss.state_code2) AND lower(substr(gcuc.name, 1, strrpos(gcuc.name, ' ') - 1)) = lower(sl.county)) IS NOT NULL
                                        THEN (SELECT intptlat FROM gov_census_us_counties gcuc WHERE lower(gcuc.stusps) = lower(ss.state_code2) AND lower(substr(gcuc.name, 1, strrpos(gcuc.name, ' ') - 1)) = lower(sl.county))
                                        ELSE ''
                                END
                        ELSE CAST(sl.latitude AS text)
                END AS latitude,
                CASE
                        WHEN sl.latitude IS NULL OR sl.longitude IS NULL                        THEN
                                CASE
                                        WHEN (SELECT intptlong FROM gov_census_us_counties gcuc WHERE lower(gcuc.stusps) = lower(ss.state_code2) AND lower(substr(gcuc.name, 1, strrpos(gcuc.name, ' ') - 1)) = lower(sl.county)) IS NOT NULL
                                        THEN (SELECT intptlong FROM gov_census_us_counties gcuc WHERE lower(gcuc.stusps) = lower(ss.state_code2) AND lower(substr(gcuc.name, 1, strrpos(gcuc.name, ' ') - 1)) = lower(sl.county))
                                        ELSE ''
                                END
                        ELSE CAST(sl.longitude AS text)
                END AS longitude,                CASE WHEN sl.elevation IS NOT NULL THEN CAST(sl.elevation AS text) ELSE '' END AS elevation,
                (
                        SELECT count(*)/2
                        FROM sample_dnaextractions AS sd
                        INNER JOIN sample_seqplates AS ssp ON sd.extraction_id = ssp.extraction_id
                        INNER JOIN seq_chromats_read_pairs AS scrp ON ssp.plate_sample_id = scrp.plate_sample_id
                        WHERE sd.sample_id = st.sample_id
                ) AS total_read_pairs,
                0 AS total_genotype_platings,
                0 AS total_genotyped 
        FROM sample_treesamples st
        LEFT JOIN species s USING (species_id)
        LEFT JOIN sample_locations sl USING (location_id)
        LEFT JOIN sample_states ss USING (state_id)
        WHERE
                CASE
                        WHEN sl.latitude IS NULL OR sl.longitude IS NULL
                        THEN
                                CASE
                                        WHEN (SELECT intptlat FROM gov_census_us_counties gcuc WHERE lower(gcuc.stusps) = lower(ss.state_code2) AND lower(substr(gcuc.name, 1, strrpos(gcuc.name, ' ') - 1)) = lower(sl.county)) IS NOT NULL
                                        THEN (SELECT intptlat FROM gov_census_us_counties gcuc WHERE lower(gcuc.stusps) = lower(ss.state_code2) AND lower(substr(gcuc.name, 1, strrpos(gcuc.name, ' ') - 1)) = lower(sl.county))
                                        ELSE ''
                                END
                        ELSE CAST(sl.latitude AS text)
                END <> '' AND
                CASE
                        WHEN sl.latitude IS NULL OR sl.longitude IS NULL
                        THEN
                                CASE
                                        WHEN (SELECT intptlong FROM gov_census_us_counties gcuc WHERE lower(gcuc.stusps) = lower(ss.state_code2) AND lower(substr(gcuc.name, 1, strrpos(gcuc.name, ' ') - 1)) = lower(sl.county)) IS NOT NULL
                                        THEN (SELECT intptlong FROM gov_census_us_counties gcuc WHERE lower(gcuc.stusps) = lower(ss.state_code2) AND lower(substr(gcuc.name, 1, strrpos(gcuc.name, ' ') - 1)) = lower(sl.county))
                                        ELSE ''
                                END
                        ELSE CAST(sl.longitude AS text)
                END <> ''
)
UNION ALL (
        SELECT
                cast(ins.id as text) AS sample_id,
                ins.sample_barcode AS identifier,
                s2.species_id,
                s2.species,
                s2.family as family,
                s2.genus as genus,
                cast(iss.is_exact_gps_coordinate AS TEXT),
		count(inv_sample_metrics.descriptive_name) as num_phenotypes,
                string_agg(inv_sample_metrics.descriptive_name || ' [ ' || inv_samples_sample_metrics.measurement_value || ' ] ', '|') AS metric_description,
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
                CASE
                        WHEN iss.gps_elevation IS NOT NULL AND strpos(CAST(iss.gps_elevation AS text), '.') > 0 AND substr(rtrim(CAST(iss.gps_elevation AS text),'0'), length(rtrim(CAST(iss.gps_elevation AS text),'0')), 1) = '.'
                        THEN substr(CAST(iss.gps_elevation AS text), 1, strpos(CAST(iss.gps_elevation AS text), '.') - 1)
                        WHEN iss.gps_elevation IS NOT NULL AND strpos(CAST(iss.gps_elevation AS text), '.') > 0
                        THEN rtrim(CAST(iss.gps_elevation AS text), '0')
                        WHEN iss.gps_elevation IS NOT NULL
                        THEN CAST(iss.gps_elevation AS text)
                        ELSE ''
                END AS elevation,
                0 AS total_read_pairs,
                (
                        SELECT count(*)
                        FROM inv_samples AS is1
                        INNER JOIN inv_samples_received AS isr1 ON is1.id = isr1.inv_samples_id
                        INNER JOIN inv_genotyping_plate_maps AS igpm1 ON isr1.id = igpm1.inv_samples_received_id
                        WHERE is1.sample_barcode = ins.sample_barcode
                ) AS total_genotype_platings,
                (SELECT count(*) FROM inv_genotyping_data_genotype_results AS igdgr WHERE igdgr.inv_samples_id = ins.id) AS total_genotyped
        FROM species AS s2
        LEFT JOIN inv_sample_sources AS iss ON s2.species_id = iss.species_id
        LEFT JOIN inv_samples ON iss.id = inv_samples.inv_sample_sources_id
        LEFT JOIN inv_samples_sample_metrics ON inv_samples.id = inv_samples_sample_metrics.inv_samples_id
        LEFT JOIN inv_sample_metrics ON inv_samples_sample_metrics.inv_sample_metrics_id = inv_sample_metrics.id
        LEFT JOIN inv_samples ins ON iss.id = ins.inv_sample_sources_id
        WHERE iss.gps_latitude IS NOT NULL AND iss.gps_longitude IS NOT NULL
        GROUP BY ins.id, ins.sample_barcode, s2.species_id, s2.species, s2.family, s2.genus, iss.is_exact_gps_coordinate, latitude, longitude, elevation, total_read_pairs, total_genotype_platings, total_genotyped 
)
ORDER BY species ASC, identifier ASC;
";


//Header Line
echo "tree_id\tspecies\tgenus\tfamily\tlat\tlng\telev\tis_exact_gps_coordinate\ticon_name\tnum_genotypes\tnum_sequences\tnum_phenotypes\tphenotypes\n";
$result = DbQuery($q);

// Iterate through the rows, printing XML nodes for each
while ($row = pg_fetch_assoc($result)){
	// ADD TO XML DOCUMENT NODE
    echo parseToXML($row['identifier']). "\t";
    echo parseToXML($row['species']) . "\t";
    echo parseToXML($row['genus']) . "\t";
    echo parseToXML($row['family']) . "\t";

    $lat = $row['latitude'];
    $lng = $row['longitude'];
    if (isDMS($lat)){
            $lat = convertDMStoDeg($lat);
    }
    if (isDMS($lng)){
            $lng = convertDMStoDeg($lng);
    }
	echo $lat."\t";
	echo $lng."\t";
	echo $row['elevation'] . "\t";
	if($row['is_exact_gps_coordinate'] == 'true') {
		echo "true\t";
		echo "small_green\t";
	} else {
		echo "false\t";
		echo "small_yellow\t";
	}

    	echo $row['total_genotyped'] . "\t";
	echo $row['total_read_pairs'] . "\t";
	echo $row['num_phenotypes'] . "\t";
	echo $row['metric_description'] . "\n"; //phenotypes still being developed
}

?>
