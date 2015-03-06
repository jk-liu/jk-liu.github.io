function main() {
    $.getJSON('https://jsonp.nodejitsu.com/?callback=&url=http%3A%2F%2Frealtimemap.grt.ca%2FStop%2FGetStopInfo%3FstopId%3D2832%26routeId%3D202', function (data) {
        setDivs(data.stopTimes, "conestoga202boardwalk")
    });
    
    $.getJSON('https://jsonp.nodejitsu.com/?callback=&url=http%3A%2F%2Frealtimemap.grt.ca%2FStop%2FGetStopInfo%3FstopId%3D3620%26routeId%3D200', function (data) {
        setDivs(data.stopTimes, "laurier200ainsle")
    });

    $.getJSON('https://jsonp.nodejitsu.com/?callback=&url=http%3A%2F%2Frealtimemap.grt.ca%2FStop%2FGetStopInfo%3FstopId%3D1893%26routeId%3D200', function (data) {
        setDivs(data.stopTimes, "victoria202conestoga")
    });

    $.getJSON('https://jsonp.nodejitsu.com/?callback=&url=http%3A%2F%2Frealtimemap.grt.ca%2FStop%2FGetStopInfo%3FstopId%3D3620%26routeId%3D202', function (data) {
        setDivs(data.stopTimes, "laurier202conestoga")
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