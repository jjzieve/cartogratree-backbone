/**
 * Copyright (c) 2010, iPlant Collaborative, University of Arizona, Cold Spring Harbor Laboratories, University of Texas at Austin
 * This software is licensed under the CC-GNU GPL version 2.0 or later.
 * License: http://creativecommons.org/licenses/GPL/2.0/
 */
var SSWAP = function() {
	var pipelineUI = "http://sswap.iplantcollaborative.org/ipc/create-pipeline-with-rrg";

	function discover(jsonRRG, containerId, params) {
		$(document).ready(function() {
				var jsonString = null;
				var jsonFunction = null;

				if (typeof(jsonRRG) == "object") {
					jsonString = JSON.stringify(jsonRRG);
				}
				else if (typeof(jsonRRG) == "function") {
					jsonFunction = jsonRRG;
				}
				else {
					jsonString = jsonRRG;
				}

				var container = $(containerId);
				container.empty();
				var form = $("<form>");
				form.attr('id','sswap_form');
				form.attr("method","post").attr("action",pipelineUI).attr("style", "display: inline").attr("target", "_blank");

				var rrgField = $("<input>");
		
				if (jsonString != null) {
					rrgField.attr("type","hidden").attr("name","rrg").attr("value",jsonString);
				}
				else {
					rrgField.attr("type","hidden").attr("name","rrg");
				}

				if (jsonFunction != null) {
					form.submit(function() {
							var jsonResult = jsonFunction();
							var jsonString = null;

							if (typeof(jsonResult) == "object") {
								jsonString = JSON.stringify(jsonResult);
							}
							else {
								jsonString = jsonResult;
							}

							rrgField.attr("value", jsonString); 
							return true;
					});
				}

				form.append(rrgField);
				container.append(form);
		});
	}

	return {discover : discover};
}();

