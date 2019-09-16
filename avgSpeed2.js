function readSingleFile(e) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
        var contents = e.target.result;
        processFile(contents);
    };
    reader.readAsText(file);
}

function processFile(contents) {

    try {
        let data = contents.split('\n').map((x) => {
            var pairs = x.split(',');
            return {
                name: pairs[0],
                value: pairs[1] ? pairs[1].split('\r')[0] : ''
            };
        });

        stageData = {
            avgSpeed: data[1].value,
            distance: data[2].value,
            total: data[3].value,
            checkPoints: getCheckPoints(data)
        };

        let tempStageNumber = Number.parseInt(data[0].value);
        if (isNaN(tempStageNumber) || tempStageNumber < 1 || tempStageNumber > 31) {
            throw 'Rubbish';
        }
        localStorage.removeItem(data[0].value);
        localStorage.setItem(data[0].value, JSON.stringify(stageData));

        document.getElementById('stage-number').value = data[0].value;
    }
    catch (error) {
        alert('Failed to load the csv file');
    }
}

function getCheckPoints(data) {
    let i = 5;
    let steps = [];
    while (i < 25 && data[i] && data[i].value.length != 0) {
        steps.push(data[i++].value);
    }
    return steps;
}

function loadStageData() {
    let tempStageNumber = document.getElementById('stage-number').value;
    let rawData = localStorage.getItem(tempStageNumber);
    if (rawData == null) {
        return false;
    }

    stageNumber = Number.parseFloat(tempStageNumber);

    stageData = JSON.parse(rawData);

    stageData.distance = Number.parseFloat(stageData.distance);
    stageData.total = Number.parseFloat(stageData.total);
    stageData.avgSpeed = Number.parseFloat(stageData.avgSpeed);
    for (let i = 0; i < stageData.checkPoints.length; i++) {
        stageData.checkPoints[i] = Number.parseFloat(stageData.checkPoints[i]);
    }

    return true;
}


function showStageData() {
    loadStageData();
    let str = 'stage number: ' + stageNumber + '\n'
        + 'distance: ' + stageData.distance + '\n'
        + 'total: ' + stageData.total + '\n'
        + 'avgSpeed: ' + stageData.avgSpeed + '\n';

    for (let i = 0; i < stageData.checkPoints.length; i++) {
        str += stageData.checkPoints[i] + '\n';
    }

    alert(str);
}

function reset() {
    //localStorage.setItem(new Date().toLocaleTimeString().toUpperCase(), 'd:' + round2dp(distance / 1000) + ' / s:' + round2dp(avgSpeed));
}



var distance = 0.00;
var actualSpeed = 0.00;
var avgSpeed = 0.00;
var tolerance = 2.00;
var stageNumber = 0;
var stageData = {};
var checkPointNumber = 1;

var lastLat = null;
var lastLon = null;
var lastTime = null;
var startTime = null;

var startCheckPointTime = null;
var startCheckPointDistance = null;

var firstGPS = true;
var freezeDisplay = false;


function gpsError(err) {
    alert('GPS error. Are you sure location is turned on? ');
}


function calcStepDistance(lat1, long1, lat2, long2) {
    var φ1 = Math.PI * lat1 / 180;
    var φ2 = Math.PI * lat2 / 180;
    var Δλ = Math.PI * (long2 - long1) / 180;

    var x = Δλ * Math.cos((φ1 + φ2) / 2);
    var y = φ2 - φ1;
    return Math.sqrt(x * x + y * y) * 6370693.4856531;
}


function gpsUpdate(position) {

    if (firstGPS) {
        lastLat = position.coords.latitude;
        lastLon = position.coords.longitude;
        distance = 0.00;
        avgSpeed = 0.00;
        lastTime = performance.now();
        startTime = performance.now();
        startCheckPointTime = performance.now();
        firstGPS = false;
        return;
    }

    let incTime = performance.now() - lastTime;
    if (incTime > 1000.00) {

        let incDist = calcStepDistance(lastLat, lastLon, position.coords.latitude, position.coords.longitude); // metres
        actualSpeed = incDist * 3600.00 / incTime;

        if (incDist > 0.5) {
            distance += incDist;

            lastLat = position.coords.latitude;
            lastLon = position.coords.longitude;
        }

        if (!freezeDisplay) {
            updateDisplayData();
        }

        lastTime = performance.now();
    }
}


