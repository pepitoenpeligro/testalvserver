const mongoose = require('mongoose');


const SubjectSchema = new mongoose.Schema(
{
        title : {
            type:String,
            trim:true,
            required:true,
            max:164
        }

}, {timestamps: true});


module.exports = mongoose.model('Subject', SubjectSchema);