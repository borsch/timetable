'use strict';

const tabs = require('angular-ui-bootstrap/src/tabs');
const {ipcRenderer} = require('electron');
const TimetableParser = require('../lib/timetable_parser');
const timetableParser = new TimetableParser();
const FILE_TYPE_VALIDATION_REGEXP = /.*\.(xlsx|xls|doc|docx)$/;

const DAYS = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П`ятниця', 'П\'ятниця', 'Субота', 'Cубота', 'Неділя', 'Неділя '];
const TIME = ['8:30-9:50', '10:00-11:20', '11:40-13:00', '13:30-14:50', '15:00-16:20', '15.00-16.30', '16:30-17:50', '18:00-19:20'];

angular.module('timeTableApp', [tabs]).controller('mainCtrl', ['$scope', '$http', ($scope) => {
  let selectedPath;

  $scope.appTitle = 'Парсер розкладу';
  $scope.schedule = null;
  $scope.possibleClassesTime = TIME;
  $scope.possibleDay = DAYS;

  $scope.isDayHasLessonsAtTime = function (day, hour) {
    return !!day[hour];
  };

  $scope.selectFile = function () {
    ipcRenderer.send('open-file-dialog');
  };

  $scope.exportJson = function () {
    if (selectedPath) {
      ipcRenderer.send('save-dialog');
    }
  };

  $scope.reset_state = function() {
    $scope.schedule = null;
    $scope.selectedFilePath = null;
      $scope.selectedSavePath = null;
  };

  ipcRenderer.on('selected-file', function (event, paths) {
    let valid = true;
    selectedPath = paths[0];

    if (!FILE_TYPE_VALIDATION_REGEXP.test(selectedPath)) {
      valid = false;
      selectedPath = null;
    }

      if (valid) {
        try {
            timetableParser.process_timetable(selectedPath).then((json) => {
              if (json && json.length) {
                  $scope.$apply(function () {
                      $scope.selectedFilePath = `Ви вибрали: ${selectedPath}`;
                      $scope.schedule = prepare_exported_schedule(json);
                  });
              } else {
                  $scope.$apply(function () {
                      $scope.selectedFilePath = `Файли не містить розкладу або розклад неправильно форматований`;
                      $scope.schedule = null;
                  });
              }
            });
        } catch (e) {
            $scope.$apply(function () {
                $scope.selectedFilePath = `Файли не містить розкладу або розклад неправильно форматований`;
                $scope.schedule = null;
            });
        }
      } else {
        $scope.$apply(function () {
          $scope.selectedFilePath = 'Підтримується тільки формати файлів Word та Excel';
        });
      }

      $scope.selectedSavePath = '';
    });


  ipcRenderer.on('saved-file', function (event, path) {
    $scope.$apply(function () {
      $scope.selectedSavePath = path ? `Файл буде збережено в: ${path}` : 'Виберіть будь ласка місце, куди треба зберегти файл';
    });

    if (path) {
      const json = timetableParser.process_timetable(selectedPath).then((json) => {
        export_json_to_file(json, path);
      })
    }
  });

  function export_json_to_file(data, path) {
    const jsonfile = require('jsonfile');

    jsonfile.writeFile(path, data, {spaces: 4}, function () {
    });
  }

  function prepare_exported_schedule(json) {
    json.sort(function (a, b) {
      let cmp = DAYS.indexOf(a.day) - DAYS.indexOf(b.day);

      if (cmp !== 0)
        return cmp;

      return TIME.indexOf(a.time) - TIME.indexOf(b.time);
    });

    return json;
  }
}]);