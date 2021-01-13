const mongoose = require('mongoose');


const unitSchema = new mongoose.Schema(
    {
        name : {
            type:String,
            trim:true,
            required:true,
            max:164
        },
        questions:[{
            question:String,
            answers:[String],
            correct:Number      
        }]
}, {timestamps: true});



module.exports = mongoose.model('unit', unitSchema);