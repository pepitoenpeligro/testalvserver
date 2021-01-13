const User = require('../models/user');
const ProfSubject = require('../models/ProfSubject');
const Subject = require('../models/subject');
const StudentSubject = require('../models/studensubject');
const SubjectStudent = require('../models/subjectstudent');
const Unit = require('../models/unit');

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const async = require('async');

const expressJwt = require('express-jwt');
const { restart } = require('nodemon');

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    secure: false,
    requireTLS: true,
    port: 587,
    auth: {
      user: 'dasgelbevomeisein@gmail.com',
      pass: 'Macios.35'
    }
});

exports.read = (req, res) => {
    const userId = req.params.id
    User.findById({_id: userId}).exec((err, user) => {
        if(err || !user){
            return res.status(400).json({
                error: 'User not found in DB'
            })
        }
        user.hashed_password=undefined;
        user.salt=undefined;
        res.status(200).json({
            user
        });
    })
}



exports.generateroom = (req, res) => {

    const userId = req.body.id
    const roomname = req.body.roomname



    User.findById({_id: userId}).exec((err, user) => {

        if(err || !user){
            return res.status(400).json({
                error: 'User not found in DB'
            })
        }

        user.hashed_password=undefined;
        user.salt=undefined;

        

        const token = jwt.sign(
            {
                context: {
                    user: {
                      avatar: "https:/gravatar.com/avatar/abc123",
                      name: user.name,
                      email: user.email
                    },
                  },
                "aud":"my_server1",
                "iss":"my_web_client",
                "sub": "meet.jit.si",
                "room": roomname
            },
            process.env.JWT_SECRET || 'my_jitsi_app_secret',
            {expiresIn: '5m'}
        );
        console.log("El toke que le envio:", {
            context: {
                user: {
                  avatar: "https:/gravatar.com/avatar/abc123",
                  name: user.name,
                  email: user.email
                },
              },
            "aud":"my_server1",
            "iss":"my_web_client",
            "sub": "meet.jit.si",
            "room": roomname
        },
        process.env.JWT_SECRET || 'my_jitsi_app_secret',
        {expiresIn: '5m'} )
        const domain ='https://jitsipepe.com/' + roomname + '?jwt='+token 

        if(user.role==='student'){

            let subjectstudent = new SubjectStudent({student:user._id, subjectName: roomname, token: token})
            subjectstudent.save().then((result) => {

                res.status(200).json({
                    result
                })

            }).catch((err) => {
                res.status(400).json({
                    err
                })
            })

            
        }

        res.status(200).json({
            user,
            domain: 'https://jitsipepe.com/' + roomname + '?jwt='+token 
        });
    })
}






exports.getsubjects = (req, res) => {
    const userId = req.body.id;
    getSubjects(userId, res);

}




async function getSubjects(userId, res){
    let subjectList = []
    let prom = Promise.all(
        [
            await ProfSubject.find({prof: userId}).exec().then(async(response) => {

                for(const f of response){
                    for(const a of f.subject){
                        Promise.all([await  Subject.findById({_id: a}).exec().then((response) => {
                            subjectList.push(response);
                        })

                    ])
                    }
                }
            })
        ]
    ).then(function(value){

        return res.status(200).json({
            subjectList
        })
    }).catch((err)=>{
        return res.status(400).json({
            err
        });
    })
}



exports.addsubject = (req, res) => {
    const subjectName = req.body.subjectname;

    let newSubject = new Subject({title:subjectName});
    newSubject.save(function (err, s){
        if(err){
            console.log(err);
            return res.status(400).json(
                err
            )
        }
        return res.status(200).json({
            data: 'Subject inserted'
        });
    }).catch((err) => {
        return res.status(400).json({
            err
        });
    })
    
}

exports.addsubjectprofesor = (req, res) => {
    const subjectname = req.body.subjectname;
    const email = req.body.email;
    let idProfesor = null;
    let idAsignatura = null;


    const promiseSearchProfesor = Promise.all([User.find({email: email}).exec()]);
    promiseSearchProfesor.then((resultado) => {

        idProfesor = resultado[0][0].id;
    }).catch((err) => {
        return res.status(400).json({
            err
        });
    })


    const promiseSearchSubject = Promise.all([Subject.find({title: subjectname}).exec()])

    promiseSearchSubject.then((resultado) => {


        idAsignatura = resultado[0][0].id;
        
        const promiseInsertProfesorSubject = Promise.all([ProfSubject.findOneAndUpdate({prof: idProfesor},  {$addToSet: {subject: idAsignatura}}  ).exec()]);

        promiseInsertProfesorSubject.then((resultado) => {

            //let updateProfSubject = new ProfSubject(resulado[0][0])
            if(resultado){
                return res.status(200).json({
                    resultado
                })
            }else{
                return res.status(400).json({
                    err: 'addsubjectprofesor insert error db'
                })
            }
        }).catch((err)=> {
            return res.status(400).json({
                err
            });
        })
        
    }).catch((err)=>{
        return res.status(400).json({
            err
        });
    })
    

    

    // res.status(500).json({
    //     err: 'errooooor'
    // })
}


