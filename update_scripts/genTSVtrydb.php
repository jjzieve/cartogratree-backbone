<?php
	
require("utils.php");

$q = 
	"SELECT  ecp_trydb.species_code_4, 
        ecp_trydb.institution, 
        ecp_trydb.dataset, 
        ecp_trydb.firstname, 
        ecp_trydb.lastname, 
        ecp_trydb.class_type, 
        CASE
                WHEN ecp_trydb.lat IS NOT NULL AND strpos(CAST(ecp_trydb.lat AS text), '.') > 0 AND substr(rtrim(CAST(ecp_trydb.lat AS text),'0'), length(rtrim(CAST(ecp_trydb.lat AS text),'0')), 1) = '.'
                THEN substr(CAST(ecp_trydb.lat AS text), 1, strpos(CAST(ecp_trydb.lat AS text), '.') - 1)
                WHEN ecp_trydb.lat IS NOT NULL AND strpos(CAST(ecp_trydb.lat AS text), '.') > 0
                THEN rtrim(CAST(ecp_trydb.lat AS text), '0')
                WHEN ecp_trydb.lat IS NOT NULL
                THEN CAST(ecp_trydb.lat AS text)
                ELSE ''        END AS lat,
        CASE
                WHEN ecp_trydb.lon IS NOT NULL AND strpos(CAST(ecp_trydb.lon AS text), '.') > 0 AND substr(rtrim(CAST(ecp_trydb.lon AS text),'0'), length(rtrim(CAST(ecp_trydb.lon AS text),'0')), 1) = '.'
                THEN substr(CAST(ecp_trydb.lon AS text), 1, strpos(CAST(ecp_trydb.lon AS text), '.') - 1)
                WHEN ecp_trydb.lon IS NOT NULL AND strpos(CAST(ecp_trydb.lon AS text), '.') > 0
                THEN rtrim(CAST(ecp_trydb.lon AS text), '0')
                WHEN ecp_trydb.lon IS NOT NULL
                THEN CAST(ecp_trydb.lon AS text)
                ELSE ''
        END AS lon,
        species.species, 
        species.species_id, 
        ecp_trydb_gps_groups.identifier,
        string_agg(DISTINCT trait, '|') AS traits,        
	count(distinct trait) as num_phenotypes
FROM ecp_trydb
INNER JOIN species ON species.species_code_4 = ecp_trydb.species_code_4
INNER JOIN ecp_trydb_gps_groups ON ecp_trydb.ecp_trydb_gps_groups_id = ecp_trydb_gps_groups.id
GROUP BY ecp_trydb.lat, ecp_trydb.lon, ecp_trydb.species_code_4, ecp_trydb.institution, ecp_trydb.dataset, ecp_trydb.firstname, ecp_trydb.lastname, ecp_trydb.class_type, species.species, species.species_id, ecp_trydb_gps_groups.identifier
ORDER BY species.species, ecp_trydb.lat, ecp_trydb.lon;";

$result = DbQuery($q);

// Iterate through the rows, printing CSV nodes for each
echo "tree_id\tinstitution\tspecies_id\tspecies\tlat\tlng\tdataset\tfirstname\tlastname\ttraits\tclass\ticon_name\tis_exact_gps_coordinate\tnum_sequences\tnum_phenotypes\tnum_genotypes\n";
while ($row = pg_fetch_assoc($result)){
	if($row['class_type'] == 'angiosperm') {
		$class = 'angiosperm';
	} else {
		$class = 'gymnosperm';
	}
	
	echo    parseToCSV($row['identifier']) . "\t" . 
		parseToCSV($row['institution']) . "\t" . 
		parseToCSV($row['species_id']) . "\t" . 
		parseToCSV($row['species']) . "\t" . 
		parseToCSV($row['lat']) . "\t" . 
		parseToCSV($row['lon']) . "\t" . 
		parseToCSV($row['dataset']) . "\t" . 
		parseToCSV($row['firstname']) . "\t" . 
		parseToCSV($row['lastname']) . "\t" . 
		parseToCSV($row['traits']) . "\t" . 
		parseToCSV($class) . "\t" .
		"measle_brown\ttrue\t0\t" .
		parseToCSV($row['num_phenotypes']) . "\t0\n";

}
?>
