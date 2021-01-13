const express = require('express');
const router = express.Router();

const {signup, signin} = require('../controllers/auth');

const {userSignupValidator, userSigninValidator} = require('../validators/auth');
const {runValidation} = require('../validators/index');


router.post('/signup', userSignupValidator, runValidation, signup);
router.post('/signin', userSigninValidator, runValidation, signin);



module.exports = router;
