'use strict';

const tabs = require('angular-ui-bootstrap/src/tabs');
const {ipcRenderer} = require('electron');
const TimetableParser = require('../lib/timetable_parser');
const timetableParser = new TimetableParser();

angular.module('timeTableApp', [tabs]).controller('mainCtrl', ['$scope', '$http', ($scope, $http) => {
    let selectedPath;

    $scope.appTitle = 'Awesome timetable app';

    $scope.selectFile = function () {
        ipcRenderer.send('open-file-dialog');
    };

    $scope.saveFile = function () {
        if (selectedPath) {
            ipcRenderer.send('save-dialog');
        }
    };

    ipcRenderer.on('selected-file', function (event, paths) {
        let valid = true;
        selectedPath = paths[0];

        if (!selectedPath.endsWith('.xlsx') && !selectedPath.endsWith('.xls')) {
            valid = false;
            selectedPath = null;
        }

        $scope.$apply(function(){
            if (valid) {
                $scope.selectedFilePath = `You selected: ${selectedPath}`;
            } else {
                $scope.selectedFilePath = 'Supported only Excel files';
            }

            $scope.selectedSavePath = '';
        });
    });

    ipcRenderer.on('saved-file', function (event, path) {
        $scope.$apply(function(){
            $scope.selectedSavePath = path ? `File will be saved to: ${path}` : 'Save path was not selected, please try again';
        });

        if (path) {
            const json = timetableParser.process_timetable(selectedPath);
            export_json_to_file(json, path);
        }
    });

    function export_json_to_file(data, path) {
        const jsonfile = require('jsonfile');

        jsonfile.writeFile(path, data, {spaces: 4}, function (err) {
            if (err) {
                console.error(err);
            } else {
                console.log('result exported to file [export.json] in root directory');
            }
        })
    }

}]);