// main engine starts here...


var nextCheckPointPeriod = 0;
var nextStagePeriod = 0;

var checkPointTimer = null;
var checkPointElapsedTime = 0;
var stageElapsedTime = 0;


function updateCheckPointSeconds() {
    checkPointElapsedTime += 1000;
    remainingCheckPointSecondsDiv.innerHTML = toTimeString(nextCheckPointPeriod - checkPointElapsedTime);
}

function updateStageSeconds() {
    stageElapsedTime += 1000;
    remainingStageSecondsDiv.innerHTML = toTimeString(nextStagePeriod - stageElapsedTime);
}


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

       

        let nextCheckPointDistance = stageData.checkPoints[checkPointNumber] - stageData.checkPoints[checkPointNumber - 1];
        nextCheckPointPeriod = (nextCheckPointDistance / stageData.avgSpeed) * 3600000;

        let nextStageDistance = stageData.checkPoints[stageData.checkPoints.length - 1];
        nextStagePeriod = (nextStageDistance / stageData.avgSpeed) * 3600000;

        updateStageAndCheckPoint();

        if (checkPointTimer != null) {
            clearTimeout(checkPointTimer);
        }

        checkPointElapsedTime = 0;

        checkPointTimer = setInterval(() => {
            updateCheckPointSeconds();
            updateStageSeconds();
        }, 1000);

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



function updateStageAndCheckPoint() {
    document.getElementById('stageNumberRunDiv').innerHTML = stageNumber;
    document.getElementById('checkPointNumberRunDiv').innerHTML = checkPointNumber + 1;
}

// setting and displaying the right mode related data.



function runFinish() {
    clearTimeout(advanceCheckPointTimer);
    clearTimeout(perfectTimeCountdownTimer);

    toggleFreezeDisplay();
}



function leaveSetupMode() {
    if (!loadStageData()) {
        alert("Error: Stage Data not loaded");
        return;
    }

    stageElapsedTime = 0;
    enterRunMode();
}

function enterSetupMode() {
    currentMode = 'setupMode';
    showCorrectPanel();
}


function enterRunMode() {
    currentMode = 'runModeRunning';
    showCorrectPanel();

    clearTimeout(advanceCheckPointTimer);

    checkPointNumber = 0;
    advanceCheckPoint();
}


function showCorrectPanel() {
    if (currentMode === 'setupMode') {
        document.getElementById('setupDiv').style.display = 'block';
        document.getElementById('runDiv').style.display = 'none';
    }
    if (currentMode === 'runModeRunning') {
        document.getElementById('setupDiv').style.display = 'none';
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
