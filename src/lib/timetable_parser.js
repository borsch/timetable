const XlsTimetableParser = require('./xls_timetable_parser');
const DocTimetableParser = require('./doc_timetable_parser');

module.exports = class TimetableParser {

  constructor() {
    this.xlsTimetableParser = new XlsTimetableParser();
    this.docTimetableParser = new DocTimetableParser();
    this.FILE_TYPE_PARSER_MAP = {
      'xls': this.xlsTimetableParser,
      'xlsx': this.xlsTimetableParser,
      'doc': this.docTimetableParser,
      'docx': this.docTimetableParser
    };
  }

  process_timetable(file_path) {
    const file_type = this._get_file_type(file_path);
    const parser = this._get_parser(file_type);
    let result = parser.parse(file_path);
    let self = this;

    result.then(function(schedule){
      schedule.forEach(function(subject){
        let classroom = subject.classroom,
            parts = classroom.split('-');

        subject.corps = parseInt(parts[0].trim());
        if (parts[1])
          subject.room = parseInt(parts[1].trim());

        subject.weeks_bool = self._process_weeks(subject.weeks);
      });

    });

    return result;
  }

  _get_file_type(file_path) {
    const typeRegExp = /(xlsx|xls|doc|docx)$/;
    return file_path.match(typeRegExp)[0];
  }

  _get_parser(file_type) {
    return this.FILE_TYPE_PARSER_MAP[file_type];
  }

  _process_weeks(weeks) {
    let result = [...Array(15)].map(() => 0),
        parts = weeks.toString().split(/[,\.]/);

      parts.forEach(function(part){
          if (part.indexOf('-') > -1) {
            part = part.replace('--', '-');
            let bounds = part.split('-');

            for (let i = parseInt(bounds[0]); i <= parseInt(bounds[1]); ++i) {
              result[i - 1] = 1;
            }
          } else {
            result[parseInt(part) - 1] = 1;
          }
      });

      return result;
  }
};
