<?php
##TESTURL
//http://dendrome.ucdavis.edu/_dev/havasquezgross/cartogratree/AjaxRRG.php?tid=NC000895,NC000887&lat=-45.2,2.13&lng=108,22.3
//http://dendrome.ucdavis.edu/_dev/havasquezgross/cartogratree/AssociationRRG.php?tid=GRI0001,GRI0002,GRI0003,GRI0004,GRI0005,GRI0006,GRI0007
// Error handling.
ini_set('error_reporting', E_ALL);
ini_set('display_errors',1);

    /* general settings area */
//    require_once('../functions.php');

header('Content-Type: text/plain');
#include_once("includes/incPGSQL.php");
$db = "treegenes_development";
$namespace = "http://sswapmeet.sswap.info/treeGenes/";
$envirospace = "http://dendrome.ucdavis.edu/_dev/cartogratree/GetWorldClim.php";
#$dbtype = $_GET['dbtype'];
#$searchstring = $_GET['searchstring'];

    if (!isset($_GET['tid']))
    {
    }
    else
    {
        $escapedName = pg_escape_string(trim($_GET['tid']));
        if (isset($_GET['lat'])) {
            $escapedLat = pg_escape_string(trim($_GET['lat']));
        } else {
            $escapedLat = "";
        }
        if (isset($_GET['lng'])) {
            $escapedLng = pg_escape_string(trim($_GET['lng']));
        } else {
            $escapedLng = "";
        }
        $tidarray = explode(',', $escapedName);
        $latarray = explode(',', $escapedLat);
        $lngarray = explode(',', $escapedLng);
        $json = generateJsonTreeById($tidarray, $latarray, $lngarray);
        print $json;
    }


function stripslashes2($string) {
   $string = preg_replace("/\\\\/", "", $string);
   $string = preg_replace("/\\\'/", "'", $string);
//   $string = preg_replace("/\\\'/", "'", $string);
//   $string = preg_replace("/\\\\/", "\\", $string);
   return $string;
}

function generateJsonTreeById($array, $latarray, $lngarray) {

	global $namespace;
	global $envirospace;
    $namestring = implode(",", $array);
    if(count($latarray) != 0) {
        $latstring = implode(",", $latarray);
        $lngstring = implode(",", $lngarray);
        $worldclimUrl = '"http://dendrome.ucdavis.edu/cartogratree/GetWorldClimData.php?lat='.$latstring.'&lon='.$lngstring.'&id='.$namestring.'&csv"';
    }
    $phenoUrl= '"http://dendrome.ucdavis.edu/_dev/havasquezgross/cartogratree/GetPhenoData.php?tid='.$namestring.'"';
    //$genoUrl= '"http://dendrome.ucdavis.edu/_dev/havasquezgross/cartogratree/GetGenoData.php?tid='.$namestring.'&hapmap"';
    $genoUrl= '"http://dendrome.ucdavis.edu/_dev/havasquezgross/cartogratree/GetGenoData.php?tid='.$namestring.'"';
    $popstruUrl = NULL;
    $kinshipUrl = NULL;

	$jsonRRG = '{
 
       "api" : "/makeRRG",

       "prefix" : {
         "data"   : "http://sswapmeet.sswap.info/data/",
         "tassel" : "http://sswapmeet.sswap.info/iplant/tassel/",
         "tassel-args" : "http://sswapmeet.sswap.info/iplant/tassel/args/"
        },


        "http://sswap.info/canonical" : {
';
    if($genoUrl) {

        $jsonRRG = $jsonRRG.'           "tassel-args:h"            : '.$genoUrl.',
';

    }

    if($phenoUrl) {

        $jsonRRG = $jsonRRG.'           "tassel-args:r"            : '.$phenoUrl.'
';

    }


	$jsonRRG = $jsonRRG.'
         },

      "mapping" : { "sswap:Subject" : "_:gwasData" },

      "definitions" : {

        "_:gwasData" : {

          "rdf:type" : "data:DataBundle",

';

    if($genoUrl) {

        $jsonRRG = $jsonRRG.'           "tassel:data/hasGenotype"            : '.$genoUrl.',
';

    }
//    if($worldclimUrl) {
//
//        $jsonRRG = $jsonRRG.'           "tassel:data/hasEnviro"            : '.$worldclimUrl.',
//';
//
//    }
    if($phenoUrl) {

        $jsonRRG = $jsonRRG.'           "tassel:data/hasTraits"             : '.$phenoUrl.'
';

    }
    if($popstruUrl) {

        $jsonRRG = $jsonRRG.'           "tassel:data/hasPopulationStructure"            : '.$popstruUrl.',
';

    }
    if($kinshipUrl) {

        $jsonRRG = $jsonRRG.'           "tassel:data/hasKinship"            : '.$kinshipUrl.',
';

    }

        $jsonRRG = $jsonRRG.'
         }

      }
}';

