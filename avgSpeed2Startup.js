navigator.serviceWorker.register('/sw.js');

var versionDiv = document.getElementById('versionDiv');
versionDiv.innerHTML = appVersion;

var distance = 0.00;
var actualSpeed = 0.00;
var avgSpeed = 0.00;
var tolerance = 2.00;
var stageNumber = '0';
var stageData = {};
var checkPointNumber = 1;

var lastLat = null;
var lastLon = null;
var lastTime = null;
var startTime = null;

var firstGPS = true;
var freezeDisplay = false;


var gpsOptions = {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 1000,
    maxWait: 1000,
    desiredAccuracy: 5,
    distanceFilter: 5
};

var wpId = navigator.geolocation.watchPosition(gpsUpdate, gpsError, gpsOptions);
// mock watchPosition
//setInterval(() => {
//    let position = {};
//    position.coords = {};
//    position.coords.latitude = -45.000;
//    position.coords.longitude = 178.000;
//    gpsUpdate(position);
//}, 200);

document.getElementById('file-input').addEventListener('change', readSingleFile, false);

var distanceTourDiv = document.getElementById('distanceTourDiv');
var actualSpeedTourDiv = document.getElementById('actualSpeedTourDiv');
var remainingStageDistanceTourMainDiv = document.getElementById('remainingStageDistanceTourMainDiv');
var remainingStageDistanceTourDiv = document.getElementById('remainingStageDistanceTourDiv');
var actualSpeedRunDiv = document.getElementById('actualSpeedRunDiv');
var avgSpeedRunDiv = document.getElementById('avgSpeedRunDiv');
var distanceRunDiv = document.getElementById('distanceRunDiv');
var remainingStageDistanceRunDiv = document.getElementById('remainingStageDistanceRunDiv');
var remainingCheckPointDistanceDiv = document.getElementById("remainingCheckPointDistanceDiv");
var remainingStageTimeDiv = document.getElementById("remainingStageTimeDiv");
var remainingCheckPointTimeDiv = document.getElementById('remainingCheckPointTimeDiv');
var countdownDiv = document.getElementById('countdownDiv');
var remainingCheckPointSecondsDiv = document.getElementById('remainingCheckPointSecondsDiv');

var tourSetupBtn = document.getElementById("tourSetupBtn");
var tourStartBtn = document.getElementById("tourStartBtn");
var tourFreezeBtn = document.getElementById("tourFreezeBtn");
var tourUnFreezeBtn = document.getElementById("tourUnFreezeBtn");

var runFreezeBtn = document.getElementById("runFreezeBtn");
var runUnFreezeBtn = document.getElementById("runUnFreezeBtn");
var runFinishBtn = document.getElementById("runFinishBtn");

updateStageList();

setInterval(updateClock, 1000);

enterTourMode();
