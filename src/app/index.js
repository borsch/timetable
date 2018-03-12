'use strict';

const tabs = require('angular-ui-bootstrap/src/tabs');
const {ipcRenderer} = require('electron');
const TimetableParser = require('../lib/timetable_parser');
const timetableParser = new TimetableParser();

angular.module('timeTableApp', [tabs])
  .controller('mainCtrl', ['$scope', '$http', ($scope, $http) => {

    $scope.appTitle = 'Awesome timetable app';

    $scope.selectFile = function () {
      console.log('log');
      ipcRenderer.send('open-file-dialog');
    };

    $scope.saveFile = function () {
      ipcRenderer.send('save-dialog');
    };

    let selectedPath;

    ipcRenderer.on('selected-file', function (event, paths) {
      selectedPath = paths[0];
      $scope.selectedFilePath = `You selected: ${selectedPath}`;
    });

    ipcRenderer.on('saved-file', function (event, path) {
      if (!path) path = 'No path';
      $scope.selectedSavePath = path ? `File will be saved to: ${path}` : 'Save path was not selected, please try again';
      if (path) {
        const json = timetableParser.process_timetable(selectedPath);
        export_json_to_file(json, path);
      }
    });

    //timetableParser.process_timetable(`${__dirname}/../../example.xlsx`);

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