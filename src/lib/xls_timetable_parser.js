const xlsx = require('node-xlsx').default;

const SUBJECT_TEACHER_REGEX = new RegExp(/^(.*)\s((ст. викл|доц|проф|ст.викл)\..*)$/);

module.exports = class XlsTimetableParser {

    parse(file_path) {
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
            last_time = sheet_data[0][1],
            max_len = this._max_row_length(sheet_data);

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


            if (max_len === 7 || max_len === 8) {
                let is_lecture = (row[4] + '').toLowerCase().trim() === 'лекція',
                    matches = row[2].match(SUBJECT_TEACHER_REGEX);

                if (matches) {
                    result.push({
                        day: row[0],
                        time: row[1],
                        subject: matches[1],
                        teacher: matches[2],
                        type: is_lecture ? 'лекція' : 'семінар/практика',
                        group: is_lecture ? null : row[3],
                        weeks: row[4],
                        classroom: row[5]
                    });
                } else {
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
            } else if (max_len === 6) {
                let is_lecture = (row[3] + '').toLowerCase().trim() === 'лекція',
                    subject = row[2],
                    teacher = row[2],
                    matches = row[2].match(SUBJECT_TEACHER_REGEX);

                if (matches) {
                    subject = matches[1];
                    teacher = matches[2];
                }

                result.push({
                    day: row[0],
                    time: row[1],
                    subject: subject,
                    teacher: teacher,
                    type: is_lecture ? 'лекція' : 'семінар/практика',
                    group: is_lecture ? null : row[3],
                    weeks: row[4],
                    classroom: row[5]
                });
            } else {
                throw new Error('Unsupported schedule type');
            }
        }

        return Promise.resolve(result);
    };

    _max_row_length(sheet_data) {
        let max_len = sheet_data[0].length;

        sheet_data.forEach(function(row){
            max_len = Math.max(row.length, max_len);
        });

        return max_len;
    }
};
