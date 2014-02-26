<?php

function DbQuery($sql, $Debug=false) {
	// get the connection string from someone from treegenes
	$rs = pg_query($conn, $sql);
	pg_close($conn);
	
	// Exit on error, otherwise return result.
	if ($rs === false) {
		if ($Debug) {
			exit("$sql\n" . pg_last_error());
		}
		else {  
			exit(pg_last_error());
		}
	}
	else {  
		return $rs;
	}
}

function isDMS($coord)
{
        if (sizeof(explode(' ',$coord)) > 1){
                return true;
        }
        else{
                return false;
        }
}

function convertDMStoDeg($coord){
        $num_matches = preg_match_all("/\d+(\.\d+)?/",$coord,$coord_groups);
        $num_matches2 = preg_match_all("/[NWSE]/",$coord,$orientation);
        $deg = $coord_groups[0][0];
        $min = $coord_groups[0][1];
        $sec = $coord_groups[0][2];
        $sign = 1;
        if ($orientation[0][0] === "S" || $orientation[0][0] === "W"){
                $sign = -1;
        }
        return ($deg+($min/60)+($sec/3600));
        
}



function parseToXML($htmlStr) 
{ 
	$xmlStr=str_replace('<','&lt;',$htmlStr); 
	$xmlStr=str_replace('>','&gt;',$xmlStr); 
	$xmlStr=str_replace('"','&quot;',$xmlStr); 
	$xmlStr=str_replace("'",'&#39;',$xmlStr); 
	$xmlStr=str_replace("&",'&amp;',$xmlStr); 
	return $xmlStr; 
}

?>
