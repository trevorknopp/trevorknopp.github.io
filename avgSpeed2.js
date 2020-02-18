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
        firstGPS = false;
        return;
    }

    let incTime = performance.now() - lastTime;
    if (incTime > 1000.00) {

        let incDist = calcStepDistance(lastLat, lastLon, position.coords.latitude, position.coords.longitude); // metres

        if (incDist > 4.0) {
            lastTime = performance.now();
            distance += incDist;

            lastLat = position.coords.latitude;
            lastLon = position.coords.longitude;
        }

        actualSpeed = incDist * 3600.00 / incTime;
        if (!freezeDisplay) {
            updateDisplayData();
        }

    }
}


function updateDisplayData() {
    if (isTourMode()) {
        distanceTourDiv.innerHTML = round3dp(distance / 1000.00);
        actualSpeedTourDiv.innerHTML = Math.round(actualSpeed);

        actualSpeedTourDiv.className = 'value ' + (actualSpeed > 101.00 ? 'blinking' : '');

        if (stageNumber != '0') {
            remainingStageDistanceTourMainDiv.style.display = 'block';
            remainingStageDistanceTourDiv.innerHTML = round2dp(stageData.total - distance / 1000.00);
        }
        else {
            remainingStageDistanceTourMainDiv.style.display = 'none';
        }
    }

    if (isRunMode()) {
        avgSpeed = distance * 3600.00 / (performance.now() - startTime);

        actualSpeedRunDiv.className = 'halfwit value ' + (actualSpeed > 126.00 ? 'blinking' : '');

        actualSpeedRunDiv.innerHTML = Math.round(actualSpeed);
        avgSpeedRunDiv.innerHTML = round1dp(avgSpeed);
        distanceRunDiv.innerHTML = round2dp(distance / 1000.00);

        remainingStageDistanceRunDiv.innerHTML = round2dp(stageData.distance - distance / 1000.00);

        //When the checkpoint advances, the “next distance” should be the 
        // new checkpoint distance from the start minus the Distance Travelled.

        let perfectCheckPointDistance = stageData.checkPoints[checkPointNumber];
        let currentCheckPointDistance = distance / 1000.00;
        let remainingCheckPointDistance = perfectCheckPointDistance - currentCheckPointDistance;
        remainingCheckPointDistanceDiv.innerHTML = round2dp(remainingCheckPointDistance);


        let perfectStageTime = (stageData.distance / stageData.avgSpeed) * 3600000;
        let elapsedStageTime = performance.now() - startTime;
        let remainingStageTime = perfectStageTime - elapsedStageTime;
        remainingStageTimeDiv.innerHTML = toTimeString(remainingStageTime);

        let elapsedCheckPointTime = performance.now() - previousCheckPointTime;
        let remainingCheckPointTime = nextCheckPointPeriod - elapsedCheckPointTime;
        remainingCheckPointTimeDiv.innerHTML = toTimeString(remainingCheckPointTime);



        let backgroundColor = '#ffa500';

        if (avgSpeed > stageData.avgSpeed + tolerance) {
            backgroundColor = '#ff0000';
        }

        if (avgSpeed < stageData.avgSpeed - tolerance) {
            backgroundColor = '#3a9b0f';
        }

        document.body.style.backgroundColor = backgroundColor;
    }

}


var countdownInterval = null;

function triggerCountdown() {

    if (countdownInterval != null) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }

    var countdown = -20;
    countdownDiv.style.display = 'block';
    remainingCheckPointSecondsDiv.style.color = countdown < 0 ? '#3a9b0f' : '#f00';
    if (!freezeDisplay) {
        remainingCheckPointSecondsDiv.innerHTML = countdown;
    }

    countdownInterval = setInterval(() => {
        remainingCheckPointSecondsDiv.style.color = countdown < 0 ? '#3a9b0f' : '#f00';
        if (!freezeDisplay) {
            remainingCheckPointSecondsDiv.innerHTML = countdown;
        }

        countdown++;
        if (countdown > 20) {
            countdownDiv.style.display = 'none';
            clearInterval(countdownInterval);
        }

    }, 1000);
}


