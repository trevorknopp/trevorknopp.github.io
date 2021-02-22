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
var countdownDiv = document.getElementById('countdownDiv');
var remainingCheckPointSecondsDiv = document.getElementById('remainingCheckPointSecondsDiv');

var runFreezeBtn = document.getElementById("runFreezeBtn");
var runUnFreezeBtn = document.getElementById("runUnFreezeBtn");
var runFinishBtn = document.getElementById("runFinishBtn");

updateStageList();

setInterval(updateClock, 1000);

//must be wrong!
enterTourMode();
