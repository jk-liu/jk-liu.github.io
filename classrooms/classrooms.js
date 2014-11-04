function UrlExists(url)
{
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status!=404;
}

function collectInfo() {
	console.log(UrlExists("http://www.jkliu.ca/classrooms/schedules/AL_116.json"))
}