var perfectTimeCountdownTimer = null;
var nextCheckPointPeriod = 0;
var previousCheckPointTime = 0;


function doAdvanceCheckPoint() {
    if (checkPointNumber < stageData.checkPoints.length) {
        checkPointNumber++;

        // last checkpoint
        if (checkPointNumber == stageData.checkPoints.length - 1) {
            currentMode = 'runModeFinishing';
            showCorrectRunButton();
        }

        if (checkPointNumber == stageData.checkPoints.length) {
            clearTimeout(advanceCheckPointTimer);
            return;
        }


        lastTime = performance.now();
        previousCheckPointTime = performance.now();

        let nextCheckPointDistance = stageData.checkPoints[checkPointNumber] - stageData.checkPoints[checkPointNumber - 1];
        nextCheckPointPeriod = (nextCheckPointDistance / stageData.avgSpeed) * 3600000;
        console.log('chkpt:' + checkPointNumber + ' nextchkp time: ' + toTimeString(nextCheckPointPeriod));


        updateDisplayData();
        updateStageAndCheckPoint();

        if (perfectTimeCountdownTimer != null) {
            clearTimeout(perfectTimeCountdownTimer);
            perfectTimeCountdownTrigger = null;
        }

        // kick off the countdown 20 seconds before end of checkpoint time.
        let countdownKickoffTime = nextCheckPointPeriod - 21000;

        perfectTimeCountdownTimer = setTimeout(() => {
            triggerCountdown();
        }, countdownKickoffTime);
    }
}

var advanceCheckPointTimer = null;

