const mongoose = require('mongoose');


const ProfSubjectSchema = new mongoose.Schema(
{
        prof : {
            type:String,
            trim:true,
            required:true,
            max:164
        },
        subject: [String]

}, {timestamps: true});


module.exports = mongoose.model('ProfSubject', ProfSubjectSchema);