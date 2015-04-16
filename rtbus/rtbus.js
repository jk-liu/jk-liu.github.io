/******************************
*          CONSTANTS          *
******************************/

var DIV_ROOT = "divStop";
var DIV_ROUTE_TITLE = "divRouteTitle";
var DIV_STOP_TITLE = "divStopTitle";
var DIV_BUS_INFO = "divBusInfo";
var LOCALSTORAGE_KEY = "rtbusData";
var LOCALSTORAGE_SETTINGS_KEY = "rtbusSettings";

// URLs
var YqlUrl = "http://query.yahooapis.com/v1/public/yql";
var baseUrl = "select * from json where url=\"http://realtimemap.grt.ca/Stop/GetStopInfo?stopId=";
var routeUrl = "&routeId=";

var spinnerHtml = "<p style=\"text-align:center; padding:20px\"><i class=\"fa fa-refresh fa-spin fa-2x\"></i></p>";

// settings
var isShowAllStopsEnabled = false;
var isOnlyShowNextBusEnabled = true;
var stopsList = [];

// when document is loaded call main
$(document).ready(main);

function main() {
    var settings = StoredSettings.get();
    if (settings != null) {
        if (settings.hasOwnProperty("isShowAllStopsEnabled"))
            isShowAllStopsEnabled = settings.isShowAllStopsEnabled;
        if (settings.hasOwnProperty("isOnlyShowNextBusEnabled"))
            isOnlyShowNextBusEnabled = settings.isOnlyShowNextBusEnabled;
    }

    stopsList = StoredStops.get();

    if (stopsList.length > 0) {
        initLayout(stopsList.length);
        requestDataForLayout(stopsList.length);
    }
    else {
        var emptyMsg = "<h4>No stops have been set, you can set stops by tapping Edit Stops.</h4>";
        $("#mainLayout").fadeOut(400, function () { $("#mainLayout").html(emptyMsg); });
        $("#mainLayout").fadeIn();
    }
}

/******************************
*           LAYOUT            *
******************************/

function initLayout(n) {
    var divContent = "";

    // create the divs to set later on
    for (i = 0; i < n; i++) {
        divContent += "<div class=\"col-sm-6 col-md-4\" id=\"" + DIV_ROOT + i + "\" onclick=\"getDataForLayout(" + i + ", false)\" style=\"display: none;\">";
        divContent += "<div class=\"col-sm-12\">";
        divContent += "<h4><i class=\"fa fa-bus\"></i> <span id=\"" + DIV_ROUTE_TITLE + i + "\"</span></h4>";
        divContent += "<h5><i class=\"fa fa-map-marker\"></i> <span id=\"" + DIV_STOP_TITLE + i + "\"</span></h5>";
        divContent += "</div>";
        divContent += "<div class=\"col-sm-12\" id=\"" + DIV_BUS_INFO + i + "\">" + spinnerHtml + "</div>";
        divContent += "</div>";
    }

    divContent += "<div class=\"col-sm-12\" id=\"refreshTutorial\"><span class=\"label label-default\"><i class=\"fa fa-info-circle\"></i> Tap on a section to refresh</span><br><br></div>";
    $("#mainLayout").html(divContent);
}

function requestDataForLayout(n) {
    var d = new Date();

    for (i = 0; i < n; i++) {
        // only show if within hour range
        if (d.getHours() >= stopsList[i].lowerHour && d.getHours() <= stopsList[i].upperHour) {
            getDataForLayout(i, true);
        }
        // otherwise if empty or manual overide then hour filtering disabled
        else if (stopsList[i].lowerHour == "" || isShowAllStopsEnabled) {
            getDataForLayout(i, true);
        }
    }
}

