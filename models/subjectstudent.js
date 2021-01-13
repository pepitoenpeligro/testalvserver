const mongoose = require('mongoose');


const SubjectStudentSchema = new mongoose.Schema(
{
        student : {
            type:String,
            trim:true,
            required:true,
            max:164
        },
        subjectName: {
            type:String,
        },
        token: {
            type:String,
            max:512
        },

        createdAt: { type: Date,  expires: '5m', default: Date.now }

}, {timestamps: true});




module.exports = mongoose.model('SubjectStudent', SubjectStudentSchema);