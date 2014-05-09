<?php
/*
   GetCommonAmplicon.php 
   by Jacob Zieve
   Designed for use with CartograTree.

   Started: 5/9/14
   This Release: ?


*/
// DEBUG MODE.
ini_set('display_errors', 1);

#include_once("../includes/db_access/db_connect_sswap.php");
include_once("../../dev/includes/db_access/db_connect_sswap.php");//for dev box
//include_once("includes/incPGSQL.php");
session_start(); // should use this so user can bring up amplicon queries again

/*** Start Functions **/

function GETlist($id)
{
	if (isset($_GET[$id])) {
		$escapedTids = pg_escape_string(trim($_GET[$id]));
		return explode(',', $escapedTids);
	} else {
		return array();
	}
}

function scrub($data)
{
    $str = preg_replace("/'/","&apos",$data);
    return $str;
}

function genQuery($ampliconINString)
{
	return " SELECT * FROM (
		(
			SELECT seq_amplicons.amplicon_name, est_contig.est_contig_name AS contig_name,
				'go' AS annot_type, est_contig_go_term.go_term_acc AS annot_id, go_term.name AS annot_term
			FROM seq_amplicons
			INNER JOIN est_contig ON est_contig.est_contig_id = seq_amplicons.est_contig_id
			INNER JOIN est_contig_go_term ON est_contig_go_term.est_contig_name = est_contig.est_contig_name
			INNER JOIN go_term ON go_term.acc = est_contig_go_term.go_term_acc
			WHERE amplicon_name IN ( $ampliconINString )

		) UNION (

			SELECT seq_amplicons.amplicon_name, est_contiggroup.est_contig_group_name AS contig_name,
				'go' AS annot_type, est_contiggroup_go_term.go_term_acc AS annot_id, go_term.name AS annot_term
			FROM seq_amplicons
			INNER JOIN est_contiggroup ON est_contiggroup.est_contig_group_id = seq_amplicons.est_contig_group_id
			INNER JOIN est_contiggroup_go_term ON est_contiggroup_go_term.est_contig_group_name = est_contiggroup.est_contig_group_name
			INNER JOIN go_term ON go_term.acc = est_contiggroup_go_term.go_term_acc
			WHERE amplicon_name IN ( $ampliconINString )

		) UNION (

			SELECT seq_amplicons.amplicon_name, est_contig.est_contig_name AS contig_name,
				'ec' AS annot_type, ec_enzyme.ec_number AS annot_id, ec_enzyme.description AS annot_term
			FROM seq_amplicons
			INNER JOIN est_contig ON est_contig.est_contig_id = seq_amplicons.est_contig_id
			INNER JOIN est_contig_ec_enzyme ON est_contig_ec_enzyme.est_contig_name = est_contig.est_contig_name
			INNER JOIN ec_enzyme ON ec_enzyme.ec_number = est_contig_ec_enzyme.ec_number
			WHERE amplicon_name IN ( $ampliconINString )
			
		) UNION (

			SELECT seq_amplicons.amplicon_name, est_contiggroup.est_contig_group_name AS contig_name,
				'ec' AS annot_type, ec_enzyme.ec_number AS annot_id, ec_enzyme.description AS annot_term
			FROM seq_amplicons
			INNER JOIN est_contiggroup ON est_contiggroup.est_contig_group_id = seq_amplicons.est_contig_group_id
			INNER JOIN est_contiggroup_ec_enzyme ON est_contiggroup_ec_enzyme.est_contig_group_name = est_contiggroup.est_contig_group_name
			INNER JOIN ec_enzyme ON ec_enzyme.ec_number = est_contiggroup_ec_enzyme.ec_number
			WHERE amplicon_name IN ( $ampliconINString )
		
		) UNION (

			SELECT 
				seq_amplicons.amplicon_name, 
				est_contig.est_contig_name AS contig_name,
				'tmhmmsignalp' AS annot_type, 
				'tmhmmsignalp' AS annot_id, 
				CASE
					WHEN est_contig.tmhmm IS NULL AND  est_contig.signalp IS NULL
					THEN ''
					WHEN est_contig.tmhmm IS NULL AND est_contig.signalp IS NOT NULL
					THEN 'SignalP:&nbsp;(' || est_contig.signalp || ')' 
					WHEN est_contig.tmhmm IS NOT NULL AND est_contig.signalp IS NULL
					THEN 'tmhmm:&nbsp;(' || est_contig.tmhmm || ')'
					ELSE 'tmhmm:&nbsp;(' || est_contig.tmhmm || ') SignalP:&nbsp;(' || est_contig.signalp || ')' 
				END AS annot_term
			FROM seq_amplicons
			INNER JOIN est_contig ON est_contig.est_contig_id = seq_amplicons.est_contig_id
			WHERE amplicon_name IN ( $ampliconINString )

		) UNION (

			SELECT 
				seq_amplicons.amplicon_name, 
				est_contiggroup.est_contig_group_name AS contig_name,
				'tmhmmsignalp' AS annot_type, 
				'tmhmmsignalp' AS annot_id, 
				CASE
					WHEN est_contiggroup.tmhmm IS NULL AND  est_contiggroup.signalp IS NULL
					THEN ''
					WHEN est_contiggroup.tmhmm IS NULL AND est_contiggroup.signalp IS NOT NULL
					THEN 'SignalP:&nbsp;(' || est_contiggroup.signalp || ')' 
					WHEN est_contiggroup.tmhmm IS NOT NULL AND est_contiggroup.signalp IS NULL
					THEN 'tmhmm:&nbsp;(' || est_contiggroup.tmhmm || ')'
					ELSE 'tmhmm:&nbsp;(' || est_contiggroup.tmhmm || ') SignalP:&nbsp;(' || est_contiggroup.signalp || ')' 
				END AS annot_term
			FROM seq_amplicons
			INNER JOIN est_contiggroup ON est_contiggroup.est_contig_group_id = seq_amplicons.est_contig_group_id
			WHERE amplicon_name IN ( $ampliconINString )

		) UNION (

			SELECT seq_amplicons.amplicon_name, est_contig.est_contig_name AS contig_name,
				'interpro' AS annot_type, est_contig_interpro.interpro_id AS annot_id, est_contig_interpro.name AS annot_term
			FROM seq_amplicons
			INNER JOIN est_contig ON est_contig.est_contig_id = seq_amplicons.est_contig_id
			INNER JOIN est_contig_interpro ON est_contig_interpro.est_contig_name = est_contig.est_contig_name
			WHERE amplicon_name IN ( $ampliconINString )
			
		) UNION (

			SELECT seq_amplicons.amplicon_name, est_contiggroup.est_contig_group_name AS contig_name,
				'interpro' AS annot_type, est_interpro.interpro_id AS annot_id, est_interpro.name AS annot_term
			FROM seq_amplicons
			INNER JOIN est_contiggroup ON est_contiggroup.est_contig_group_id = seq_amplicons.est_contig_group_id
			INNER JOIN est_interpro ON est_interpro.est_contig_group_name = est_contiggroup.est_contig_group_name
			WHERE amplicon_name IN ( $ampliconINString )
			
		) UNION (

			SELECT seq_amplicons.amplicon_name, est_contig.est_contig_name AS contig_name,
				'pfam' AS annot_type, est_contig_pfam.pfam_id AS annot_id, pfam.pfam_def AS annot_term
			FROM seq_amplicons
			INNER JOIN est_contig ON est_contig.est_contig_id = seq_amplicons.est_contig_id
			INNER JOIN est_contig_pfam ON est_contig_pfam.est_contig_name = est_contig.est_contig_name
			INNER JOIN pfam ON pfam.pfam_id = est_contig_pfam.pfam_id
			WHERE amplicon_name IN ( $ampliconINString )

		) UNION (

			SELECT seq_amplicons.amplicon_name, est_contiggroup.est_contig_group_name AS contig_name,
				'pfam' AS annot_type, est_contiggroup_pfam.pfam_id AS annot_id, pfam.pfam_def AS annot_term
			FROM seq_amplicons
			INNER JOIN est_contiggroup ON est_contiggroup.est_contig_group_id = seq_amplicons.est_contig_group_id
			INNER JOIN est_contiggroup_pfam ON est_contiggroup_pfam.est_contig_group_name = est_contiggroup.est_contig_group_name
			INNER JOIN pfam ON pfam.pfam_id = est_contiggroup_pfam.pfam_id
			WHERE amplicon_name IN ( $ampliconINString )

		) UNION (

			SELECT 
				seq_amplicons.amplicon_name, 
				est_contig.est_contig_name AS contig_name,
				'blast-species' AS annot_type, 
				est_contig_blast.genbank_acc AS annot_id, 
				CASE
					WHEN est_contig_blast.seq_description='---NA---'
					THEN ''
					WHEN est_contig_blast.seq_description IS NULL
					THEN ''
					WHEN est_contig_blast.eval IS NULL AND  (est_contig_blast.species_name IS NULL OR est_contig_blast.species_name = '')
					THEN est_contig_blast.seq_description
					WHEN est_contig_blast.eval IS NULL AND est_contig_blast.species_name IS NOT NULL
					THEN est_contig_blast.seq_description || ' (' || est_contig_blast.species_name || ')' 
					WHEN est_contig_blast.eval IS NOT NULL AND  (est_contig_blast.species_name IS NULL OR est_contig_blast.species_name = '')
					THEN est_contig_blast.seq_description || ' (' || est_contig_blast.eval || ')'
					ELSE est_contig_blast.seq_description || ' (' || est_contig_blast.eval || ') (' || est_contig_blast.species_name || ')' 
				END AS annot_term	FROM seq_amplicons
			INNER JOIN est_contig ON est_contig.est_contig_id = seq_amplicons.est_contig_id
			INNER JOIN est_contig_blast ON est_contig_blast.est_contig_name = est_contig.est_contig_name
			WHERE amplicon_name IN ( $ampliconINString )

		) UNION (

			SELECT 
				seq_amplicons.amplicon_name, 
				est_contiggroup.est_contig_group_name AS contig_name,
				'blast-species' AS annot_type, 
				est_contiggroup_blast.genbank_acc AS annot_id, 
				CASE
					WHEN est_contiggroup_blast.seq_description='---NA---'
					THEN ''
					WHEN est_contiggroup_blast.seq_description IS NULL
					THEN ''
					WHEN est_contiggroup_blast.eval IS NULL AND  (est_contiggroup_blast.species_name IS NULL OR est_contiggroup_blast.species_name = '')
					THEN est_contiggroup_blast.seq_description
					WHEN est_contiggroup_blast.eval IS NULL AND est_contiggroup_blast.species_name IS NOT NULL
					THEN est_contiggroup_blast.seq_description || ' (' || est_contiggroup_blast.species_name || ')' 
					WHEN est_contiggroup_blast.eval IS NOT NULL AND  (est_contiggroup_blast.species_name IS NULL OR est_contiggroup_blast.species_name = '')
					THEN est_contiggroup_blast.seq_description || ' (' || est_contiggroup_blast.eval || ')'
					ELSE est_contiggroup_blast.seq_description || ' (' || est_contiggroup_blast.eval || ') (' || est_contiggroup_blast.species_name || ')' 
				END AS annot_term
			FROM seq_amplicons
			INNER JOIN est_contiggroup ON est_contiggroup.est_contig_group_id = seq_amplicons.est_contig_group_id
			INNER JOIN est_contiggroup_blast ON est_contiggroup_blast.est_contig_group_name = est_contiggroup.est_contig_group_name
			WHERE amplicon_name IN ( $ampliconINString )

		) UNION (

			SELECT 
				seq_amplicons.amplicon_name, 
				est_contig.est_contig_name AS contig_name,
				'blast-nr' AS annot_type, 
				est_contig.genbank_acc AS annot_id, 
				CASE
					WHEN est_contig.seq_description='---NA---'
					THEN ''
					WHEN est_contig.seq_description IS NULL
					THEN ''
					WHEN est_contig.eval IS NULL AND  (est_contig.species_name IS NULL OR est_contig.species_name = '')
					THEN est_contig.seq_description
					WHEN est_contig.eval IS NULL AND est_contig.species_name IS NOT NULL
					THEN est_contig.seq_description || ' (' || est_contig.species_name || ')' 
					WHEN est_contig.eval IS NOT NULL AND  (est_contig.species_name IS NULL OR est_contig.species_name = '')
					THEN est_contig.seq_description || ' (' || est_contig.eval || ')'
					ELSE est_contig.seq_description || ' (' || est_contig.eval || ') (' || est_contig.species_name || ')' 
				END AS annot_term
			FROM seq_amplicons
			INNER JOIN est_contig ON est_contig.est_contig_id = seq_amplicons.est_contig_id
			WHERE amplicon_name IN ( $ampliconINString )

		) UNION (

			SELECT 
				seq_amplicons.amplicon_name, 
				est_contiggroup.est_contig_group_name AS contig_name,
				'blast-nr' AS annot_type, 
				est_contiggroup.genbank_acc AS annot_id, 
				CASE
					WHEN est_contiggroup.seq_description='---NA---'
					THEN ''
					WHEN est_contiggroup.seq_description IS NULL
					THEN ''
					WHEN est_contiggroup.eval IS NULL AND  (est_contiggroup.species_name IS NULL OR est_contiggroup.species_name = '')
					THEN est_contiggroup.seq_description
					WHEN est_contiggroup.eval IS NULL AND est_contiggroup.species_name IS NOT NULL
					THEN est_contiggroup.seq_description || ' (' || est_contiggroup.species_name || ')' 
					WHEN est_contiggroup.eval IS NOT NULL AND  (est_contiggroup.species_name IS NULL OR est_contiggroup.species_name = '')
					THEN est_contiggroup.seq_description || ' (' || est_contiggroup.eval || ')'
					ELSE est_contiggroup.seq_description || ' (' || est_contiggroup.eval || ') (' || est_contiggroup.species_name || ')' 
				END AS annot_term
			FROM seq_amplicons
			INNER JOIN est_contiggroup ON est_contiggroup.est_contig_group_id = seq_amplicons.est_contig_group_id
			WHERE amplicon_name IN ( $ampliconINString )
			
		) ) AS tmp
		WHERE annot_id <> '' AND annot_term <> ''
		ORDER BY amplicon_name, annot_type";
}

