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
var Regex = {
    routeId: /^[1-9][0-9]{0,2}$/,
    stopId: /^[1-5][0-9]{3}$/,
    hourValidation: function (n) { return !isNaN(parseInt(n)) && parseInt(n) >= 0 && parseInt(n) <= 23; }
}

function addSavedStop() {
    var routeId = $("#formRouteId").val();
    var stopId = $("#formStopId").val();
    var lowerHour = $("#formLowerHour").val();
    var upperHour = $("#formUpperHour").val();

    var isInvalid = false;

    // set the form to valid again
    $("#formRouteId").parent("div").removeClass("has-error");
    $("#formStopId").parent("div").removeClass("has-error");
    $("#formLowerHour").parent("div").removeClass("has-error");
    $("#formUpperHour").parent("div").removeClass("has-error");

    // error checking
    if (!Regex.routeId.test(routeId)) {
        if (!isInvalid) alert("Bus route is invalid");
        $("#formRouteId").parent("div").addClass("has-error");
        isInvalid = true;
    }
    if (!Regex.stopId.test(stopId)) {
        if (!isInvalid) alert("Stop number is invalid");
        $("#formStopId").parent("div").addClass("has-error");
        isInvalid = true;
    }
    if (lowerHour != "" && !Regex.hourValidation(lowerHour)) {
        if (!isInvalid) alert("Start hour must be between 0-23");
        $("#formLowerHour").parent("div").addClass("has-error");
        isInvalid = true;
    }
    if (upperHour != "" && !Regex.hourValidation(upperHour)) {
        if (!isInvalid) alert("End hour must be between 0-23");
        $("#formUpperHour").parent("div").addClass("has-error");
        isInvalid = true;
    }
    if ((lowerHour != "" && upperHour == "") || (lowerHour == "" && upperHour != "")) {
        if (!isInvalid) alert("Both start hour and end hour must be filled");
        $("#formLowerHour").parent("div").addClass("has-error");
        $("#formUpperHour").parent("div").addClass("has-error");
        isInvalid = true;
    }
    if (lowerHour != "" && upperHour != "" && !(lowerHour < upperHour)) {
        if (!isInvalid) alert("Start hour must be less than end hour");
        $("#formLowerHour").parent("div").addClass("has-error");
        $("#formUpperHour").parent("div").addClass("has-error");
        isInvalid = true;
    }
    
    if (!isInvalid) {
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
    lowerHour = (lowerHour > 22 || lowerHour < 0) ? -1 : lowerHour;
    $("#formUpperHour").attr("placeholder", "End hour (" + ++lowerHour + " - 23)");
});

$("input:checkbox").click(function () {
    Settings[this.id] = this.checked;
    StoredSettings.set(Settings);
});

$(document).ready(main);