exports.addstudentinsubject = (req, res) => {
    const receiveData = {
        email : req.body.email,
        subject : req.body.subjectname
    }
    
    let userId = null;
    let subjectId = null;
    const promiseSearchUser = Promise.all([User.find({email: receiveData.email}).exec()]);

    promiseSearchUser.then((resultUser) => {
        const promiseSearchSubject = Promise.all([Subject.find({title: receiveData.subject}).exec()]);
        
        userId = resultUser[0][0]._id;

        promiseSearchSubject.then((resultSubject) => {
            subjectId = resultSubject[0][0]._id


            
            

            const promiseBuscarSiExistia = Promise.all([StudentSubject.find({subject:subjectId }).exec()]).then((resultBus) => {
                
                if(resultBus.length[0] === null){
                    
                    let ss = new StudentSubject({subject: subjectId, students: [userId]})
                    ss.save();
                    res.status(200).json({
                        subjectId,
                        userId,
                        msg: 'User added in subject'
                    })
                }else{
                    const promiseInsert = Promise.all([StudentSubject.findOneAndUpdate({subject:subjectId }, {$addToSet: {students: userId}}, { upsert: true }   ).exec()])
                    promiseInsert.then((insertResult) => {

                        return res.status(200).json({
                            insertResult,
                            subjectId,
                            userId,
                            msg: 'User added in subject'
                        })
                    }).catch((err)=>{
                        return res.status(400).json({
                            err
                        });
                    })

                }
            }).catch((err) => {
                return res.status(400).json({
                    err
                });
            })






            
            //
            
        }).catch((err)=>{
            return res.status(400).json({
                err
            });
        })
    }).catch((err) => {
        return res.status(400).json({
            err
        });
    })
    

}

exports.getstudents = (req, res) =>{
    const receivedValues = {
        idSubject : req.body.idSubject
    }
    const users = [];


    let promiseSearchUsers  = Promise.all([StudentSubject.find({subject: receivedValues.idSubject}).exec()]);
    promiseSearchUsers.then(async (results) => {

        let cont = 0;
        for(const s of results[0][0].students){
            let promiseSearchUsersinDB =  Promise.all(await[  User.findById({_id: s}).exec()])
            promiseSearchUsersinDB.then(async (u) => {
                let newUser = {
                    _id: u[0]._id,
                    email: u[0].email,
                    name: u[0].name
                }

                users.push(newUser);
                cont++;
                if(cont == results[0][0].students.length){
                    return res.status(200).json({
                        subjectId: receivedValues.idSubject,
                        users
                    });
                }
            }).catch((err)=> {
                return res.status(400).json({
                    err
                });
            })
        }
    }).catch((err)=>{
        return res.status(400).json({
            err
        });
    })
}


exports.sendEmail= (req,res)=>{
    
    let mailOptions = {
        from: 'dasgelbevomeisein@gmail.com',
        to: req.body.email,
        subject: 'Lesson ' + req.body.content,
        html: "<a href=\"" + req.body.link + "\">Lesson here!</p>"
    };

    transporter.sendMail(mailOptions, function(error, info){
        console.log("Email" , error);
        if (error) {
          return res.status(400).json({
              error
          })
        } else {
          return res.status(200).json({
              msg:'email sendet'
          });
        }
      });
    
}

exports.studentgetsubjects = (req, res) => {
    console.log("[studentgetsubjects]", req.body);
    let listSubject = [];
    
    let promSubStud = Promise.all([SubjectStudent.find({student: req.body.id}).exec()])
    promSubStud.then((response) => {
        let cont = 0;

        for(const s of response[0]){

            listSubject.push(s)
            cont++;
            
            if(response[0].length == cont){

                return res.status(200).json({
                    listSubject
                })
            }
            
        }
    })

}


// exports.getunits = (req,res ) => {
//     console.log("Obteniendo unidades");
//     let listUnidades = [];

//     let promesaBuscarUnidades = Promise.all([Unit.find().exec()])
//     promesaBuscarUnidades.then((response) => {
//         let cont  = 0;
//         for(const s of response[0]){
//             listUnidades.push(s)
//             cont++;
//             if(response[0].length == cont){
//                 console.log("Enviando: ", listUnidades)
//                 return res.status(200).json({
//                     listUnidades
//                 })
//             }
//         }
//     })



// }

exports.getunits = (req, res) => {
    console.log("Obteniendo unidad por name", req.body.name);
    let identificador= req.body.name;
    let listUnidades = [];

    let promesaBuscarUnidades = Promise.all([Unit.find({name: identificador}).exec()])
    promesaBuscarUnidades.then((response) => {
        console.log("Buscando", response)
        let cont  = 0;
        for(const s of response[0]){
            listUnidades.push(s)
            cont++;
            if(response[0].length == cont){
                console.log("Enviando: ", listUnidades)
                return res.status(200).json({
                    listUnidades
                })
            }
        }
    }).catch((error) => {
        console.log("Error buscando");
    })

}


exports.getunitslist = (req, res) => {
    console.log("Server -> ", "Pidiendo lista de unidades disponible");
    let listUnidadesName = [];
    let promesaBuscarUnidades = Promise.all([Unit.find({}).exec()])
    promesaBuscarUnidades.then((response) => {
        let cont = 0;
        for(const s of response[0]){
            listUnidadesName.push(s['name']);
            cont++;
            if(response[0].length == cont){
                return res.status(200).json({
                    listUnidadesName
                })
            }
        }
    }).catch((error) => {
        console.log("Error al buscar las unidades");
    })
}