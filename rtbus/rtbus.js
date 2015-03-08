var baseUrl = "https://jsonp.nodejitsu.com/?callback=&url=http%3A%2F%2Frealtimemap.grt.ca%2FStop%2FGetStopInfo%3FstopId%3D";
var routeUrl = "%26routeId%3D";
var spinnerHtml = "<i class=\"fa fa-refresh fa-spin fa-2x\"></i>";

function main() {
    $('#disp1').slideUp();
    $('#disp2').slideUp();
    $('#disp3').slideUp();
    $('#disp4').slideUp();

    $('#conestoga202boardwalk').slideUp();
    $('#laurier200ainsle').slideUp();
    $('#victoria200conestoga').slideUp();
    $('#laurier202conestoga').slideUp();

    $('#inputStopId').val(localStorage.getItem("savedStopId"));
    $('#inputRouteId').val(localStorage.getItem("savedRouteId"));
    customInfo();

    var d = new Date();

    if (d.getHours() < 12) {
        $('#disp1').slideDown();
        $('#disp2').slideDown();
		$('#conestoga202boardwalk').slideDown();
		$('#laurier200ainsle').slideDown();
		
        sendJSONtoDiv(2832, 202, "conestoga202boardwalk");
        sendJSONtoDiv(3620, 200, "laurier200ainsle");
    }

    else {
        $('#disp3').slideDown();
        $('#disp4').slideDown();
		$('#victoria200conestoga').slideDown();
		$('#laurier202conestoga').slideDown();
		
        sendJSONtoDiv(1893, 200, "victoria200conestoga");
        sendJSONtoDiv(3620, 202, "laurier202conestoga");
    }
}

function customInfo() {
    var stopId = $("#inputStopId").val();
    var routeId = $("#inputRouteId").val();

    $('#customBusTitle').slideUp();
    $('#customBusTitle').html("<h4>Route " + routeId + "</h4><h5>Stop #" + stopId + "</h5>");
    $('#customBusTitle').slideDown();

    $('#customBusInfo').slideUp();
    $('#customBusInfo').html(spinnerHtml);
    $('#customBusInfo').slideDown();

	var stopName = "";
	
	$.getJSON("stops.json", function (data) {
		stopName = data[(stopId-1000)];
	});
	
    $.getJSON(baseUrl + stopId + routeUrl + routeId, function (data) {
        var customBusTitle = "<h4>" + data.stopTimes[0].HeadSign + "</h4>";
        customBusTitle += "<h5>" + stopName + " - Stop #" + stopId + "</h5>";

        $('#customBusTitle').slideUp();
        $('#customBusTitle').html(customBusTitle);
        $('#customBusTitle').slideDown();

        setDivs(data.stopTimes, "customBusInfo");
    });

    localStorage.setItem("savedStopId", stopId);
    localStorage.setItem("savedRouteId", routeId);
}

function sendJSONtoDiv(stopId, routeId, divID) {
    $.getJSON(baseUrl + stopId + routeUrl + routeId, function (data) {
        setDivs(data.stopTimes, divID);
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
       
        outputString += "<tr><td>";
        outputString += data[i].Minutes + "m </td><td> " + hourStr + ":" + minuteStr + " " + amPm + "</td></tr>";
        outputString += "</li>";
    }
 
    outputString += "</table>";
 
	$("#"+divID).slideUp();
    document.getElementById(divID).innerHTML = outputString;
    $("#"+divID).slideDown();
}
