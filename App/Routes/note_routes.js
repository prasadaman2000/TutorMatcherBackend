var ObjectId = require('mongodb').ObjectId;
const fs = require('fs');

//var restaurant;
var stream = fs.createWriteStream('./log.txt', {
    flags: 'a'
});

function consoleLog(text) {
    console.log(text);
    stream.write("\n" + text);
}


module.exports = function(app, db) {
    app.post('/', (req, res) => {
        var body = req.body;

        if(body.todo == "login"){
            var query = {
                user: body.user,
                pass: body.pass
            }

            db.collection("tutors").findOne(query, (err, item) => {
                if(err){
                    console.log(err);
                    res.send(err);
                } else {
                    if(item == null){
                        db.collection("tutees").findOne(query, (err2,item2) => {
                            if(err){
                                res.send(err);
                                console.log(err);
                            } else {
                                if(item2 == null){
                                    var toSend = {
                                        message: "User not found",
                                        result: ""
                                    };
                                    console.log("user not found");
                                    res.send(tosend);
                                } else {
                                    var toSend = {
                                        message: "User found",
                                        result: item2
                                    };
                                    console.log("user found");
                                    res.send(toSend);
                                }
                            }
                        })
                    } else {
                        var toSend = {
                            message: "user found",
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
                var newTutor = {
                    fName: body.fName,
                    lName: body.lName,
                    email: body.email,
                    subjects: body.subjects,
                    user: body.user,
                    password: body.pass,
                    exp: body.exp,
                    desc: body.desc,
                    pay: body.pay,
                    available: body.available,
                    pic: body.pic,
                    type: "tutor"
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
        }

        else if(body.type == "tutee"){

        }

        res.send("you called the API!");
    });

        
};