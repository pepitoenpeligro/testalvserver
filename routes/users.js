const express = require('express');
const router = express.Router();

const {requireSignin, adminMiddleware} = require('../controllers/auth')
const {read, generateroom, getsubjects, addsubject, addsubjectprofesor, addstudentinsubject, getstudents, sendEmail, studentgetsubjects, getunits, getunitslist} = require('../controllers/users');



router.get('/user/:id', requireSignin, read);

router.post('/generateroom', generateroom);
router.post('/addsubject', addsubject);
router.post('/getstudents', getstudents);
router.post('/addsubjectprofesor', addsubjectprofesor);
router.post('/addstudentinsubject', addstudentinsubject);
router.post('/sendEmail', sendEmail);

router.post('/units', getunits);
router.post('/units/list', getunitslist);


router.post('/user/getsubjects', getsubjects);

router.post('/user/student/subjects', studentgetsubjects);



module.exports = router;
