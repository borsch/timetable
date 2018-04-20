const xl = require('excel4node');
const _ = require('lodash');

const internals = {
  NUMBER_OF_WEEKS: 15,
  DAYS: [
    'Понеділок',
    'Вівторок',
    'Середа',
    'Четвер',
    'П`ятниця',
    //'П\'ятниця',
    'Субота',
    //'Cубота',
    'Неділя',
    //  'Неділя '
  ],
  TIME: [
    '8:30-9:50',
    '10:00-11:20',
    '11:40-13:00',
    '13:30-14:50',
    '15:00-16:20',
    '15.00-16.30',
    '16:30-17:50', '18:00-19:20'
  ],
  CLASSROOMS: [
    '3 - 302',
    '3 - 220а',
    '10 - 4',
    '1 - 225',
    '1 - 307',
    '10 - 3',
    '1 - 108',
    '1 - 310',
    '1 - 112',
    '1 - 223',
    '3 - 220а'
  ]
};


class TimetableExporter {

  constructor() {
  }

  timetablesToXls(timetables, path) {
    const wb = new xl.Workbook();

    const ws = wb.addWorksheet('Sheet 1', {
      'sheetView': {
        'sheetFormat': {
          'defaultRowHeight': 200,
        }
      }
    });

    const style = wb.createStyle({
      font: {
        color: 'black',
        size: 12
      }
    });


    ws.cell(1, 4, 1, 3 + internals.NUMBER_OF_WEEKS, true).string('Тижні');

    ws.cell(2, 1).string('День, \nЧас');
    ws.column(1).setWidth(15);
    ws.cell(2, 2).string('Ауд');
    ws.column(2).setWidth(15);
    ws.cell(2, 3).string('Викладач');
    ws.column(3).setWidth(25);
    for (let i = 0; i < internals.NUMBER_OF_WEEKS; i++) {
      ws.column(i + 4).group(1);
      ws.cell(2, i + 4).string(`${i + 1} т.`).style(style);
      ws.column(i + 4).setWidth(20);
    }
    ws.row(2).setHeight(30);

    let timetableAll = [];
    internals.DAYS.forEach((day) => {
      internals.TIME.forEach((time) => {
        internals.CLASSROOMS.forEach((classRoom) => {
          const dayTimeEntries = [];

          timetables.forEach((timetable) => {
            timetable.schedule.forEach((schedule) => {
              const isRelated = schedule.day === day && schedule.time === time;
              if (isRelated) {
                const entry = {
                  classroom: schedule.classroom,
                  teacher: schedule.teacher,
                  type: schedule.type,
                  weeks_bool: schedule.weeks_bool,
                  group: schedule.type === 'лекція' ? '' : schedule.group
                };
                dayTimeEntries.push(entry);
              }
            });
          });

          const id = `${day}, \n${time}`;

          const dayTime = {
            id: `${day}, \n${time}`,
            day,
            time,
            classRoom,
            dayTimeEntries
          };
          timetableAll.push(dayTime);
        });
      });
    });

    timetableAll = _.uniqBy(timetableAll, 'id');

    let startRow = 3;
    for (let i = 0; i < timetableAll.length; i++) {

      const dayTime = timetableAll[i];
      const row = startRow;

      if (dayTime.dayTimeEntries.length) {
        ws.cell(row, 1, row + dayTime.dayTimeEntries.length, 1, true).string(dayTime.id);
        ws.cell(row, 2, row + dayTime.dayTimeEntries.length, 2, true).string(dayTime.classRoom);
        ws.row(row).setHeight(30 * dayTime.dayTimeEntries.length);

        for (let j = 0; j < dayTime.dayTimeEntries.length; j++) {

          ws.cell(row + j, 3).string(dayTime.dayTimeEntries[j].teacher);

          for (let k = 0; k < dayTime.dayTimeEntries[j].weeks_bool.length; k++) {
            if (dayTime.dayTimeEntries[j].weeks_bool[k]) {
              ws.cell(row + j, 4 + k).string(`${dayTime.dayTimeEntries[j].type} ${dayTime.dayTimeEntries[j].group} `);

            }
          }

          startRow += dayTime.dayTimeEntries.length;
        }
      } else {
        ws.cell(row, 1, row, 1, true).string(dayTime.id);
        ws.cell(row, 2, row, 2, true).string(dayTime.classRoom);
        ws.row(row).setHeight(30);
        startRow += 1;
      }

    }


    wb.write(path);
  }

}

module.exports = TimetableExporter;


/*
*
    timetableAll = _.uniqBy(timetableAll, 'id');

    let startRow = 3;
    for (let i = 0; i < timetableAll.length; i++) {

      const dayTime = timetableAll[i];
      const row = startRow;
      ws.cell(row, 1, row + dayTime.dayTimeEntries.length, 1, true).string(dayTime.id);
      ws.cell(row, 2, row + dayTime.dayTimeEntries.length, 2, true).string(dayTime.classRoom);
      ws.row(row).setHeight(30 * dayTime.dayTimeEntries.length);

      for (let j = 0; j < dayTime.dayTimeEntries.length; j++) {

        ws.cell(row + j, 3).string(dayTime.dayTimeEntries[j].teacher);

        for (let k = 0; k < dayTime.dayTimeEntries[j].weeks_bool.length; k++) {
          if (dayTime.dayTimeEntries[j].weeks_bool[k]) {
            ws.cell(row + j, 4 + k).string(`${dayTime.dayTimeEntries[j].type} ${dayTime.dayTimeEntries[j].group} `);

          }
        }

        startRow += dayTime.dayTimeEntries.length;
      }
    }

*
* */