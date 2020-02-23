var distance = 0.00;
var actualSpeed = 0.00;
var avgSpeed = 0.00;

var lastLat = null;
var lastLon = null;
var lastTime = null;
var startTime = null;

var firstGPS = true;


var gpsOptions = {
    enableHighAccuracy: true,
    maximumAge: 0,
    maxWait: 5000
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


var distanceDiv = document.getElementById('distanceDiv');
var actualSpeedDiv = document.getElementById('actualSpeedDiv');
var avgSpeedDiv = document.getElementById('avgSpeedDiv');

//setInterval(updateClock, 1000);

// main engine starts here...

function gpsError(err) {
    alert('GPS error. Are you sure location is turned on? ');
}


function calcStepDistance(lat1, long1, lat2, long2) {
    var φ1 = Math.PI * lat1 / 180;
    var φ2 = Math.PI * lat2 / 180;
    var Δλ = Math.PI * (long2 - long1) / 180;

    return Math.acos(Math.sin(φ1) * Math.sin(φ2) + Math.cos(φ1) * Math.cos(φ2) * Math.cos(Δλ)) * 6368235.00;
}


function gpsUpdate(position) {
    if (firstGPS) {
        lastLat = position.coords.latitude;
        lastLon = position.coords.longitude;
        lastTime = performance.now();
        firstGPS = false;
        return;
    }

    let incDist = calcStepDistance(lastLat, lastLon, position.coords.latitude, position.coords.longitude); // metres

    if (incDist > 5.0) {
        distance += incDist;
        let now = performance.now();
        actualSpeed = incDist * 3600.00 / (now - lastTime);

        lastTime = now;
        lastLat = position.coords.latitude;
        lastLon = position.coords.longitude;

        distanceDiv.innerHTML = round3dp(distance / 1000.00);
        actualSpeedDiv.innerHTML = round3dp(actualSpeed);

        avgSpeed = distance * 3600.00 / (performance.now() - startTime);
        avgSpeedDiv.innerHTML = round1dp(avgSpeed);
    }
}


function reset() {
    distance = 0.00;
    actualSpeed = 0.00;
    avgSpeed = 0.00;

    lastLat = null;
    lastLon = null;
    lastTime = null;
    startTime = null;

    firstGPS = true;
}

// utility functions

function toTimeString(ms) {
    let negative = ms < 0;
    if (negative) {
        ms = -ms;
    }
    var hours = Math.floor(ms / 3600000);
    var minutes = Math.floor((ms - (hours * 3600000)) / 60000);
    var seconds = parseInt((ms - (hours * 3600000) - (minutes * 60000)) / 1000);

    return (negative ? '-' : '') + hours + ':' + (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds);
}

function round3dp(num) {
    return (+(Math.round(num + "e+3") + "e-3")).toFixed(3);
}


function round2dp(num) {
    return (+(Math.round(num + "e+2") + "e-2")).toFixed(2);
}

function round1dp(num) {
    return (+(Math.round(num + "e+1") + "e-1")).toFixed(1);
}

//function updateClock() {
//    document.getElementById('clock').innerHTML = new Date().toLocaleTimeString();
//}

