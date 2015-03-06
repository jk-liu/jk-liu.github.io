var baseUrl = "https://jsonp.nodejitsu.com/?callback=&url=http%3A%2F%2Frealtimemap.grt.ca%2FStop%2FGetStopInfo%3FstopId%3D";
var routeUrl = "%26routeId%3D";

function main() {
    $('#inputStopId').val(localStorage.getItem("savedStopId"));
    $('#inputRouteId').val(localStorage.getItem("savedRouteId"));
    customInfo();

    sendJSONtoDiv(2832, 202, "conestoga202boardwalk");
    sendJSONtoDiv(3620, 200, "laurier200ainsle");
    sendJSONtoDiv(1893, 200, "victoria200conestoga");
    sendJSONtoDiv(3620, 202, "laurier202conestoga");
}

function customInfo() {
    var stopId = $("#inputStopId").val();
    var routeId = $("#inputRouteId").val();

    $.getJSON(baseUrl + stopId + routeUrl + routeId, function (data) {
        document.getElementById("customBusTitle").innerHTML = "<h4>" + data.stopTimes[0].HeadSign + " - " + stopId + "</h4>";
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
    var outputString = "<ul>";

    for (var i in data) {
        outputString += "<li>";
        outputString += data[i].Minutes + "m";
        outputString += "</li>";
    }

    outputString += "</ul>";

    document.getElementById(divID).innerHTML = outputString;
}
