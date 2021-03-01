//navigator.serviceWorker.register('/sw4.js');

var versionDiv = document.getElementById('versionDiv');
versionDiv.innerHTML = appVersion;

var stageNumber = '0';
var stageData = {};
var checkPointNumber = 1;

var freezeDisplay = false;


document.getElementById('file-input').addEventListener('change', readSingleFile, false);

var remainingCheckPointSecondsDiv = document.getElementById('remainingCheckPointSecondsDiv');
var remainingStageSecondsDiv = document.getElementById('remainingStageSecondsDiv');


updateStageList();
enterSetupMode();
