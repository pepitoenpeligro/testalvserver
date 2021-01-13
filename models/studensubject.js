const mongoose = require('mongoose');


const StudentSubjectSchema = new mongoose.Schema(
{
        subject : {
            type:String,
            trim:true,
            required:true,
            max:164
        },
        students: [String]

}, {timestamps: true});


module.exports = mongoose.model('StudentSubject', StudentSubjectSchema);