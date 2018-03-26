const mammoth = require("mammoth");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const cheerio = require('cheerio');
const tabletojson = require('tabletojson');

const internals = {
  mapping: {
    0: 'day',
    1: 'time',
    2: 'subjectTeacher',
    3: 'group',
    4: 'weeks',
    5: 'classroom'
  }
};

module.exports = class DocTimetableParser {

  parse(file_path) {
    return mammoth.convertToHtml({path: file_path})
      .then((result) => {
        const html = result.value; // The generated HTML
        const messages = result.messages; // Any messages, such as warnings during conversion


        let table = tabletojson.convert(html)[0];
        table = this._process(table);
        return table;
      });
  }

  _process(table) {
    table = this._mapKeys(table);

    table = this._fillGapsIn(table, 'day');
    table = this._fillGapsIn(table, 'time');
    table = this._fillGapsIn(table, 'subjectTeacher');

    // remove first and empty rows
    const titlesRow = table.shift();
    table = table.filter(r => r.subjectTeacher);

    table = this._defineLessonType(table);
    table = this._separateSubjectTeacher(table);

    return table;
  }

  _mapKeys(table) {
    return table.map((row) => {
      const keys = Object.keys(row);
      const n = keys.length;
      const diff = 6 - n;

      keys.forEach((key) => {
        key = Number(key);
        const newName = internals.mapping[key + diff];
        row[newName] = row[key];
        delete row[key];
      });

      return row;
    });

  }

  _fillGapsIn(table, propertyName) {

    for (let i = 1; i < table.length; i++) {

      if (table[i][propertyName]) {
        let j = i + 1;
        if (j === table.length) break;

        while (!table[j][propertyName]) {
          table[j][propertyName] = table[i][propertyName];
          j++;
          if (j === table.length) break;
        }
        i = j - 1;
      }

    }

    return table;
  }

  _separateSubjectTeacher(table) {
    return table.map(row => {
      if (row.group === 'лекція') {
        row.type = 'лекція';
        row.group = null;
      } else {
        row.type = 'семінар/практика';
      }
      return row;
    });
  }

  _defineLessonType(table) {


    return table.map(row => {
      const splitRegex = /^(.*)\s((ст. викл|доц)\..*)$/;
      const matches = row.subjectTeacher.match(splitRegex);

      if (matches.length > 3) {
        row.subject = matches[1];
        row.teacher = matches[2];

        delete row.subjectTeacher;
      }

      return row;
    });
  }

};
