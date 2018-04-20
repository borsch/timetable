const TimetableExporter = require('../timetable_exporter');
const timetableExporter = new TimetableExporter();
const path = require('path');
const timetables = require( path.resolve(__dirname, '../../../test_data/timetables.json'));


timetableExporter.timetablesToXls(timetables, 'Timetables.xlsx');