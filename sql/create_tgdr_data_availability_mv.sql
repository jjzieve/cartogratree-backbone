-- Table: tgdr_data_availability_mv

DROP TABLE tgdr_data_availability_mv;

CREATE TABLE tgdr_data_availability_mv AS 
 SELECT tgdr_association_data.id AS tgdr_association_data_id, tgdr_association_data.creation_date, tgdr_association_data.tgdr_accession, tgdr_association_data.paper_id, lit_paper.title, lit_paper.year, lit_paper.month, 
        CASE
            WHEN tgdr_association_data.release_date_override IS NOT NULL THEN tgdr_association_data.release_date_override::date
            WHEN lit_paper.year IS NULL THEN (tgdr_association_data.creation_date + '3 mons'::interval)::date
            WHEN (lit_paper.month IS NULL OR lit_paper.month::text = ''::text) AND date_part('year'::text, tgdr_association_data.creation_date) = lit_paper.year::double precision THEN (tgdr_association_data.creation_date + '3 mons'::interval)::date
            WHEN (lit_paper.month IS NULL OR lit_paper.month::text = ''::text) AND date_part('year'::text, tgdr_association_data.creation_date) < lit_paper.year::double precision THEN (((lit_paper.year + 1::numeric)::text) || '0101'::text)::date
            WHEN (lit_paper.month IS NULL OR lit_paper.month::text = ''::text) AND date_part('year'::text, tgdr_association_data.creation_date) > lit_paper.year::double precision THEN (lit_paper.year::text || '0101'::text)::date
            WHEN lower(lit_paper.month::text) = 'jan'::text OR lower(lit_paper.month::text) = 'january'::text THEN (lit_paper.year::text || '0115'::text)::date
            WHEN lower(lit_paper.month::text) = 'feb'::text OR lower(lit_paper.month::text) = 'february'::text THEN (lit_paper.year::text || '0215'::text)::date
            WHEN lower(lit_paper.month::text) = 'mar'::text OR lower(lit_paper.month::text) = 'march'::text THEN (lit_paper.year::text || '0315'::text)::date
            WHEN lower(lit_paper.month::text) = 'apr'::text OR lower(lit_paper.month::text) = 'april'::text THEN (lit_paper.year::text || '0415'::text)::date
            WHEN lower(lit_paper.month::text) = 'may'::text THEN (lit_paper.year::text || '0515'::text)::date
            WHEN lower(lit_paper.month::text) = 'jun'::text OR lower(lit_paper.month::text) = 'june'::text THEN (lit_paper.year::text || '0615'::text)::date
            WHEN lower(lit_paper.month::text) = 'jul'::text OR lower(lit_paper.month::text) = 'july'::text THEN (lit_paper.year::text || '0715'::text)::date
            WHEN lower(lit_paper.month::text) = 'aug'::text OR lower(lit_paper.month::text) = 'august'::text THEN (lit_paper.year::text || '0815'::text)::date
            WHEN lower(lit_paper.month::text) = 'sep'::text OR lower(lit_paper.month::text) = 'september'::text OR lower(lit_paper.month::text) = 'sept'::text THEN (lit_paper.year::text || '0915'::text)::date
            WHEN lower(lit_paper.month::text) = 'oct'::text OR lower(lit_paper.month::text) = 'october'::text THEN (lit_paper.year::text || '1015'::text)::date
            WHEN lower(lit_paper.month::text) = 'nov'::text OR lower(lit_paper.month::text) = 'november'::text THEN (lit_paper.year::text || '1115'::text)::date
            WHEN lower(lit_paper.month::text) = 'dec'::text OR lower(lit_paper.month::text) = 'december'::text THEN (lit_paper.year::text || '1215'::text)::date
            ELSE (tgdr_association_data.creation_date + '3 mons'::interval)::date
        END AS tgdr_data_release_date, tgdr_association_data.species_id, species.species, ( SELECT count(*) AS count
           FROM tgdr_association_data ad1
      JOIN tgdr_study_sites ss1 ON ad1.id = ss1.tgdr_association_data_id
     WHERE ad1.tgdr_accession::text = tgdr_association_data.tgdr_accession::text) AS total_sites, ( SELECT count(*) AS count
           FROM tgdr_association_data ad1
      JOIN tgdr_study_sites ss1 ON ad1.id = ss1.tgdr_association_data_id
   JOIN tgdr_samples s1 ON ss1.id = s1.tgdr_study_sites_id
  WHERE ad1.tgdr_accession::text = tgdr_association_data.tgdr_accession::text) AS total_samples, ( SELECT count(*) AS count
           FROM tgdr_association_data ad1
      JOIN tgdr_study_sites ss1 ON ad1.id = ss1.tgdr_association_data_id
   JOIN tgdr_samples s1 ON ss1.id = s1.tgdr_study_sites_id
   JOIN tgdr_genotypes g1 ON s1.id = g1.tgdr_samples_id
  WHERE ad1.tgdr_accession::text = tgdr_association_data.tgdr_accession::text) AS total_genotypes, ( SELECT count(tmp1.*) AS count
           FROM ( SELECT DISTINCT ad1.tgdr_accession, g1.genetic_marker_type, g1.genetic_marker_name
                   FROM tgdr_association_data ad1
              JOIN tgdr_study_sites ss1 ON ad1.id = ss1.tgdr_association_data_id
         JOIN tgdr_samples s1 ON ss1.id = s1.tgdr_study_sites_id
    JOIN tgdr_genotypes g1 ON s1.id = g1.tgdr_samples_id
   WHERE ad1.tgdr_accession::text = tgdr_association_data.tgdr_accession::text AND g1.genetic_marker_type::text = 'AFLP'::text) tmp1) AS total_aflp_markers, ( SELECT count(tmp1.*) AS count
           FROM ( SELECT DISTINCT ad1.tgdr_accession, g1.genetic_marker_type, g1.genetic_marker_name
                   FROM tgdr_association_data ad1
              JOIN tgdr_study_sites ss1 ON ad1.id = ss1.tgdr_association_data_id
         JOIN tgdr_samples s1 ON ss1.id = s1.tgdr_study_sites_id
    JOIN tgdr_genotypes g1 ON s1.id = g1.tgdr_samples_id
   WHERE ad1.tgdr_accession::text = tgdr_association_data.tgdr_accession::text AND g1.genetic_marker_type::text = 'RAPD'::text) tmp1) AS total_rapd_markers, ( SELECT count(tmp1.*) AS count
           FROM ( SELECT DISTINCT ad1.tgdr_accession, g1.genetic_marker_type, g1.genetic_marker_name
                   FROM tgdr_association_data ad1
              JOIN tgdr_study_sites ss1 ON ad1.id = ss1.tgdr_association_data_id
         JOIN tgdr_samples s1 ON ss1.id = s1.tgdr_study_sites_id
    JOIN tgdr_genotypes g1 ON s1.id = g1.tgdr_samples_id
   WHERE ad1.tgdr_accession::text = tgdr_association_data.tgdr_accession::text AND g1.genetic_marker_type::text = 'SNP'::text) tmp1) AS total_snp_markers, ( SELECT count(tmp1.*) AS count
           FROM ( SELECT DISTINCT ad1.tgdr_accession, g1.genetic_marker_type, g1.genetic_marker_name
                   FROM tgdr_association_data ad1
              JOIN tgdr_study_sites ss1 ON ad1.id = ss1.tgdr_association_data_id
         JOIN tgdr_samples s1 ON ss1.id = s1.tgdr_study_sites_id
    JOIN tgdr_genotypes g1 ON s1.id = g1.tgdr_samples_id
   WHERE ad1.tgdr_accession::text = tgdr_association_data.tgdr_accession::text AND g1.genetic_marker_type::text = 'cpSSR'::text) tmp1) AS total_cpssr_markers, ( SELECT count(tmp1.*) AS count
           FROM ( SELECT DISTINCT ad1.tgdr_accession, g1.genetic_marker_type, g1.genetic_marker_name
                   FROM tgdr_association_data ad1
              JOIN tgdr_study_sites ss1 ON ad1.id = ss1.tgdr_association_data_id
         JOIN tgdr_samples s1 ON ss1.id = s1.tgdr_study_sites_id
    JOIN tgdr_genotypes g1 ON s1.id = g1.tgdr_samples_id
   WHERE ad1.tgdr_accession::text = tgdr_association_data.tgdr_accession::text AND g1.genetic_marker_type::text = 'SSR'::text) tmp1) AS total_ssr_markers, ( SELECT count(*) AS count
           FROM tgdr_association_data ad1
      JOIN tgdr_study_sites ss1 ON ad1.id = ss1.tgdr_association_data_id
   JOIN tgdr_samples s1 ON ss1.id = s1.tgdr_study_sites_id
   JOIN tgdr_phenotypes_per_individual ppi1 ON s1.id = ppi1.tgdr_samples_id
  WHERE ad1.tgdr_accession::text = tgdr_association_data.tgdr_accession::text) AS total_phenotypes_per_individual, ( SELECT count(*) AS count
           FROM tgdr_association_data ad1
      JOIN tgdr_study_sites ss1 ON ad1.id = ss1.tgdr_association_data_id
   JOIN tgdr_samples s1 ON ss1.id = s1.tgdr_study_sites_id
   JOIN tgdr_environmentals_per_individual epi1 ON s1.id = epi1.tgdr_samples_id
  WHERE ad1.tgdr_accession::text = tgdr_association_data.tgdr_accession::text) AS total_environmentals_per_individual, ( SELECT count(*) AS count
           FROM tgdr_association_data ad1
      JOIN tgdr_study_sites ss1 ON ad1.id = ss1.tgdr_association_data_id
   JOIN tgdr_environmentals_per_site eps1 ON ss1.id = eps1.tgdr_study_sites_id
  WHERE ad1.tgdr_accession::text = tgdr_association_data.tgdr_accession::text) AS total_environmentals_per_site
   FROM tgdr_association_data
   JOIN lit_paper ON tgdr_association_data.paper_id = lit_paper.paper_id
   JOIN species ON tgdr_association_data.species_id = species.species_id
  WHERE tgdr_association_data.submission_accepted = true
  ORDER BY tgdr_association_data.tgdr_accession;

ALTER TABLE tgdr_data_availability_mv
  OWNER TO jzieve;
GRANT ALL ON TABLE tgdr_data_availability_mv TO jzieve;
GRANT SELECT ON TABLE tgdr_data_availability_mv TO btearse;
GRANT SELECT ON TABLE tgdr_data_availability_mv TO hansvg;
GRANT SELECT ON TABLE tgdr_data_availability_mv TO sswap_agent;


