var baseUrl = "https://jsonp.nodejitsu.com/?callback=&url=http%3A%2F%2Frealtimemap.grt.ca%2FStop%2FGetStopInfo%3FstopId%3D";
var routeUrl = "%26routeId%3D";

function main() {
    $('#inputStopId').val(localStorage.getItem("savedStopId"));
    $('#inputRouteId').val(localStorage.getItem("savedRouteId"));
    customInfo();

    var d = new Date();

    if (d.getHours() < 12) {
        $('#disp3').hide();
        $('#disp4').hide();

        sendJSONtoDiv(2832, 202, "conestoga202boardwalk");
        sendJSONtoDiv(3620, 200, "laurier200ainsle");
    }

    else {
        $('#disp1').hide();
        $('#disp2').hide();

        sendJSONtoDiv(1893, 200, "victoria200conestoga");
        sendJSONtoDiv(3620, 202, "laurier202conestoga");
    }
}

function customInfo() {
    var stopId = $("#inputStopId").val();
    var routeId = $("#inputRouteId").val();

    $.getJSON(baseUrl + stopId + routeUrl + routeId, function (data) {
        var customBusTitle = "<h4>" + data.stopTimes[0].HeadSign + "</h4>";
        customBusTitle += "<h5> Stop #" + stopId + "</h5>";

        document.getElementById("customBusTitle").innerHTML = customBusTitle;
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
 
    document.getElementById(divID).innerHTML = outputString;
}