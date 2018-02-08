const xlsx = require('node-xlsx').default;

module.exports = class TimetableParser {

  process_timetable(file_path) {
    const full_file = xlsx.parse(file_path);
    let sheet_data = full_file[0].data;

    // assume that part of excel, where schedule is located
    // starting from 10 row
    sheet_data.splice(0, 10);

    let result = [],
      // not all records contains day and time
      // if not, this means that the row time and day
      // the same as the previous
      last_day = sheet_data[0][0],
      last_time = sheet_data[0][1];

    for (let i = 0; i < sheet_data.length; ++i) {
      let row = sheet_data[i];

      if (!row[0]) {
        row[0] = last_day;
      } else {
        last_day = row[0];
      }

      if (!row[1]) {
        row[1] = last_time;
      } else {
        last_time = row[1];
      }

      if (!row[2]) {
        // empty row
        continue;
      }

      let is_lecture = (row[4] + '').toLowerCase().trim() === 'лекція';

      result.push({
        day: row[0],
        time: row[1],
        subject: row[2],
        teacher: row[3],
        type: is_lecture ? 'лекція' : 'семінар/практика',
        group: is_lecture ? null : row[4],
        weeks: row[5],
        classroom: row[6]
      });
    }

    console.log(result);
    return result;
  }
};
