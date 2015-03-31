/******************************
*          CONSTANTS          *
******************************/
var LOCALSTORAGE_KEY = "rtbusData";
var LOCALSTORAGE_SETTINGS_KEY = "rtbusSettings";

// settings
var Settings = {
    isShowAllStopsEnabled : false,
    isOnlyShowNextBusEnabled : true
}

var stopsList = [];

function main() {
    stopsList = StoredStops.get();
    if (StoredSettings.get() != null) Settings = StoredSettings.get();

    showSettingsOnPage();
    displayStoredStops();
}

/******************************
*           LAYOUT            *
******************************/
function displayStoredStops() {
    var divContent = "<table class=\"table table-condensed\">";
    divContent += "<th><i class=\"fa fa-bus\"></th><th><i class=\"fa fa-map-marker\"></th><th>Start</th><th>End</th><th><i class=\"fa fa-trash\"></i></th>";
    for (var i = 0; i < stopsList.length; i++) {
        divContent += "<tr>";
        divContent += "<td>" + stopsList[i].routeId + "</td>";
        divContent += "<td>" + stopsList[i].stopId + "</td>";
        divContent += "<td>" + stopsList[i].lowerHour + "</td>";
        divContent += "<td>" + stopsList[i].upperHour + "</td>";
        divContent += "<td>" + "<a href=\"javascript:deleteSavedStop(" + i + ")\"<i class=\"fa fa-times\"></i></td>";;
        divContent += "</tr>";
    }

    divContent += "</table>";

    $("#savedStopsDiv").html(divContent);
}

function showSettingsOnPage() {
    for (s in Settings) {
        if (!Settings.hasOwnProperty(s)) {
            //The current property is not a direct property for Settings
            continue;
        }

        $("#" + s).prop("checked", Settings[s]);
    }
}

/******************************
*           UTILITY           *
******************************/
function addSavedStop() {
    var routeIdRegex = /^[1-5][0-9]{0,2}$/;
    var stopIdRegex = /^[1-5][0-9]{3}$/;
    var hourValidation = function (n) { return !isNaN(parseInt(n)) && n >= 0 && n <= 23; };

    var routeId = $("#formRouteId").val();
    var stopId = $("#formStopId").val();
    var lowerHour = $("#formLowerHour").val();
    var upperHour = $("#formUpperHour").val();

    // error checking
    if (!routeIdRegex.test(routeId)) {
        alert("Bus route is invalid");
    }
    else if (!stopIdRegex.test(stopId)) {
        alert("Stop number is invalid");
    }
    else if (lowerHour != "" && !hourValidation(lowerHour)) {
        alert("Start hour must be between 0-23");
    }
    else if (upperHour != "" && !hourValidation(upperHour)) {
        alert("End hour must be between 0-23");
    }
    else if ((lowerHour != "" && upperHour == "") || (lowerHour == "" && upperHour != "")) {
        alert("Both start hour and end hour must be filled");
    }
    else if (lowerHour != "" && upperHour != "" && !(lowerHour < upperHour)) {
        alert("Start hour must be less than end hour");
    }
    else {
        // clear the form
        $("#formRouteId").val("");
        $("#formStopId").val("");
        $("#formLowerHour").val("");
        $("#formUpperHour").val("");

        stopsList.push(new BusStop(routeId, stopId, lowerHour, upperHour));
        StoredStops.set(stopsList);
        displayStoredStops();
    }
}

function deleteSavedStop(n) {
    stopsList.splice(n, 1);
    StoredStops.set(stopsList);
    displayStoredStops();
}

function clearSavedStops() {
    if (confirm("Are you sure you want to clear all stops? This action cannot be undone.") == true) {
        StoredStops.clear();
        stopsList = StoredStops.get();
        displayStoredStops();
    }
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
    },
    set: function (settings) { localStorage.setItem(LOCALSTORAGE_SETTINGS_KEY, JSON.stringify(settings)); }
};

function BusStop(routeId, stopId, lowerHour, upperHour) {
    this.routeId = routeId;
    this.stopId = stopId;
    this.lowerHour = lowerHour;
    this.upperHour = upperHour;
}

/******************************
*          LISTENERS          *
******************************/
$("#formLowerHour").on('input propertychange paste', function () {
    var lowerHour = $("#formLowerHour").val();
    lowerHour = isNaN(parseInt(lowerHour)) ? -1 : parseInt(lowerHour);
    $("#formUpperHour").attr("placeholder", "End hour to display (" + ++lowerHour + " - 23)");
});

$("input:checkbox").click(function () {
    Settings[this.id] = this.checked;
    StoredSettings.set(Settings);
});

$(document).ready(main);