//$old='
//        "prefix" : {
//                "treeGenes" : "'.$namespace.'",
//                "requests" : "'.$namespace.'requests/"
//        },
//
//    "http://dendrome.ucdavis.edu/cartogratree/GetWorldClimData.php?lat='.$latstring.'&lon='.$lngstring.'&id='.$namestring.'&csv"
//    "http://dendrome.ucdavis.edu/cartogratree/GetPhenoData.php?id='.$namestring.'&csv"
//    "http://dendrome.ucdavis.edu/_dev/havasquezgross/cartogratree/GetGenoData.php?tid='.$namestring.'&hapmap"
//	"http://sswap.dendrome.ucdavis.edu/resources/associationStudies/assocationStudiesService" : {},';
//	
//
//	$jsonRRG = $jsonRRG.'
//
//	"mapping" : {
//	';
//
//	$size = count($array);
//	//foreach term create a subject node
//	foreach($array as $i => $value) {
//		$subNum = $i + 1;
//		if($i < $size - 1) {
//			$jsonRRG = $jsonRRG.'
//		"_:subject'.$subNum.'" : "urn:treeGenes:treesample:id:'.$value.'",';
//		} else {
//			$jsonRRG = $jsonRRG.'
//		"_:subject'.$subNum.'" : "urn:treeGenes:treesample:id:'.$value.'"';
//		}
//	}
//
//	$jsonRRG = $jsonRRG.'
//
//	},
//
//	"definitions" : {
//	';
//
//	foreach($array as $i => $value) {
//		$subNum = $i + 1;
//		if($i < $size) {
//			$jsonRRG = $jsonRRG.'
//		"_:subject'.$subNum.'" : { "treeGenes:treesample/id" : "'.$value.'" },';
//		}
//	}
//
//	$jsonRRG = $jsonRRG.'
//	';
//        foreach($array as $i => $value) {
//                if($i < $size - 1) {
//                        $jsonRRG = $jsonRRG.'
//                "urn:treeGenes:treesample:id:'.$value.'" : {
//                        "rdf:type" : "treeGenes:treesample/TreeSample",
//                        "treeGenes:treesample/id" : "'.$value.'",
//                        "treeGenes:treesample/lat" : "'.$latarray[$i].'",
//                        "treeGenes:treesample/lng" : "'.$lngarray[$i].'"
//                },';
//                } else {
//                        $jsonRRG = $jsonRRG.'
//                "urn:treeGenes:treesample:id:'.$value.'" : {
//                        "rdf:type" : "treeGenes:treesample/TreeSample",
//                        "treeGenes:treesample/id" : "'.$value.'"
//                        "treeGenes:treesample/lat" : "'.$latarray[$i].'",
//                        "treeGenes:treesample/lng" : "'.$lngarray[$i].'"
//                }';
//                }
//        }   
//	
//	$jsonRRG = $jsonRRG.'
//
//	}
//}';

	return $jsonRRG;
}

?>