function generateJsonAmpliconById($array) {
        $jsonRRG = '{
		 
		        "api" : "/makeRRG",

		        "prefix" : {
		                "treeGenes" : "http://sswapmeet.sswap.info/treeGenes/",
		                "requests" : "http://sswapmeet.sswap.info/treeGenes/requests/"
		        },

		        "http://sswap.dendrome.ucdavis.edu/resources/ampliconService/AmpliconService" : {},';


		        $jsonRRG = $jsonRRG.'

		        "mapping" : {
		        ';

		        $size = count($array);
		        //foreach term create a subject node
		        foreach($array as $i => $value) {
		                $subNum = $i + 1;
		                if($i < $size - 1) {
		                        $jsonRRG = $jsonRRG.'
		                "_:subject'.$subNum.'" : "urn:treeGenes:amplicon:id:'.$value.'",';
		                } else {
		                        $jsonRRG = $jsonRRG.'
		                "_:subject'.$subNum.'" : "urn:treeGenes:amplicon:id:'.$value.'"';
		                }
		        }

		        $jsonRRG = $jsonRRG.'

		        },

		        "definitions" : {
		        ';

		        foreach($array as $i => $value) {
		                $subNum = $i + 1;
		                if($i < $size) {
		                        $jsonRRG = $jsonRRG.'
		                "_:subject'.$subNum.'" : { "treeGenes:amplicon/id" : "'.$value.'" },';
		                }
		        }

		        $jsonRRG = $jsonRRG.'
		        ';
		        foreach($array as $i => $value) {
		                if($i < $size - 1) {
		                        $jsonRRG = $jsonRRG.'
		                "urn:treeGenes:amplicon:id:'.$value.'" : {
		                        "rdf:type" : "treeGenes:amplicon/Amplicon",
		                        "treeGenes:amplicon/id" : "'.$value.'"
		                },';
		                } else {
		                        $jsonRRG = $jsonRRG.'
		                "urn:treeGenes:amplicon:id:'.$value.'" : {
		                        "rdf:type" : "treeGenes:amplicon/Amplicon",
		                        "treeGenes:amplicon/id" : "'.$value.'"
		                }';
		                }
		        }

		        $jsonRRG = $jsonRRG.'

		        }
		}';
	return $jsonRRG;
}
/*** End Functions ***/

