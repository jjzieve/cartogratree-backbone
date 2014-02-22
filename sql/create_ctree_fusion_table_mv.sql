-- Table: ctree_fusion_table_mv

DROP TABLE ctree_fusion_table_mv;

CREATE TABLE ctree_fusion_table_mv AS 
(
        SELECT
                cast(st.sample_id as text),
                st.tree_identifier AS identifier,
                st.species_id,
                s.species,
                s.family as family,
                s.genus as genus,
                cast(sl.is_exact_gps_coordinate AS TEXT),
                '' AS metric_description,
                '' as accession,
                cast('' AS TEXT) AS year,
                '' AS authors,
                cast('' AS TEXT) AS pub_title,
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
                0 AS total_genotyped,                'sts' data_source
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
                string_agg(inv_sample_metrics.descriptive_name || ' [ ' || inv_samples_sample_metrics.measurement_value || ' ] ', '|') AS metric_description,
		'' as accession,
                '' AS year,
                '' AS authors,
                cast('' AS TEXT) AS pub_title,
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
                (SELECT count(*) FROM inv_genotyping_data_genotype_results AS igdgr WHERE igdgr.inv_samples_id = ins.id) AS total_genotyped,
                'is' data_source
        FROM species AS s2
        LEFT JOIN inv_sample_sources AS iss ON s2.species_id = iss.species_id
        LEFT JOIN inv_samples ON iss.id = inv_samples.inv_sample_sources_id
        LEFT JOIN inv_samples_sample_metrics ON inv_samples.id = inv_samples_sample_metrics.inv_samples_id
        LEFT JOIN inv_sample_metrics ON inv_samples_sample_metrics.inv_sample_metrics_id = inv_sample_metrics.id
        LEFT JOIN inv_samples ins ON iss.id = ins.inv_sample_sources_id
        WHERE iss.gps_latitude IS NOT NULL AND iss.gps_longitude IS NOT NULL
        GROUP BY ins.id, ins.sample_barcode, s2.species_id, s2.species, s2.family, s2.genus, iss.is_exact_gps_coordinate, year, pub_title, latitude, longitude, elevation, total_read_pairs, total_genotype_platings, total_genotyped, data_source
)
UNION ALL (

        SELECT  
                cast(s.sample_name as TEXT) AS sample_id,
                t.tgdr_accession || '-' || s.sample_name as identifier,
                sp.species_id,
                sp.species as species,  
                sp.family as family, 
                sp.genus as genus,
                'true' AS is_exact_gps_coordinate,
                '' AS metric_description, 
                t.tgdr_accession as accession,
                cast(t.year as TEXT) AS year,
                string_agg(a.author_name, ',') as authors,
                t.title AS pub_title,
                cast(s.gps_latitude AS TEXT) as latitude,
                cast(s.gps_longitude AS TEXT) as longitude,
                '' AS elevation,
                0 AS total_read_pairs,
                0 AS total_genotype_platings, 
                0 AS total_genotyped,
                'tgdr' AS data_source
        FROM 
                tgdr_data_availability_mv t,
                species sp,
                tgdr_study_sites ss,
                tgdr_samples s, 
                lit_author_r_paper p, 
                lit_author a
        WHERE 
		s.gps_latitude <> ''
		and
		s.gps_latitude <> '.'
		and
                t.tgdr_association_data_id = ss.tgdr_association_data_id
                and 
                t.species_id = sp.species_id
                and
                s.tgdr_study_sites_id = ss.id
                and
                t.paper_id = p.paper_id
                and
                a.author_id = p.author_id
        GROUP BY
                sample_id, 
                identifier,
                sp.species,
                sp.species_id, 
                accession,
                family, 
                genus,
	        is_exact_gps_coordinate,
                year,
                pub_title,
                latitude,
                longitude,
                elevation,
                total_read_pairs,
                total_genotype_platings,
                total_genotyped,
                data_source

) 
ORDER BY species ASC, identifier ASC;
ALTER TABLE tgdr_data_availability_mv
  OWNER TO jzieve;
GRANT ALL ON TABLE tgdr_data_availability_mv TO jzieve;
GRANT SELECT ON TABLE tgdr_data_availability_mv TO btearse;
GRANT SELECT ON TABLE tgdr_data_availability_mv TO hansvg;