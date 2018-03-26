const jsonfile = require('jsonfile');
const TimetableParser = require('../timetable_parser');
const timetableParser = new TimetableParser();
const path = require('path');
const pathToTestFile = path.resolve(__dirname, '../../../test_data/doc/2017_2018_Spring/Філософія 1 р.н. весна.docx');


timetableParser.process_timetable(pathToTestFile).then((result) => {
  jsonfile.writeFile(path.resolve(__dirname, './doc.json'), result, {spaces: 4}, function (err) {
    if (err) {
      console.error(err);
    } else {
      console.log('result exported to file doc.json');
    }
  });
});


