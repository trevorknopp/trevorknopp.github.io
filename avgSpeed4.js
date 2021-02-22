// main engine starts here...


function updateDisplayData() {
    //When the checkpoint advances, the “next distance” should be the 
    // new checkpoint distance from the start minus the Distance Travelled.

    let perfectStageTime = (stageData.distance / stageData.avgSpeed) * 3600000;
    let elapsedStageTime = performance.now() - startTime;
    let remainingStageTime = perfectStageTime - elapsedStageTime;
    remainingStageTimeDiv.innerHTML = toTimeString(remainingStageTime);

    let elapsedCheckPointTime = performance.now() - previousCheckPointTime;
    let remainingCheckPointTime = nextCheckPointPeriod - elapsedCheckPointTime;
    remainingCheckPointTimeDiv.innerHTML = toTimeString(remainingCheckPointTime);

}


var countdownInterval = null;



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


    enterRunMode();
}

function enterSetupMode() {
    clearTimeout(advanceCheckPointTimer);
    clearTimeout(perfectTimeCountdownTimer);

    currentMode = 'setupMode';
    showCorrectPanel();
}


function enterRunMode() {
    currentMode = 'runModeRunning';
    showCorrectRunButton();
    showCorrectPanel();

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
