<?php
	$prefix = "https://www.googleapis.com/fusiontables/v1/query?sql="; 
	$key = "&key=AIzaSyBS-W0iAfwohml4fqqG-qOVtkSzQtv6Ic0";
	if (isset($_GET['tgdr_query']) && isset($_GET['sts_is_query']) && isset($_GET['try_db_query'])){ //&& isset($_GET['ameriflux_query'])) {
		$tgdr_query = $_GET['tgdr_query'];
		$sts_is_query = $_GET['sts_is_query'];
		$try_db_query = $_GET['try_db_query'];
	//	$ameriflux_query = $_GET['ameriflux_query'];
	}
	else{ // to test from command line and get all ids for autocomplete 
		$sts_is_query = "SELECT%20tree_id%20FROM%201bL0GwAL_mlUutv9TVFqknjKLkwzq4sAn5mHiiaI";
        	$tgdr_query = "SELECT%20tree_id%20FROM%20118Vk00La9Ap3wSg8z8LnZQG0mYz5iZ67o3uqa8M";
          	$try_db_query = "SELECT%20tree_id%20FROM%201XwP3nc6H5_AUjdCjpXtrIlrSmtOHXr0Q9p_vrPw";
        //  	$ameriflux_query = "SELECT%20icon_name,site_id,lat,lng,num_sequences,num_genotypes,num_phenotypes,species%20FROM%201XwP3nc6H5_AUjdCjpXtrIlrSmtOHXr0Q9p_vrPw%20WHERE%20ST_INTERSECTS('lat'%2C%20RECTANGLE(LATLNG(47.628873510464814%2C%20-122.87109375)%2CLATLNG(49.31843827419398%2C%20-120.76171875)))";
	}
		
	function extractJSON($response){
		if(isset($response->rows)){
			return $response->rows;
		}
		else{
			return array();
		}
	}
		
	$tgdr_json_url = $prefix.$tgdr_query.$key;
	$sts_is_json_url = $prefix.$sts_is_query.$key;
	$try_db_json_url = $prefix.$try_db_query.$key;
    	$tgdr_json = extractJSON(json_decode(file_get_contents($tgdr_json_url)));
	$sts_is_json = extractJSON(json_decode(file_get_contents($sts_is_json_url)));
	$try_db_json = extractJSON(json_decode(file_get_contents($try_db_json_url)));
	
	$json = json_encode(array_merge(array_merge($tgdr_json,$sts_is_json),$try_db_json));// needed to call ->rows to pull array out of php's stdClass
	//$json = json_encode($tgdr_json+$sts_is_json+$try_db_json);// needed to call ->rows to pull array out of php's stdClass
	//debug
//	var_dump($json);
	echo $json;
	









 // ray casting alogrithm http://rosettacode.org/wiki/Ray-casting_algorithm
 // could implement for polygon selection, need to convert to php
/* google.maps.Polygon.prototype.Contains = function(point) {
        var crossings = 0,
            path = this.getPath();

        // for each edge
        for (var i=0; i < path.getLength(); i++) {
            var a = path.getAt(i),
                j = i + 1;
            if (j >= path.getLength()) {
                j = 0;
            }
            var b = path.getAt(j);
            if (rayCrossesSegment(point, a, b)) {
                crossings++;
            }
        }

        // odd number of crossings?
        return (crossings % 2 == 1);

        function rayCrossesSegment(point, a, b) {
            var px = point.lng(),
                py = point.lat(),
                ax = a.lng(),
                ay = a.lat(),
                bx = b.lng(),
                by = b.lat();
            if (ay > by) {
                ax = b.lng();
                ay = b.lat();
                bx = a.lng();
                by = a.lat();
            }
            // alter longitude to cater for 180 degree crossings
            if (px < 0) { px += 360 };
            if (ax < 0) { ax += 360 };
            if (bx < 0) { bx += 360 };

            if (py == ay || py == by) py += 0.00000001;
            if ((py > by || py < ay) || (px > Math.max(ax, bx))) return false;
            if (px < Math.min(ax, bx)) return true;

            var red = (ax != bx) ? ((by - ay) / (bx - ax)) : Infinity;
            var blue = (ax != px) ? ((py - ay) / (px - ax)) : Infinity;
            return (blue >= red);

        }

     };
*/
?>

