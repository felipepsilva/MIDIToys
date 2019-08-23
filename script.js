
navigator.requestMIDIAccess().then(midiAccessSuccess, midiAccessFailure);

var midiInputs = [];
var currentPort = null;

var dropdownElement = document.getElementById("dropdown");
var noteElement = document.getElementById("note");
var intervalElement = document.getElementById("interval");
var chordElement = document.getElementById("chord");

var chromaticScale = [ "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B" ];

var noteStack = [];

function midiAccessSuccess(midi) {
	var inputs = midi.inputs.values();	
	var index = 0;
	
    for(var input = inputs.next(); input && !input.done; input = inputs.next()) {
		var opt = document.createElement("option");
		opt.appendChild(document.createTextNode(input.value.name));
		dropdownElement.appendChild(opt);
		
		midiInputs[index++] = input;
		
		//input.value.onmidimessage = onMIDIMessage;
    }
	
	dropdownElement.onchange = onPortSelected;
}

function midiAccessFailure() {
    console.error("Cannot acquire midi!");
}

function onPortSelected() {
	if(currentPort)
		currentPort.value.onmidimessage = null;
	
	currentPort = midiInputs[dropdownElement.selectedIndex];
	currentPort.value.onmidimessage = onMIDIMessage;
	console.log(currentPort.value.name);
}

function addNote(note) {
	noteStack.push(note);
	noteStack.sort();
	//console.log(noteStack);
}

function removeNote(note) {
	noteStack.splice(noteStack.indexOf(note), 1);
	//console.log(noteStack);
}

function getIntervalText(inter) {
	switch (inter) {
		case 1:	return "m2";
		case 2:	return "M2";
		case 3:	return "m3";
		case 4:	return "M3";
		case 5:	return "P4";
		case 6:	return "#4";
		case 7:	return "P5";
		case 8:	return "m6";
		case 9:	return "M6";
		case 10: return "m7";
		case 11: return "M7";
		case 12: return "P8";
		case 13: return "m9";
		case 14: return "M9";
		case 15: return "m10";
		case 16: return "M10";
		case 17: return "P11";
		case 18: return "#11";
		case 19: return "P12";
		case 20: return "m13";
		case 21: return "M13";
		default: return "";
	}
}

function updateNoteText() {
	var text = ""
	noteStack.forEach(element => {
		text += chromaticScale[element % 12] + " ";
	});

	noteElement.innerHTML = text;
}

function calcIntervals() {
	var intervals = [];

	for (let index = 1; index < noteStack.length; index++) {
		intervals.push(noteStack[index] - noteStack[0]);
	}

	return intervals;
}

function getChordText(intervals) {
	var chord = "";
	intervals.forEach(element => {
		chord += element;
	});

	switch (chord) {
		case "27":
			return "sus2";
		case "57":
			return "sus4";
		case "3":
		case "37":
			return "minor";
		case "4":
		case "47":
			return "major";
		default:
			return "";
	}
}

function updateInfo() {
	updateNoteText();

	if(noteStack.length > 1) {
		var text = "";
		let intervals = calcIntervals()
		intervals.forEach(element => {
			text += getIntervalText(element) + " ";
		});
		intervalElement.innerHTML = text;

		chordElement.innerHTML = getChordText(intervals);
	}
	else {
		chordElement.innerHTML = "";
		interval.innerHTML = "";
	}
}

function onMIDIMessage(msg) {
	//console.log(msg.data);
	
	if(msg.data[0] == 128) {
		removeNote(msg.data[1]);
		updateInfo();
	}
	else if (msg.data[0] == 144) {
		addNote(msg.data[1]);
		updateInfo();
	}
}
