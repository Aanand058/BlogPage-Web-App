
/*********************************************************************************
* WEB322 – Assignment 06
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.

References: https://pressbooks.senecacollege.ca/web322/chapter/backend-core-development-node-js-express-module/
https://web322.ca/notes/week06
https://cloudinary.com/blog/node_js_file_upload_to_a_local_server_or_to_the_cloud 
https://codepen.io/ckroll17/pen/MzWgLo (404.hbs)
https://web322.ca/notes/week07 
https://web322.ca/notes/week08
https://web322.ca/notes/week10


*
* Name: Aanand Aman        Student ID: 166125211     Date: 2023/04/14
*
* Cyclic Web App URL: https://drab-ruby-caterpillar-tux.cyclic.app
*
* GitHub Repository URL: https://github.com/Aanand058/web322-app
*
********************************************************************************/

const mongoose = require("mongoose");
//HAsing 
const bcrypt = require("bcryptjs");

//Creating Schema 
const Schema = mongoose.Schema;


var userSchema = new Schema({
    "userName": {
        "type": String,
        "unique": true
    },
    "password": String,
    "email": String,
    "loginHistory": [{
        "dateTime": Date,
        "userAgent": String
    }]
})

let User; // to be defined on new connection (see initialize)


function initialize() {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://aaman8:a1m2i3t4@web422draft1.geic9qi.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });

        db.on('error', (err) => {
            reject(err);   // reject the promise with the provided error

        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });

}


function registerUser(userData) {
    return new Promise((resolve, reject) => {
        if (userData.password !== userData.password2) {
            reject("Passwords do not match");
        } else {
            bcrypt
                .hash(userData.password, 10)
                .then((hash) => {
                    userData.password = hash;
                    let newUser = new User(userData);
                    newUser
                        .save()
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            if (err.code === 11000) {
                                reject("Username already taken");
                            } else {
                                reject(`There was an error creating the user: ${err}`);
                            }
                        });
                })
                .catch((err) => {
                    console.log(err);
                    reject("There was an error in encrpting");
                });
        }
    });
}

function checkUser(userData) {
    return new Promise((resolve, reject) => {
        User.find({ userName: userData.userName })
            .exec()
            .then((users) => {
                if (users.length === 0) {
                    reject(`Unable to find user: ${userData.userName}`);
                } else {
                    bcrypt
                        .compare(userData.password, users[0].password)
                        .then((result) => {
                            if (result === true) {
                                resolve(users[0]);
                            } else {
                                reject(`Incorrect Password : ${userData.userName}`);
                            }
                        });
                    users[0].loginHistory.push({
                        dateTime: new Date().toString(),
                        userAgent: userData.userAgent,
                    });
                    User.updateOne(
                        { userName: users[0].userName },
                        { $set: { loginHistory: users[0].loginHistory } },
                        { multi: false }
                    )
                        .exec()
                        .then(() => {
                            resolve(users[0]);
                        })
                        .catch((err) => {
                            reject(`There was an error verifying the user: ${err}`);
                        });
                }
            })
            .catch(() => {
                reject(`Unable to find user: ${userData.userName}`);
            });
    });
}

module.exports = { initialize, registerUser, checkUser};