function advanceCheckPoint() {
    doAdvanceCheckPoint();

    let perfectCheckPointTime = nextCheckPointPeriod;
    if (perfectCheckPointTime == null) {
        return;
    }
    advanceCheckPointTimer = setTimeout(() => {
        advanceCheckPoint();
    }, perfectCheckPointTime);

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


var freezeTimer = null;

function freezeDisplayFor15() {
    freezeDisplay = true;
    unfrozenBackgroundColor = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#000';
    freezeTimer = setTimeout(() => {
        document.body.style.backgroundColor = unfrozenBackgroundColor;
        freezeDisplay = false;
        if (isRunMode()) {
            currentMode = 'runModeRunning';
            showCorrectRunButton();
        }
        else {
            currentMode = 'tourModeRunning';
            showCorrectTourButton();
        }
    }, 15000);
}


function updateStageAndCheckPoint() {
    document.getElementById('stageNumberTourDiv').innerHTML = stageNumber;
    document.getElementById('stageNumberRunDiv').innerHTML = stageNumber;
    document.getElementById('checkPointNumberRunDiv').innerHTML = checkPointNumber + 1;
}


// setting and displaying the right mode related data.


function tourStart() {

    currentMode = 'tourModeRunning';
    showCorrectTourButton();

    tourRunning();
}

function tourFreeze() {
    currentMode = 'tourModeFrozen';
    showCorrectTourButton();
    freezeDisplayFor15();
}

function tourUnFreeze() {
    toggleFreezeDisplay();
    currentMode = 'tourModeRunning';
    showCorrectTourButton();
}



function showCorrectTourButton() {
    if (currentMode == 'tourModeNoStage') {
        tourStartBtn.style.display = 'none';
        tourFreezeBtn.style.display = 'none';
        tourUnFreezeBtn.style.display = 'none';
    }

    if (currentMode == 'tourModeWaiting') {
        tourStartBtn.style.display = 'inline-block';
        tourFreezeBtn.style.display = 'none';
        tourUnFreezeBtn.style.display = 'none';
    }

    if (currentMode == 'tourModeRunning') {
        tourFreezeBtn.style.display = 'inline-block';
        tourUnFreezeBtn.style.display = 'none';
        tourStartBtn.style.display = 'none';
    }

    if (currentMode == 'tourModeFrozen') {
        tourUnFreezeBtn.style.display = 'inline-block';
        tourStartBtn.style.display = 'none';
        tourFreezeBtn.style.display = 'none';
    }
}


function runFreeze() {
    currentMode = 'runModeFrozen';
    showCorrectRunButton();
    freezeDisplayFor15();
}

function runUnFreeze() {

    if (checkPointNumber == stageData.checkPoints.length - 1) {
        currentMode = 'tourModeRunning';
        showCorrectTourButton();
        showCorrectPanel();
        toggleFreezeDisplay();
    }
    else {
        currentMode = 'runModeRunning';
        showCorrectRunButton();
        toggleFreezeDisplay();
    }
}

function runFinish() {
    clearTimeout(freezeTimer);
    clearTimeout(advanceCheckPointTimer);
    clearTimeout(perfectTimeCountdownTimer);
    clearInterval(countdownInterval);


    toggleFreezeDisplay();
    currentMode = 'runModeFrozen';
    showCorrectRunButton();
}


function showCorrectRunButton() {
    if (currentMode == 'runModeFinishing') {
        runFinishBtn.style.display = 'inline-block';
        runFreezeBtn.style.display = 'none';
        runUnFreezeBtn.style.display = 'none';
    }

    if (currentMode == 'runModeRunning') {
        runFreezeBtn.style.display = 'inline-block';
        runUnFreezeBtn.style.display = 'none';
        runFinishBtn.style.display = 'none';
    }

    if (currentMode == 'runModeFrozen') {
        runUnFreezeBtn.style.display = 'inline-block';
        runFreezeBtn.style.display = 'none';
        runFinishBtn.style.display = 'none';
    }
}


function leaveSetupMode() {
    if (!loadStageData()) {
        alert("Error: Stage Data not loaded");
        return;
    }

    tolerance = Number.parseFloat(document.getElementById('tolerance').value);

    enterTourMode();
}

function enterSetupMode() {
    clearTimeout(freezeTimer);
    clearTimeout(advanceCheckPointTimer);
    clearTimeout(perfectTimeCountdownTimer);
    clearInterval(countdownInterval);

    currentMode = 'setupMode';
    showCorrectTourButton();
    showCorrectPanel();
}

function enterTourMode() {
    currentMode = stageNumber === '0' ? 'tourModeNoStage' : 'tourModeWaiting';
    showCorrectTourButton();

    updateStageAndCheckPoint();
    document.body.style.backgroundColor = '#ffa500';

    showCorrectPanel();
}

function enterRunMode() {
    currentMode = 'runModeRunning';
    showCorrectRunButton();
    showCorrectPanel();

    checkPointNumber = 0;
    advanceCheckPoint();
}


function tourRunning() {
    firstGPS = true;
    freezeDisplay = false;
    startTime = performance.now();
    lastTime = performance.now();
    distance = 0.00;
    actualSpeed = 0.00;
    avgSpeed = 0.00;

    countdownDiv.style.display = 'none';

    if (stageData.distance > 0.1) {
        enterRunMode();
    }
}

function showCorrectPanel() {
    if (currentMode === 'setupMode') {
        document.getElementById('setupDiv').style.display = 'block';
        document.getElementById('tourDiv').style.display = 'none';
        document.getElementById('runDiv').style.display = 'none';
    }
    if (isTourMode()) {
        document.getElementById('setupDiv').style.display = 'none';
        document.getElementById('tourDiv').style.display = 'block';
        document.getElementById('runDiv').style.display = 'none';
    }
    if (isRunMode()) {
        document.getElementById('setupDiv').style.display = 'none';
        document.getElementById('tourDiv').style.display = 'none';
        document.getElementById('runDiv').style.display = 'block';
    }
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

function updateClock() {
    document.getElementById('clock').innerHTML = new Date().toLocaleTimeString();
}

function isTourMode() {
    return currentMode.indexOf('tourMode') > -1;
}

function isRunMode() {
    return currentMode.indexOf('runMode') > -1;
}