/*** Start AJAX Calls ***/
$tidarray = GETlist("tid");
$checkedAmplicons = GETList("checkedAmplicons");


if (isset($_GET['csv'])) {
	header('Content-Type: text/plain');
	// Prepare for download.
	header("Cache-control: private");
	header("Cache-Control: must-revalidate, post-check=0, pre-check=0");
	header("Content-Description: File Transfer");
	//header("Content-Type: application/octet-stream");
	header("Content-Type: text/csv; charset=ansi");
	header("Content-disposition: attachment; filename=\"amplicon_spreadsheet.csv\"");
	header("Expires: 0");

	$ampliconINString = "";
	foreach($checkedAmplicons as $ampliconId) {
		$ampliconINString = $ampliconINString . "'" . $ampliconId . "',";
	}
	$ampliconINString = substr($ampliconINString, 0, -1);
	$query = genQuery($ampliconINString);
	$res2 = DBQuery($query);
	$countRes2 = pg_num_rows($res2);

	if($countRes2 > 0) {
		$prevAmplicon = "";
		$ampliconId = "";
		$output = "";
		$seq_description = "";
		$thmmTerm = "";
		$species_description = array();
		$goTerm = array();
		$goAcc = array();
		$interproTerm = array();
		$interproId = array();
		$pfamTerm = array();
		$pfamId = array();
		$ecTerm = array();
		$ecId = array();
		$iterator = 0;
		$count = 0;
		$actualCount = $countRes2 -1;
		$finalOutput = "";
		while($goRes = pg_fetch_assoc($res2)) {
			$ampliconId = $goRes['amplicon_name'];
			$annot_type = $goRes['annot_type'];
			
			#check to see if prev = to current
			if($prevAmplicon == $ampliconId) {
				if($annot_type == 'blast-nr') {
					$seq_description = $goRes['annot_term'];
				} elseif ($annot_type == 'blast-species') {
					$species_description[] = $goRes['annot_term'];
					//echo "amplicon $ampliconId ".$goRes['annot_term']."<br>";
				} elseif ($annot_type == 'go') {
					$goTerm[] = $goRes['annot_term'];
					$goAcc[] = $goRes['annot_id'];
				} elseif ($annot_type == 'interpro') {
					$interproTerm[] = $goRes['annot_term'];
					$interproId[] = $goRes['annot_id'];
				} elseif ($annot_type == 'pfam') {
					$pfamTerm[] = $goRes['annot_term'];
					$pfamId[] = $goRes['annot_id'];
				} elseif ($annot_type == 'ec') {
					$ecTerm[] = $goRes['annot_term'];
					$ecId[] = $goRes['annot_id'];
				} elseif ($annot_type == 'tmhmmsignalp') {
					$thmmTerm = $goRes['annot_term'];
					//echo "Amplicon $ampliconId $thmmTerm<br>\n";
				}

			} else {
				## != check fixes table formatting
				if($iterator != 0) {
					#starts building the output line
					$output = "\"". $prevAmplicon . "\",\"" . $seq_description. "\",\"";

					## For Species Specific blast Results
					$i = 0;
					foreach($species_description as $value) {
						if($i == 0) {
							$output = $output . "$value";
						} else {
							$output = $output . " | $value";
						}
						$i++;
					}
					$output = $output . "\",\"";
						
					## For GO 
					$i = 0;
					foreach($goTerm as $value) {
						if($i == 0) {
							$output = $output . "$goAcc[$i] $value";
						} else {
							$output = $output . " | $goAcc[$i] $value";
						}
						$i++;
					}
					$output = $output . "\",\"";

					## For Interpro 
					$i = 0;
					foreach($interproTerm as $value) {
						if($i == 0) {
							$output = $output . "$interproId[$i] $value";
						} else {
							$output = $output . " | $interproId[$i] $value";
						}
						$i++;
					}
					$output = $output . "\",\"";

					## For pfam 
					$i = 0;
					foreach($pfamTerm as $value) {
						if($i == 0) {
							$output = $output . "$pfamId[$i] $value";
						} else {
							$output = $output . " | $pfamId[$i] $value";
						}
						$i++;
					}
					$output = $output . "\",\"";

					## For ec
					$i = 0;
					foreach($ecTerm as $value) {
						if($i == 0) {
							$output = $output . "$ecId[$i] $value";
						} else {
							$output = $output . " | $ecId[$i] $value";
						}
						$i++;
					}
					$output = $output . "\",";

					## For THMM & SIGNALP
					if($thmmTerm != "") {
						$newthmmTerm = str_replace("&nbsp;", "", $thmmTerm);
						$output = $output . "\"$newthmmTerm\"";
					} else {
						$output = $output . "\"\"";
					}
				}
				# prints output and clears memory on variables
				$finalOutput = $finalOutput . $output."\n";

				$iterator++;
				$species_description = array();
				$goTerm = array();
				$goAcc = array();
				$interproId = array();
				$interproTerm = array();
				$pfamId = array();
				$pfamTerm = array();
				$ecId = array();
				$ecTerm = array();
				$thmmTerm = "";
				$seq_description = "";
			}
			
			## EdgeCase - Fills in data for last row
			if($actualCount == $count) {
				if($prevAmplicon != $ampliconId) {
					$species_description = array();
					$goTerm = array();
					$goAcc = array();
					$interproId = array();
					$interproTerm = array();
					$pfamId = array();
					$pfamTerm = array();
					$ecId = array();
					$ecTerm = array();
					$thmmTerm = "";
					$seq_description = "";
				}
				#$ampliconId = "";
				if($annot_type == 'blast-nr') {
					$seq_description = $goRes['annot_term'];
				} elseif ($annot_type == 'blast-species') {
					$species_description[] = $goRes['annot_term'];
					//echo "amplicon $ampliconId ".$goRes['annot_term']."<br>";
				} elseif ($annot_type == 'go') {
					$goTerm[] = $goRes['annot_term'];
					$goAcc[] = $goRes['annot_id'];
				} elseif ($annot_type == 'interpro') {
					$interproTerm[] = $goRes['annot_term'];
					$interproId[] = $goRes['annot_id'];
				} elseif ($annot_type == 'pfam') {
					$pfamTerm[] = $goRes['annot_term'];
					$pfamId[] = $goRes['annot_id'];
				} elseif ($annot_type == 'ec') {
					$ecTerm[] = $goRes['annot_term'];
					$ecId[] = $goRes['annot_id'];
				} elseif ($annot_type == 'tmhmmsignalp') {
					$thmmTerm = $goRes['annot_term'];
					//echo "Amplicon $ampliconId $thmmTerm<br>\n";
				}


				if($iterator != 0) {
					#starts building the output line
					$output = "\"". $ampliconId . "\",\"" . $seq_description. "\",\"";

					## For Species Specific blast Results
					$i = 0;
					foreach($species_description as $value) {
						if($i == 0) {
							$output = $output . "$value";
						} else {
							$output = $output . " | $value";
						}
						$i++;
					}
					$output = $output . "\",\"";
						
					## For GO 
					$i = 0;
					foreach($goTerm as $value) {
						if($i == 0) {
							$output = $output . "$goAcc[$i] $value";
						} else {
							$output = $output . " | $goAcc[$i] $value";
						}
						$i++;
					}
					$output = $output . "\",\"";

					## For Interpro 
					$i = 0;
					foreach($interproTerm as $value) {
						if($i == 0) {
							$output = $output . "$interproId[$i] $value";
						} else {
							$output = $output . " | $interproId[$i] $value";
						}
						$i++;
					}
					$output = $output . "\",\"";

					## For pfam 
					$i = 0;
					foreach($pfamTerm as $value) {
						if($i == 0) {
							$output = $output . "$pfamId[$i] $value";
						} else {
							$output = $output . " | $pfamId[$i] $value";
						}
						$i++;
					}
					$output = $output . "\",\"";

					## For ec
					$i = 0;
					foreach($ecTerm as $value) {
						if($i == 0) {
							$output = $output . "$ecId[$i] $value";
						} else {
							$output = $output . " | $ecId[$i] $value";
						}
						$i++;
					}
					$output = $output . "\",";

					## For THMM & SIGNALP
					if($thmmTerm != "") {
						$newthmmTerm = str_replace("&nbsp;", "", $thmmTerm);
						$output = $output . "\"$newthmmTerm\"";
					} else {
						$output = $output . "\"\"";
					}
				}
				# prints output and clears memory on variables
				$finalOutput = $finalOutput . $output."\n";
			}

			if($prevAmplicon != $ampliconId) {
				
				if($annot_type == 'blast-nr') {
					$seq_description = $goRes['annot_term'];
				} elseif ($annot_type == 'blast-species') {
					$species_description[] = $goRes['annot_term'];
					//echo "amplicon $ampliconId ".$goRes['annot_term']."<br>";
				} elseif ($annot_type == 'go') {
					$goTerm[] = $goRes['annot_term'];
					$goAcc[] = $goRes['annot_id'];
				} elseif ($annot_type == 'interpro') {
					$interproTerm[] = $goRes['annot_term'];
					$interproId[] = $goRes['annot_id'];
				} elseif ($annot_type == 'pfam') {
					$pfamTerm[] = $goRes['annot_term'];
					$pfamId[] = $goRes['annot_id'];
				} elseif ($annot_type == 'ec') {
					$ecTerm[] = $goRes['annot_term'];
					$ecId[] = $goRes['annot_id'];
				} elseif ($annot_type == 'tmhmmsignalp') {
					$thmmTerm = $goRes['annot_term'];
					//echo "Amplicon $ampliconId $thmmTerm<br>\n";
				}
			}
			$prevAmplicon = $ampliconId;
			$count++;
		}
		$iterator = $iterator - 1;
		$finalOutput = "\"Amplicon Id\",\"Top Blast Description (BLAST nr)\",\"Species-Specific BLASTs\",\"GO Annotations\",\"Interpro Annotations\",\"PFAM Annotations\",\"ExPASY EC Annotations\",\"thmm / SignalP\"".$finalOutput;
		echo $finalOutput;
		exit;
	}
}
else if(count($tidarray) > 1) { //for the grid

	$qCommonAmp = "SELECT * FROM sswap_get_common_amplicons_per_sample(ARRAY['".implode("','",$tidarray)."'])";
	$resCommonAmp = DBQuery($qCommonAmp);
	$countCommonAmp = pg_num_rows($resCommonAmp);
	$ampliconINString = "";
	if($countCommonAmp != 0) {
		while($idRes = pg_fetch_assoc($resCommonAmp)) {
			$ampliconINString .= "'" . $idRes['amplicon_name'] . "',";
		}
		$ampliconINString = substr($ampliconINString, 0, -1);
		$query = genQuery($ampliconINString);
		$resCommonAnnot = DBQuery($query);
		$countCommonAnnot = pg_num_rows($resCommonAnnot);


		if($countCommonAnnot > 0) {
			$allAmpId = array();
			$output = array();
			while($annotRes = pg_fetch_assoc($resCommonAnnot)){
				$ampliconId = $annotRes['amplicon_name'];
				$annot_type = $annotRes['annot_type'];
				$annot_id = $annotRes['annot_id'];
				$annot_term = $annotRes['annot_term'];
				
				//hash loads
				if(!in_array($ampliconId,$allAmpId)){
					$allAmpId[] = $ampliconId;
					$output[$ampliconId] = array();
				}
				
				if(array_key_exists($annot_type,$output[$ampliconId])){
					if($annot_type == 'blast-nr' || $annot_type =='tmhmmsignalp' || $annot_type == 'blast-species'){
						$output[$ampliconId][$annot_type] .= "$annot_term";
					}
					else{
						$output[$ampliconId][$annot_type] .= "$annot_id $annot_term";
					}
				}
				else{
					if($annot_type == 'blast-nr' || $annot_type =='tmhmmsignalp' || $annot_type == 'blast-species'){
						$output[$ampliconId][$annot_type] = $annot_term;
					}
					else{
						$output[$ampliconId][$annot_type] = $annot_id.' '.$annot_term;
					}
				}
			}//organize data into respective fields
			// echo var_dump($output);
			$col_type = array('blast-nr','blast-species','go','interpro','pfam','ec','tmhmmsignalp');
			// $iterator = 1;
			// // $prev_sel_amp = isset($_SESSION['checkedAmplicons']) ? $_SESSION['checkedAmplicons']: array();
			// $json = array();

			$all_amps_json = array();
			$i = 1;
			foreach($output as $ampID => $data){
				$json = array("id"=>$i,"amplicon_id"=>$ampID);
				foreach($col_type as $type){
					if(array_key_exists($type,$data)){
						$json[$type] = $data[$type];
					}
					else{
						$json[$type] = "";
					}
				}
				$all_amps_json[] = $json;
				$i++;
			}
			echo json_encode($all_amps_json);
			exit;
		}
	}
}

else if(isset($_GET['jsonRRG'])){ //return RRG for sswap
	echo generateJsonAmpliconById($checkedAmplicons);
	exit;
}

/*** End AJAX Calls ***/
?>
