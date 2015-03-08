var YqlUrl = "http://query.yahooapis.com/v1/public/yql";
var baseUrl = "select * from json where url=\"http://realtimemap.grt.ca/Stop/GetStopInfo?stopId=";
var routeUrl = "&routeId=";
var spinnerHtml = "<i class=\"fa fa-refresh fa-spin fa-2x\"></i>";

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
    customInfo();

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
		
        sendJSONtoDiv(1893, 200, "victoria200conestoga");
        sendJSONtoDiv(3620, 202, "laurier202conestoga");
    }
}

function customInfo() {
    var stopId = $("#inputStopId").val();
    var routeId = $("#inputRouteId").val();

    $('#customBusTitle').hide();
    $('#customBusTitle').html("<h4>Route " + routeId + "</h4><h5>Stop #" + stopId + "</h5>");
    $('#customBusTitle').show();

    $('#customBusInfo').hide();
    $('#customBusInfo').html(spinnerHtml);
    $('#customBusInfo').show();

	var stopName = "";
	
	$.getJSON("stops.json", function (data) {
		stopName = data[(stopId-1000)];
	});
	
	$.getJSON(YqlUrl,
        {
            q: baseUrl + stopId + routeUrl + routeId + "\"",
            format: "json"
        },
    function (data) {
        var customBusTitle = "<h4>" + data.query.results.json.stopTimes[0].HeadSign + "</h4>";
        customBusTitle += "<h5>" + stopName + " - Stop #" + stopId + "</h5>";

        $('#customBusTitle').hide();
        $('#customBusTitle').html(customBusTitle);
        $('#customBusTitle').show();

        setDivs(data.query.results.json.stopTimes, "customBusInfo");
    });

    localStorage.setItem("savedStopId", stopId);
    localStorage.setItem("savedRouteId", routeId);
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
    var outputString = "<table class=\"table table-condensed\"><th>ETA</th><th>Time</th>";
 
    for (var i in data) {
        var d = new Date();
        d.setMinutes(d.getMinutes() + data[i].Minutes);
 
        var hourStr = d.getHours();
        var amPm = hourStr < 12 ? "AM" : "PM";
        var minuteStr = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
 
        hourStr = hourStr > 12 ? hourStr-12 : hourStr;
		hourStr = hourStr == 0 ? 12 : hourStr;
		
        outputString += "<tr><td>";
        outputString += data[i].Minutes + "m </td><td> " + hourStr + ":" + minuteStr + " " + amPm + "</td></tr>";
        outputString += "</li>";
    }
 
    outputString += "</table>";
 
    $("#" + divID).hide();
    $("#" + divID).html(outputString);
    $("#" + divID).show();
}
