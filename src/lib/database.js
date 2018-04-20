const db = require('seraph')({
    pass: 'neo'
});
const model = require('seraph-model');

const Teacher = model(db, 'teacher');
const Faculty = model(db, 'faculty');
const Subject = model(db, 'subject');
const Auditorium = model(db, 'auditorium');
const Group = model(db, 'group');

module.exports.save_schedule = function(schedules){
    schedules.forEach(function(schedule){
        let faculty = {
            name: schedule.faculty
        };

        Faculty.save(faculty, async function(error, faculty_s){
            let group_promise = await new Promise(function(resolve){
                Group.save({speciality: schedule.speciality, yearOfStudy: schedule.yearOfStudy}, (error, saved) => resolve(saved));
            });

            let auditoriums = {};
            let teachers = {};

            db.relate(faculty_s, 'belongs', group_promise, function(){});

            schedule.schedule.forEach(async function(item){
                let teacher_promise = teachers[item.teacher];
                if (!teacher_promise) {
                    teachers[item.teacher] = {name: item.teacher};

                    teacher_promise = await new Promise(function (resolve) {
                        Teacher.save(teachers[item.teacher], (error, saved) => {
                            if (saved) {
                                teachers[item.teacher].id = saved.id;
                                db.relate(faculty_s, 'belongs', saved, function () {
                                    resolve(saved);
                                });
                            }
                        });
                    });
                }

                let auditorium_promise = auditoriums[item.classroom];
                if (!auditorium_promise) {
                    auditoriums[item.classroom] = {corps: item.corps, room: item.room};

                    auditorium_promise = await new Promise(function(resolve){
                        Auditorium.save(auditoriums[item.classroom], (error, saved) => {
                            if (saved) {
                                auditoriums[item.classroom].id = saved.id;
                                db.relate(faculty_s, 'belongs', saved, function(){
                                    resolve(saved);
                                });
                                auditoriums[item.classroom] = saved;
                            }
                        })
                    });
                }


                let subject_promise = await new Promise(function(resolve){
                    Subject.save(
                        {name: item.subject, weeks: item.weeks_bool, time: item.time, day: item.day},
                        (error, saved) => resolve(saved)
                    );
                });

                db.relate(subject_promise, 'learn', group_promise, {group: item.group}, function(){
                    db.relate(subject_promise, 'teach', teacher_promise, function(){
                        db.relate(subject_promise, 'location', auditorium_promise, function(){});
                    });
                });
            });
        });
    });
};