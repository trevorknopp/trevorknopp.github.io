// data loading and selecting

function uploadStageFile(e, callback) {
    var file = e.target.files[0]; 
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
        var contents = e.target.result;
        addFileContentsToLocalStorage(contents);
        callback();
    };
    reader.readAsText(file);
}


function addFileContentsToLocalStorage(contents) {
    try {
        let data = contents.split('\n').map((x) => {
            var pairs = x.split(',');
            return {
                name: pairs[0],
                value: pairs[1] ? pairs[1].split('\r')[0] : ''
            };
        });

        let stageData = {
            avgSpeed: data[1].value,
            distance: data[2].value,
            total: data[3].value,
            checkPoints: getCheckPoints(data)
        };

        localStorage.removeItem(data[0].value);
        localStorage.setItem(data[0].value, JSON.stringify(stageData));

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


function getStageDataFromLocalStorage(stageNumber) {
    let rawData = localStorage.getItem(stageNumber);
    if (rawData == null) {
        return null;
    }
  
    let stageData = JSON.parse(rawData);

    stageData.distance = Number.parseFloat(stageData.distance);
    stageData.total = Number.parseFloat(stageData.total);
    stageData.avgSpeed = Number.parseFloat(stageData.avgSpeed);
    for (let i = 0; i < stageData.checkPoints.length; i++) {
        stageData.checkPoints[i] = Number.parseFloat(stageData.checkPoints[i]);
    }

    return stageData;
}




function showStageDataInAlertBox() {

    let stageNumber = document.getElementById('stage-number').value;

    let stageData = getStageDataFromLocalStorage(stageNumber);
    let str = 'stage number: ' + stageNumber + '\n'
        + 'distance: ' + stageData.distance + '\n'
        + 'total: ' + stageData.total + '\n'
        + 'avgSpeed: ' + stageData.avgSpeed + '\n';

    for (let i = 0; i < stageData.checkPoints.length; i++) {
        str += stageData.checkPoints[i] + '\n';
    }

    alert(str);
}

function getAllDataFromLocalStorage() {
    let d = [];
    Object.keys(localStorage).forEach((element, key) => {
        d[key] = element;
    });
    return d;
}

export { uploadStageFile, getAllDataFromLocalStorage, getStageDataFromLocalStorage, showStageDataInAlertBox };