function getDataForLayout(n, isFirstLoad) {
    // show layout
    $("#" + DIV_ROOT + n).show();
    // disable click to avoid queuing multiple requests
    document.getElementById(DIV_ROOT + n).onclick = function () {};

    // only show placeholder information on first load
    if (isFirstLoad) {
        setRouteTitle(n, "Route " + stopsList[n].routeId);
        setStopTitle(n, "Stop #" + stopsList[n].stopId);
    }
    else {
        // set display info to spinner and show
        $("#" + DIV_BUS_INFO + n).fadeOut(400, function () { $("#" + DIV_BUS_INFO + n).html(spinnerHtml); });
        $("#" + DIV_BUS_INFO + n).fadeIn();

        // hide tutorial text
        $("#refreshTutorial").slideUp();
    }

    // for regular bus stops it's possible to get its name
    if (stopsList[n].stopId >= 1000 && stopsList[n].stopId <= 3949) {
        $.getJSON("stops.json", function (data) {
            var stopName = data[(stopsList[n].stopId - 1000)];
            if (stopName != "") {
                setStopTitle(n, stopName + " - #" + stopsList[n].stopId);
            }
        });
    }

    // other stops that are not listed
    else if (stopsList[n].stopId >= 3950 && stopsList[n].stopId <= 5050) {
        // 5xxx stops are detours
        if (stopsList[n].stopId >= 5000) {
            setStopTitle(n, "Detour #" + stopsList[n].stopId)
        } else {
            setStopTitle(n, "Stop #" + stopsList[n].stopId)
        }
    }

    $.getJSON(YqlUrl,
        {
            q: baseUrl + stopsList[n].stopId + routeUrl + stopsList[n].routeId + "\"",
            format: "json"
        },

    function (data) {
        if (data == null || data.query.results == null) {
            $("#" + DIV_BUS_INFO + n).fadeOut(400, function () { $("#" + DIV_BUS_INFO + n).html("Server error, tap to try again.<br><br>"); });
            $("#" + DIV_BUS_INFO + n).fadeIn(400, function () {
                // reenable click after receiving result
                document.getElementById(DIV_ROOT + n).onclick = function () { getDataForLayout(n, false) };
            });
        }

        else if (data.query.results.json.hasOwnProperty('stopTimes')) {
            if (data.query.results.json.stopTimes.hasOwnProperty('length')) {
                setRouteTitle(n, data.query.results.json.stopTimes[0].HeadSign);
                setDivs(n, data.query.results.json.stopTimes);
            } else {
                setRouteTitle(n, data.query.results.json.stopTimes.HeadSign);
                setDivs(n, [data.query.results.json.stopTimes]);
            }
        }

        else {
            $("#" + DIV_BUS_INFO + n).fadeOut(400, function () { $("#" + DIV_BUS_INFO + n).html("Buses may not be running at this time, otherwise check that the bus route and stop combination are valid.<br><br>"); });
            $("#" + DIV_BUS_INFO + n).fadeIn(400, function () {
                // reenable click after receiving result
                document.getElementById(DIV_ROOT + n).onclick = function () { getDataForLayout(n, false) };
            });
        }
    });
}

function setDivs(n, data) {
    var outputString = "<table class=\"table table-condensed\">";

    for (var i = 0; i < data.length; i++) {
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

        if (isOnlyShowNextBusEnabled) break;
    }

    outputString += "</table>";

    $("#" + DIV_BUS_INFO + n).fadeOut(400, function () { $("#" + DIV_BUS_INFO + n).html(outputString); });
    $("#" + DIV_BUS_INFO + n).fadeIn(400, function () {
        // reenable click after receiving result
        document.getElementById(DIV_ROOT + n).onclick = function () { getDataForLayout(n, false) };
    });
}

function setRouteTitle(n, routeStr) {
    $("#" + DIV_ROUTE_TITLE + n).html(routeStr);
}

function setStopTitle(n, stopStr) {
    $("#" + DIV_STOP_TITLE + n).html(stopStr);
}


var StoredStops = {
    get: function () {
        var rtbusData = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY));
        if (rtbusData == null) return [];
        else return rtbusData;
    },
    set: function (stops) { localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(stops)); },
    clear: function () { localStorage.removeItem(LOCALSTORAGE_KEY); }
};

var StoredSettings = {
    get: function () {
        var rtbusSettings = JSON.parse(localStorage.getItem(LOCALSTORAGE_SETTINGS_KEY));
        return rtbusSettings;
    }
};

function BusStop(routeId, stopId, lowerHour, upperHour) {
    this.routeId = routeId;
    this.stopId = stopId;
    this.lowerHour = lowerHour;
    this.upperHour = upperHour;
}
