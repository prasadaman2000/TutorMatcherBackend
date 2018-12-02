var ObjectId = require('mongodb').ObjectId;
const fs = require('fs');
var nodemailer = require('nodemailer');

module.exports = function(app, db) {
    app.post('/', (req, res) => {
        var body = req.body;

        if(body.todo == "login"){
            var query = {
                user: body.user,
                password: body.password
            }
            //console.log(body.user);
            db.collection("tutors").findOne(query, (err, item) => {
                if(err){
                    console.log(err);
                    res.send(err);
                } else {
                    console.log(item);
                    if(item == null){
                        db.collection("tutees").findOne(query, (err2,item2) => {
                            if(err){
                                res.send(err);
                                console.log(err);
                            } else {
                                if(item2 == null){
                                    var toSend = {
                                        message: "failure",
                                        result: ""
                                    };
                                    console.log("user not found");
                                    res.send(query);
                                } else {
                                    var toSend = {
                                        message: "success",
                                        result: item2
                                    };
                                    console.log("user found");
                                    res.send(toSend);
                                }
                            }
                        })
                    } else {
                        var toSend = {
                            message: "success",
                            result: item
                        }

                        console.log('user found');

                        res.send(toSend);
                    }
                }
            })
            return;
        }

        if(body.type == "tutor"){
            consoleLog("a tutor call was made!");

            if(body.todo == "signup"){
                var subjectArray = [];

                var word = "";

                for(var i = 0; i < body.subjects.length; i++){
                    if(body.subjects.charAt(i) != " " || i == body.subjects.length - 1){
                        word += body.subjects.charAt(i);
                    } else {
                        subjectArray.push(word);
                        word = "";
                    }
                }
                var newTutor = {
                    fName: body.fName,
                    lName: body.lName,
                    email: body.email,
                    subjects: subjectArray,
                    user: body.user,
                    password: body.password,
                    exp: body.exp,
                    desc: body.desc,
                    pay: body.pay,
                    available: body.available,
                    pic: body.pic,
                    type: "tutor",
                    requests: [],
                    matches: []
                }

                db.collection("tutors").insert(newTutor, (err, result) => {
                    if(err){
                        console.log(err);
                        var toSend = {
                            result: err
                        }
                        res.send(toSend);
                    } else {
                        console.log("successful tutor signup");
                        var toSend = {
                            message: "success",
                            result: newTutor
                        }
                        res.send(toSend);
                    }
                })
                return;
            }

            else if(body.todo == "getMatches"){
                db.collection("tutors").findOne({user: body.user}, (err, item) => {
                    if(err){
                        console.log(err);
                        res.send({message: "failure", result: null});
                    } else {
                        console.log("got tutor");
                        res.send(item.requests);
                    }
                })
                return;
            }
        }

        else if(body.type == "tutee"){
            if(body.todo == "signup"){
                var subjectArray = [];

                var word = "";

                for(var i = 0; i < body.subjects.length; i++){
                    if(body.subjects.charAt(i) != " "){
                        word += body.subjects.charAt(i);
                    } else {
                        subjectArray.push(word);
                        word = "";
                    }
                }
                var newTutor = {
                    fName: body.fName,
                    lName: body.lName,
                    email: body.email,
                    subjects: subjectArray,
                    user: body.user,
                    password: body.password,
                    //exp: body.exp,
                    desc: body.desc,
                    //pay: body.pay,
                    available: body.available,
                    pic: body.pic,
                    type: "tutee",
                    requests: [],
                    matches: [],
                    declined: []
                }

                db.collection("tutees").insert(newTutor, (err, result) => {
                    if(err){
                        console.log(err);
                        var toSend = {
                            result: err
                        }
                        res.send(toSend);
                    } else {
                        console.log("successful tutor signup");
                        var toSend = {
                            message: "success",
                            result: newTutor
                        }
                        res.send(toSend);
                    }
                })
                return;
            }

            else if(body.todo == "findByKeyword"){
                db.collection("tutees").find({user: body.user}, (err, item) => {
                    if(err){
                        console.log(err);
                        res.send(err);
                    } else {
                        db.collection("tutors").find({}).toArray((err, result) => {
                        if(err){
                            console.log("error in finding all tutors");
                            res.send({message: "error", result: null});
                        } else {
                            var retArr = [];
                            for(var i in result){
                                for(var j in result[i].subjects){
                                    if(result[i].subjects[j] == body.keyword){
                                        retArr.push(result[i]);
                                    }
                                }
                            }
                            res.send({message: "success", result: retArr});
                            return;
                        }
                    })
                }
                })
                return;
            }

            else if(body.todo == "getMatches"){
                db.collection("tutees").findOne({user: body.user}, (err, item) => {
                    if(err){
                        console.log(err);
                        res.send({message: "failure", result: null});
                    } else {
                        console.log("got tutee");
                        res.send({message: "success", result: item.requests});
                    }
                })
                return;
            }

            else if(body.todo == "swipeRight"){
                db.collection('tutees').findOne({user: body.tutee}, (err, tutee) => {
                    if(err){
                        console.log(err);
                        var toSend = {
                            message: "error in finding tutee",
                            result: null
                        }
                        //res.send(toSend);
                    } else {
                        db.collection('tutors').findOne({user: body.tutor}, (err, tutor) => {
                            if(err){
                                console.log(err);
                                var toSend = {
                                    message: "error in finding tutor",
                                    result: null
                                }
                                //res.send(toSend);
                            } else {
                                tutor.requests.push(body.tutee);
                                tutee.requests.push(body.tutor);
                                console.log(tutor.user);

                                tutor._id = ObjectId(tutor._id);

                                var tutorSearch = {
                                    _id: tutor._id
                                }

                                var tuteeSearch = {
                                    _id: tutee._id
                                }

                                db.collection('tutors').update(tutorSearch, tutor, (err, response) => {
                                    if(err){
                                        console.log(err);
                                        var toSend = {
                                            message: 'error in updating tutor',
                                            result: err
                                        }
                                        res.send(toSend);
                                        return;
                                    } else {
                                        console.log("added request to tutor");
                                        var toSend = {
                                            message: 'success',
                                            result: null
                                        }
                                        //res.sent(toSend);
                                    }
                                })

                                db.collection('tutees').update(tuteeSearch, tutee, (err, response) => {
                                    if(err){
                                        console.log(err);
                                        var toSend = {
                                            message: 'error in updating tutee',
                                            result: err
                                        }
                                        return;
                                    } else {
                                        console.log("added request to tutee");
                                    }
                                })

                                res.send({message: "success", result: ""});
                            }
                        })
                    }
                })
                return;
            }

            else if(todo == "decline"){
                db.collection("tutees").findOne({user: body.user}, (err, item) =>{
                    if(err){
                        console.log("could not find that user");
                        res.send(err);
                    } else {
                        item.declined.push(body.tutor);
                        res.send({message: "success", result: ''});
                    }
                })
                return;
            }
        }

        res.send({message:"failure", result: null});
    });

        
};