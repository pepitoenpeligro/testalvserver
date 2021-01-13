const User = require('../models/user')

const jwt = require('jsonwebtoken');

const expressJwt = require('express-jwt');




exports.signup = (req, res) => {

    const {name, email, password}  =req.body
    User.findOne({email: email}).exec( (err,user) => {
        if(user){
            return res.status(400).json({
                error: 'This email exists from other user'
            })
        }
    })


    let newUser = new User({name, email, password})

    newUser.save((err, success) => {
        if(err){
            return res.status(400).json({
                error: err
            })
        }

        res.json({
            message: 'Signup success',
            user: newUser
        })
    })
}


exports.signin = (req,res) => {
    const {email, password} = req.body

    User.findOne({email: email}).exec( (err, user) => {
        if(err || !user){
            return res.status(400).json({
                error: 'User with that email does not exist'
            })
        }

        if(!user.authenticate(password)){
            return res.status(400).json({
                error: 'Email and password do not match'
            })
        }


        const token = jwt.sign(
            {
                "aud":"my_server1",
                "iss":"my_web_client",
                "sub": "meet.jit.si",
                "room": "*"
            },
            process.env.JWT_SECRET,
            {expiresIn: '1d'}
        );

        const {_id, name, email, role} = user
        console.log("signin ", {_id, name, email, role});
        return res.status(200).json({
            token,
            user: {_id, name, email, role}
        });
    })
}


exports.requireSignin = expressJwt({
    secret: 'my_jitsi_app_secret'
})



exports.adminMiddleware = (req, res, next) => {
    User.findById({_id: req.user._id}).exec((err, usr) => {
        if(err || !user){
            return res.status(400).json({
                error: 'User not foud'
            })
        }

        if(user.role !=='admin'){
            return res.status(400).json({
                error: 'User is not authorized (required admin)'
            })
        }

        req.profile = user;
        next();
    })
}