function updateDisplayData() {

    if (currentMode === 'tourMode') {
        distanceTourDiv.innerHTML = round2dp(distance / 1000.00);
        actualSpeedTourDiv.innerHTML = Math.round(actualSpeed);

        actualSpeedTourDiv.className = 'value ' + (actualSpeed > 101.00 ? 'blinking' : '');

        if (stageNumber > 0) {
            remainingStageDistanceTourMainDiv.style.display = 'block';
            remainingStageDistanceTourDiv.innerHTML = round2dp(stageData.total - distance / 1000.00);
        }
        else {
            remainingStageDistanceTourMainDiv.style.display = 'none';
        }
    }

    if (currentMode === 'runMode') {
        avgSpeed = distance * 3600.00 / (performance.now() - startTime);

        actualSpeedRunDiv.className = 'halfwit value ' + (actualSpeed > 126.00 ? 'blinking' : '');

        actualSpeedRunDiv.innerHTML = Math.round(actualSpeed);
        avgSpeedRunDiv.innerHTML = round1dp(avgSpeed);
        distanceRunDiv.innerHTML = round2dp(distance / 1000.00);

        remainingStageDistanceRunDiv.innerHTML = round2dp(stageData.distance - distance / 1000.00);

        let perfectCheckPointDistanceDifference = stageData.checkPoints[checkPointNumber] - stageData.checkPoints[checkPointNumber - 1];

        let currentCheckPointDistance = distance / 1000.00 - startCheckPointDistance;
        let remainingCheckPointDistance = perfectCheckPointDistanceDifference - currentCheckPointDistance;
        remainingCheckPointDistanceDiv.innerHTML = round2dp(remainingCheckPointDistance);

        let perfectStageTime = (stageData.total / stageData.avgSpeed) * 3600000;
        let elapsedStageTime = lastTime - startTime;
        let remainingStageTime = perfectStageTime - elapsedStageTime;
        remainingStageTimeDiv.innerHTML = toTimeString(remainingStageTime);

        let perfectCheckPointTime = (perfectCheckPointDistanceDifference / stageData.avgSpeed) * 3600000;
        let elapsedCheckPointTime = lastTime - startCheckPointTime;
        let remainingCheckPointTime = perfectCheckPointTime - elapsedCheckPointTime;
        remainingCheckPointTimeDiv.innerHTML = toTimeString(remainingCheckPointTime);

        let countdown = Math.floor(-remainingCheckPointTime / 1000);
        countdownDiv.style.display = countdown > -21 && countdown < 21 ? 'block' : 'none';
        remainingCheckPointSecondsDiv.style.color = countdown < 0 ? '#3a9b0f' : '#f00';
        remainingCheckPointSecondsDiv.innerHTML = countdown;

        document.body.style.backgroundColor = avgSpeed + tolerance > stageData.avgSpeed
            ? '#ff0000'
            : (avgSpeed - tolerance < stageData.avgSpeed ? '#3a9b0f' : '#ffa500');
    }  
    
}




function leaveSetupMode() {
    if (!loadStageData()) {
        alert("Error: Stage Data not loaded");
        return;
    }

    tolerance = document.getElementById('tolerance').value;
    updateStageAndCheckPoint();

    enterTourMode();
}

function enterSetupMode() {
    currentMode = 'setupMode';
    showCorrectPanel();
}

function enterTourMode() {
    document.getElementById('tourNextBtn').style.display = stageNumber > 0 ? 'inline-block' : 'none';

    currentMode = 'tourMode';
    updateStageAndCheckPoint();
    document.body.style.backgroundColor = '#ffa500';

    showCorrectPanel();
}


function enterRunMode() {
    currentMode = 'runMode';

    checkPointNumber = 1;
    updateStageAndCheckPoint();

    showCorrectPanel();
}

function start() {
    freezeDisplay = false;
    firstGPS = true;
    distance = 0.00;
    actualSpeed = 0.00;
    avgSpeed = 0.00;

    if (stageData.distance === undefined || stageData.distance < 0.1) {
        enterTourMode();
    }
    else {
        enterRunMode();
    }
}

var unfrozenBackgroundColor = null;

function toggleFreezeDisplay() {
    freezeDisplay = !freezeDisplay;
    if (freezeDisplay) {
        unfrozenBackgroundColor = document.body.style.backgroundColor;
        document.body.style.backgroundColor = '#000';
    }
    else {
        document.body.style.backgroundColor = unfrozenBackgroundColor;
    }
}

function nextCheckPoint() {
    checkPointNumber++;
    startCheckPointTime = performance.now();
    startCheckPointDistance = distance / 1000.00;

    if (checkPointNumber < stageData.checkPoints.length) {

        // freeze screen for 10 seconds (hide the button bar too)
        freezeDisplay = true;
        document.body.style.backgroundColor = '#000';

        setTimeout(() => {
            freezeDisplay = false;
            updateDisplayData();
            updateStageAndCheckPoint();
        }, 10000);
    }
    else {
        if (checkPointNumber > stageData.checkPoints.length) {
            enterTourMode();
        }
    }
}


function updateStageAndCheckPoint() {
    document.getElementById('stageNumberTourDiv').innerHTML = stageNumber;
    document.getElementById('stageNumberRunDiv').innerHTML = stageNumber;
    document.getElementById('checkPointNumberRunDiv').innerHTML = checkPointNumber;
}


function showCorrectPanel() {
    if (currentMode === 'setupMode') {
        document.getElementById('setupDiv').style.display = 'block';
        document.getElementById('tourDiv').style.display = 'none';
        document.getElementById('runDiv').style.display = 'none';
    }
    if (currentMode === 'tourMode') {
        document.getElementById('setupDiv').style.display = 'none';
        document.getElementById('tourDiv').style.display = 'block';
        document.getElementById('runDiv').style.display = 'none';
    }
    if (currentMode === 'runMode') {
        document.getElementById('setupDiv').style.display = 'none';
        document.getElementById('tourDiv').style.display = 'none';
        document.getElementById('runDiv').style.display = 'block';
    }
}


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


function round2dp(num) {
    return (+(Math.round(num + "e+2") + "e-2")).toFixed(2);
}

function round1dp(num) {
    return (+(Math.round(num + "e+1") + "e-1")).toFixed(1);
}

function updateClock() {
    document.getElementById('clock').innerHTML = new Date().toLocaleTimeString();
}
