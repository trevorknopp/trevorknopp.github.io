//navigator.serviceWorker.register('/sw4.js');

var versionDiv = document.getElementById('versionDiv');
versionDiv.innerHTML = appVersion;

var stageNumber = '0';
var stageData = {};
var checkPointNumber = 1;

var lastTime = null;
var startTime = null;

var freezeDisplay = false;


document.getElementById('file-input').addEventListener('change', readSingleFile, false);

var remainingStageTimeDiv = document.getElementById("remainingStageTimeDiv");
var remainingCheckPointTimeDiv = document.getElementById('remainingCheckPointTimeDiv');
var remainingCheckPointSecondsDiv = document.getElementById('remainingCheckPointSecondsDiv');


updateStageList();

setInterval(updateClock, 1000);

//must be wrong!
enterRunMode();
