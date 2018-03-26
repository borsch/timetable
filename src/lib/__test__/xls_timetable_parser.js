const jsonfile = require('jsonfile');
const TimetableParser = require('../timetable_parser');
const timetableParser = new TimetableParser();
const path = require('path');
const pathToTestFile = path.resolve(__dirname, '../../../test_data/xls/example.xlsx');

timetableParser.process_timetable(pathToTestFile).then((result) => {
  jsonfile.writeFile(path.resolve(__dirname, './xls.json'), result, {spaces: 4}, function (err) {
    if (err) {
      console.error(err);
    } else {
      console.log('result exported to file xls.json');
    }
  });
});

