var UWAPI_URL = "https://api.uwaterloo.ca/v2/"
var API_key = "key=2ff1508465335a589f7575818dae9cc4"

function collectInfo() {
	var building = $( "#buildings option:selected" ).val();
	var roomNumber =  document.getElementById('room').value;
	var dayOfWeek =  document.getElementById('dayOfWeek').value;
	var urlFull = UWAPI_URL+"buildings/"+building+"/"+roomNumber+"/courses.json?"+API_key;
	var roomSchedule;
	
	$("#displayOpenTimes").slideUp();
	$("#displayStatus").slideUp();
	$("#displayTimes").slideUp();

	$.getJSON(urlFull, function(data) {
		roomSchedule = data.data;
		var metaStatus = data.meta.status;
		// if input returns no information
		if (metaStatus != 200) {
			$("#displayOpenTimes").slideUp(800);
			$("#displayStatus").slideDown(800);
			$("#displayTimes").slideUp(800);

			document.getElementById("displayStatus").innerHTML="<strong>Room selected has no classes scheduled.</strong>";
			// document.getElementById("displayTimes").innerHTML="";
			// document.getElementById("displayOpenTimes").innerHTML="";
		}
		
		// otherwise process the room schedule
		else {
			document.getElementById("displayStatus").innerHTML="<strong>Room has classes scheduled:</strong>";
			var output = [];
			var timeArray = [];
			var showCoursesChk = document.getElementById('showCourses');
			var showDaysChk = document.getElementById('showDays');
			var showInstrChk = document.getElementById('showInstr');
			var showEnrollChk = document.getElementById('showEnroll');
			
			// only keep track of time in 10 minute intervals from 8:00-22:00
			for (var i=0; i<=85; i++) { timeArray[i]=0; }
			
			for (var i in data.data) {
				var whichDays = data.data[i].weekdays;
				var startTime = data.data[i].start_time;
				var endTime = data.data[i].end_time;
				var courseSub = data.data[i].subject;
				var courseNum = data.data[i].catalog_number;
				var courseTitle = data.data[i].title;
				var courseInstr = data.data[i].instructors;
				var courseEnroll = data.data[i].enrollment_total;
				var outputStr = "";

				if (whichDays.indexOf(dayOfWeek) > -1) {
					if (dayOfWeek=="T" && whichDays!="Th"){
						outputStr+="<li>" + startTime+" - "+endTime+" "+courseSub+" "+courseNum;
						if (showDaysChk.checked) { outputStr+=" "+whichDays; }
						if (showCoursesChk.checked) { outputStr+=" - "+courseTitle; }
						if (showInstrChk.checked) { outputStr+=" - "+courseInstr; }
						if (showEnrollChk.checked) { outputStr+=" - Enrollment: "+courseEnroll; }
						outputStr+="</li>";
						output.push(outputStr);
						
						// calculate times
						var startTimeInt = (startTime.split(":")[0]-8)*6+(startTime.split(":")[1]/10);
						var endTimeInt = (endTime.split(":")[0]-8)*6+(endTime.split(":")[1]/10);
						
						// set the time array to occupied
						for (var i=startTimeInt; i<endTimeInt; i++) { timeArray[i]=1; }
					}

					else if (dayOfWeek!="T"){
						outputStr+="<li>" + startTime+" - "+endTime+" "+courseSub+" "+courseNum;
						if (showDaysChk.checked) { outputStr+=" "+whichDays; }
						if (showCoursesChk.checked) { outputStr+=" - "+courseTitle; }
						if (showInstrChk.checked) { outputStr+=" - "+courseInstr; }
						if (showEnrollChk.checked) { outputStr+=" - Enrollment: "+courseEnroll; }
						outputStr+="</li>";
						output.push(outputStr);
						
						// calculate times
						var startTimeInt = (startTime.split(":")[0]-8)*6+(startTime.split(":")[1]/10);
						var endTimeInt = (endTime.split(":")[0]-8)*6+(endTime.split(":")[1]/10);
						
						// set the time array to occupied
						for (var i=startTimeInt; i<endTimeInt; i++) { timeArray[i]=1; }
					}
				}
			}
			
			// sort the output in terms of time, input is unordered
			output.sort();
			var outputString = "";
			outputString+="<ul>";
			for (var i in output) {
				outputString+=output[i];
			}
			outputString+="</ul>";
			document.getElementById("displayTimes").innerHTML=outputString;
			
			// output open times
			outputString = "<strong>Open times: </strong>";
			outputString+="<ul>";
			var lastTimeOccupied=0;
			
			for (var i=3; i<84; i++) {
				if (timeArray[i]==0 && timeArray[i+1]==0 && lastTimeOccupied==0) {
					outputString+="<li>";
					outputString+=(Math.floor(i/6)+8)%12+":"+i%6+"0";
					if (i<=23) { outputString+=" am"; }
					else { outputString+=" pm"; }
					outputString+=" - "
					lastTimeOccupied=1;
				}
				else if (timeArray[i]==1 && lastTimeOccupied==1) {
					outputString+=(Math.floor(i/6)+8)%12+":"+i%6+"0";
					if (i<=23) { outputString+=" am"; }
					else { outputString+=" pm"; }
					outputString+="</li>";
					lastTimeOccupied=0;
				}
			}
			outputString+="building closes</li>"
			outputString+="</ul>";
			document.getElementById("displayOpenTimes").innerHTML=outputString;
			
			$("#displayOpenTimes").slideDown(800);
			$("#displayStatus").slideDown(800);
			$("#displayTimes").slideDown(800);
		}
	});
}