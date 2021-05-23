// main engine starts here...

import * as DataAccess from './avgSpeed4Data.js';

var nextCheckPointPeriod = 0;
var nextStagePeriod = 0;

var checkPointTimer = null;
var checkPointElapsedTime = 0;
var stageElapsedTime = 0;

var currentMode = '';

let versionDiv = document.getElementById('versionDiv');
versionDiv.innerHTML = appVersion;


document.getElementById('file-input').addEventListener('change', e => DataAccess.uploadStageFile(e, updateStageListDropDown), false);
document.getElementById('stage-number').addEventListener('change', updateStageNumber, false);

let remainingCheckPointSecondsDiv = document.getElementById('remainingCheckPointSecondsDiv');
let remainingStageSecondsDiv = document.getElementById('remainingStageSecondsDiv');


let stageNumber = '0';
let checkPointNumber = 1;

let freezeDisplay = false;
let stageData = null;


enterSetupMode();
updateStageListDropDown();


function updateStageNumber() {
    stageNumber = document.getElementById('stage-number').value;
    stageData = DataAccess.getStageDataFromLocalStorage(stageNumber);
}


function setStageVars() {
    let nextCheckPointDistance = stageData.checkPoints[checkPointNumber + 1] - stageData.checkPoints[checkPointNumber];
    nextCheckPointPeriod = (nextCheckPointDistance / stageData.avgSpeed) * 3600000;

    let nextStageDistance = stageData.checkPoints[stageData.checkPoints.length - 1];
    nextStagePeriod = (nextStageDistance / stageData.avgSpeed) * 3600000;

    document.getElementById('stageNumberRunDiv').innerHTML = stageNumber;
    document.getElementById('checkPointNumberRunDiv').innerHTML = checkPointNumber + 1;
    document.getElementById('avgSpeedDiv').innerHTML =  round2dp(stageData.avgSpeed);
}


function updateDisplay() {
    let timeDiff = nextCheckPointPeriod - checkPointElapsedTime;
    remainingCheckPointSecondsDiv.innerHTML = toTimeString(timeDiff);

    remainingCheckPointSecondsDiv.style.backgroundColor = timeDiff >= 10000
        ? 'black'
        : timeDiff > 0
            ? 'red'
            : 'green';

    remainingStageSecondsDiv.innerHTML = toTimeString(nextStagePeriod - stageElapsedTime);

}


function doAdvanceCheckPoint() {
    checkPointElapsedTime = 0;

    if (checkPointNumber < stageData.checkPoints.length) {
        checkPointNumber++;

        if (checkPointNumber == stageData.checkPoints.length) {
            clearTimeout(checkPointTimer);
            return;
        }

        setStageVars();
    }
}

var checkPointTimer = null;

function startStage() {
    setStageVars();
    updateDisplay();

    checkPointTimer = setInterval(() => {

        checkPointElapsedTime += 1000;
        stageElapsedTime += 1000;

        if (checkPointElapsedTime >= nextCheckPointPeriod + 5000) {
            doAdvanceCheckPoint();
        }

        if (!freezeDisplay) {
            updateDisplay();
        }


    }, 1000);

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
        updateDisplay();  // don't wait for timer!
    }
}

// setting and displaying the right mode related data.




function leaveSetupMode() {

    updateStageNumber();

    if (stageData == null) {
        alert("Error: Stage Data not loaded");
        return;
    }

    enterRunMode();
}

function enterSetupMode() {
    currentMode = 'setupMode';
    showCorrectPanel();
}


function enterRunMode() {
    currentMode = 'runModeRunning';
    showCorrectPanel();

    clearTimeout(checkPointTimer);

    checkPointNumber = 0;
    stageElapsedTime = 0;
    checkPointElapsedTime = 0;

    startStage();
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


function updateStageListDropDown() {
    var s = document.getElementById('stage-number');

    // make a drop down option for each stage
    let d = DataAccess.getAllDataFromLocalStorage();
    d.forEach((element, key) => {
        s[key] = new Option(element, element);
    });
}


// utility functions

function toTimeString(ms) {

    let negative = ms < 0;
    if (negative) {
        ms = -ms;
    }

    var hours = Math.floor(ms / 3600000);
    var minutes = Math.floor((ms - (hours * 3600000)) / 60000);
    var seconds = Math.round((ms - (hours * 3600000) - (minutes * 60000)) / 1000);

    
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

function showStageDataInAlertBox() {
    DataAccess.showStageDataInAlertBox();
}

export { toggleFreezeDisplay, leaveSetupMode, enterSetupMode, showStageDataInAlertBox };
