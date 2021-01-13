const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
    {
        name : {
            type:String,
            trim:true,
            required:true,
            max:164
        },
        email:{
            type: String,
            trim: true,
            required:true,
            lowecase:64
        },
        hashed_password: {
            type: String,
            required: true
        },
        salt: String,

        role: {
            type:String,
            default:'student'
        }





}, {timestamps: true});


userSchema
    .virtual('password')
    .set(function(password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashed_password = this.encryptPassword(password);
    })
    .get(function() {
        return this._password;
    });


userSchema.methods = {
    authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },

    encryptPassword: function(password) {
        if (!password) return '';
        try {
            return crypto
                .createHmac('sha1', this.salt)
                .update(password)
                .digest('hex');
        } catch (err) {
            return '';
        }
    },

    makeSalt: function() {
        return Math.round(new Date().valueOf() * Math.random()) + '';
    }
};
module.exports = mongoose.model('User', userSchema);