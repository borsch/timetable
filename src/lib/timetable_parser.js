const XlsTimetableParser = require('./xls_timetable_parser');
const DocTimetableParser = require('./doc_timetable_parser');

module.exports = class TimetableParser {

  constructor() {
    this.xlsTimetableParser = new XlsTimetableParser();
    this.cocTimetableParser = new DocTimetableParser();
  }

  process_timetable(file_path) {
    const file_type = this._get_file_type(file_path);
    const parser = this._get_parser(file_type);
    return parser.parse(file_path);
  }

  _get_file_type(file_path) {
    const typeRegExp = /(xlsx|xls|doc|docx)$/;
    return file_path.match(typeRegExp)[0];
  }

  _get_parser(file_type) {
    const FILE_TYPE_PARSER_MAP = {
        'xls': this.xlsTimetableParser,
        'xlsx': this.xlsTimetableParser,
        'doc': this.cocTimetableParser,
        'docx': this.cocTimetableParser
    };
    return FILE_TYPE_PARSER_MAP[file_type];
  }
};
