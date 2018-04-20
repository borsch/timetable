'use strict';

const tabs = require('angular-ui-bootstrap/src/tabs');
const {ipcRenderer} = require('electron');
const _ = require('lodash');

const TimetableParser = require('../lib/timetable_parser');
const timetableParser = new TimetableParser();
const TimetableExporter = require('../lib/timetable_exporter');
const timetableExporter = new TimetableExporter();
const database = require('../lib/database');

const FILE_TYPE_VALIDATION_REGEXP = /.*\.(xlsx|xls|doc|docx)$/;

const DAYS = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П`ятниця', 'П\'ятниця', 'Субота', 'Cубота', 'Неділя', 'Неділя '];
const TIME = ['8:30-9:50', '10:00-11:20', '11:40-13:00', '13:30-14:50', '15:00-16:20', '15.00-16.30', '16:30-17:50', '18:00-19:20'];

const timeTableApp = angular.module('timeTableApp', [tabs, 'datatables']).controller('mainCtrl', ['$scope', '$http', ($scope) => {
  let selectedPath;

  $scope.appTitle = 'Парсер розкладу';
  $scope.timetable = {};
  $scope.conflictsInTimetable = false;
  $scope.timetables = [];
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

  $scope.addTimetable = function () {
    if ($scope.ctrl.timetableFrom.$valid && $scope.schedule && !$scope.conflictsInTimetable) {
      $scope.timetable.schedule = $scope.schedule;
      $scope.timetables.push($scope.timetable);

      database.save_schedule([$scope.timetable]);
      //$scope.resetTimetableForm();
    }
  };

  $scope.doesConflicts = function (subject) {
    const sameSubjects = $scope.schedule.filter((another) => {
      const sumOfWeeks = _.zipWith(another.weeks_bool, subject.weeks_bool, function(a, b) {
        return a + b;
      });
      const doesWeeksOverlap = sumOfWeeks.filter(n => n > 1).length > 0;
      return another.day === subject.day
        && another.time === subject.time
        && another.subject === subject.subject
        && another.teacher === subject.teacher
        && another.classroom === subject.classroom
        && doesWeeksOverlap;
    });
    const doesConflicts = sameSubjects.length > 1;
    if (doesConflicts) {
      $scope.conflictsInTimetable = true;
      return true;
    }
    return false;
  };

  $scope.resetTimetableForm = function () {
    $scope.timetable = {};
    $scope.conflictsInTimetable = false;
    $scope.reset_state();
  };

  $scope.exportTimetables = function () {
    ipcRenderer.send('save-dialog');
  };

  ipcRenderer.on('selected-file', function (event, paths) {
    $scope.conflictsInTimetable = false;

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
            }).catch(function(){
              $scope.$apply(function () {
                $scope.selectedFilePath = `Файли не містить розкладу або розклад неправильно форматований`;
                $scope.schedule = null;
              });
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
      /*const json = timetableParser.process_timetable(selectedPath).then((json) => {
        export_json_to_file(json, path);
      })*/
      timetableExporter.timetablesToXls(_.cloneDeep($scope.timetables), path);
      //export_json_to_file($scope.timetables, );
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

timeTableApp.controller('smallPreview', function (DTOptionsBuilder, DTColumnDefBuilder) {
  var vm = this;
  vm.dtOptions = DTOptionsBuilder.newOptions()
    .withDisplayLength(2)
    .withDOM('pitrfl');
});