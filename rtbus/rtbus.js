var YqlUrl = "http://query.yahooapis.com/v1/public/yql";
var baseUrl = "select * from json where url=\"http://realtimemap.grt.ca/Stop/GetStopInfo?stopId=";
var routeUrl = "&routeId=";
var spinnerHtml = "<p style=\"text-align:center; padding:20px\"><i class=\"fa fa-refresh fa-spin fa-2x\"></i></p>";
var showOnlyNextBus = false;

function main() {
    $('#disp1').hide();
    $('#disp2').hide();
    $('#disp3').hide();
    $('#disp4').hide();

    $('#conestoga202boardwalk').hide();
    $('#laurier200ainsle').hide();
    $('#victoria200conestoga').hide();
    $('#laurier202conestoga').hide();

    $('#inputStopId').val(localStorage.getItem("savedStopId"));
    $('#inputRouteId').val(localStorage.getItem("savedRouteId"));
    if ($('#inputStopId').val() != "") customInfo();

    var d = new Date();

    if (d.getHours() < 12) {
        $('#disp1').show();
        $('#disp2').show();
        $('#conestoga202boardwalk').show();
		$('#laurier200ainsle').show();
		
        sendJSONtoDiv(2832, 202, "conestoga202boardwalk");
        sendJSONtoDiv(3620, 200, "laurier200ainsle");
    }

    else {
        $('#disp3').show();
        $('#disp4').show();
        $('#victoria200conestoga').show();
		$('#laurier202conestoga').show();
		
		sendJSONtoDiv(2550, 7, "victoria200conestoga");
        sendJSONtoDiv(3620, 202, "laurier202conestoga");
    }
}

function customInfo() {
    var stopId = parseInt($("#inputStopId").val());
    var routeId = $("#inputRouteId").val();

    $('#customDisplay').show();
    $('#customBusTitle').hide();

    var customBusTitle = "<h4><i class=\"fa fa-bus\"></i> Route " + routeId + "</h4>";
    customBusTitle += "<h5><i class=\"fa fa-map-marker\"></i> #" + stopId + "</h5>";
    $('#customBusTitle').html(customBusTitle);

    $('#customBusTitle').show();
    $('#customBusInfo').hide();
    $('#customBusInfo').html(spinnerHtml);
    $('#customBusInfo').show();

	var stopName = "";

	if (stopId >= 1000 && stopId <= 3949) {
	    $.getJSON("stops.json", function (data) {
	        stopName = data[(stopId-1000)];
	    });

	    $.getJSON(YqlUrl,
            {
                q: baseUrl + stopId + routeUrl + routeId + "\"",
                format: "json"
            },
        function (data) {
            if (stopName == "") {
                $("#customBusInfo").html("Invalid stop number");
                $("#customBusInfo").show();
            }
        
            else if (data.query.results.json.hasOwnProperty('stopTimes')) {
                var customBusTitle = "<h4><i class=\"fa fa-bus\"></i> " + data.query.results.json.stopTimes[0].HeadSign + "</h4>";
                customBusTitle += "<h5><i class=\"fa fa-map-marker\"></i> " + stopName + " - #" + stopId + "</h5>";

                $('#customBusTitle').hide();
                $('#customBusTitle').html(customBusTitle);
                $('#customBusTitle').show();

                setDivs(data.query.results.json.stopTimes, "customBusInfo");
            }

            else {
                $("#customBusInfo").html("Invalid stop number or bus route");
                $("#customBusInfo").show();
            }
        });
	    
	    localStorage.setItem("savedStopId", stopId);
	    localStorage.setItem("savedRouteId", routeId);
	}
	
	else {
	    $("#customBusInfo").html("Invalid stop number");
	    $("#customBusInfo").show();
	}
}

function sendJSONtoDiv(stopId, routeId, divID) {
    $.getJSON(YqlUrl, 
        {
            q: baseUrl + stopId + routeUrl + routeId + "\"",
            format: "json"
        },
    function (data) {
        setDivs(data.query.results.json.stopTimes, divID);
    });
}

function setDivs(data, divID) {
    if (showOnlyNextBus) {
        var outputString = "<table class=\"table table-condensed\">";

        var d = new Date();
        d.setTime(d.getTime() + (data[0].Minutes * 60 * 1000));

        var hourStr = d.getHours();
        var amPm = hourStr < 12 ? "AM" : "PM";
        var minuteStr = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();

        hourStr = hourStr > 12 ? hourStr - 12 : hourStr;
        hourStr = hourStr == 0 ? 12 : hourStr;

        outputString += "<td style=\"vertical-align:middle\"><p style=\"font-size:40px\">" + data[0].Minutes + "m </p></td>";
        outputString += "<td style=\"vertical-align:middle\"><p style=\"text-align:right\"><b>" + hourStr + ":" + minuteStr + " " + amPm + "</b></p></td></tr>";

        outputString += "</table>";
    }

    else {
        var outputString = "<table class=\"table table-condensed\"><th>ETA</th><th><p style=\"text-align:right\">Time</p></th>";

        for (var i in data) {
            var d = new Date();
            d.setTime(d.getTime() + (data[i].Minutes * 60 * 1000));

            var hourStr = d.getHours();
            var amPm = hourStr < 12 ? "AM" : "PM";
            var minuteStr = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();

            hourStr = hourStr > 12 ? hourStr - 12 : hourStr;
            hourStr = hourStr == 0 ? 12 : hourStr;

            if (i == 0) {
                outputString += "<tr><td style=\"vertical-align:middle\"><p style=\"font-size:40px\">" + data[i].Minutes + "m </p></td>";
                outputString += "<td style=\"vertical-align:middle\"><p style=\"text-align:right\"><b>" + hourStr + ":" + minuteStr + " " + amPm + "</b></p></td></tr></tr>";
            } else {
                outputString += "<tr><td>";
                outputString += data[i].Minutes + "m </td><td style=\"vertical-align:middle\"><p style=\"text-align:right\"><b>" + hourStr + ":" + minuteStr + " " + amPm + "</b></p></td></tr>";
            }
        }

        outputString += "</table>";
    }

    $("#" + divID).hide();
    $("#" + divID).html(outputString);
    $("#" + divID).show();
}
