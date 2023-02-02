/*********************************************************************************
* WEB322 – Assignment 02
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.


    For better implementation and understanding I took reference from these sites:

    https://expressjs.com/en/starter/static-files.html

    https://www.youtube.com/watch?v=7H_QH9nipNs&t=2878s&ab_channel=CodeWithHarry 


*
* Name: Aanand Aman Student ID: 166125211 Date: 2023/02/02
*
* Cyclic Web App URL: ________________________________________________________
*
* GitHub Repository URL: ______________________________________________________
*
********************************************************************************/


const fs = require("fs");
const path = require("path");

//Global Variables 
let posts = [];
let categories = [];
let publishedPosts = [];



function initialize() {


    return new Promise((resolve, reject) => {
        //reading the posts.json 
        fs.readFile(path.join(__dirname + "/data/posts.json"), 'utf8', (err, data) => {
            if (err) { reject("Unable to read file"); }

            posts = JSON.parse(data);

        });


        //reading the categories.json
        fs.readFile(path.join(__dirname + "/data/categories.json"), 'utf8', (err, data) => {
            if (err) { reject("Unable to read file"); }

            categories = JSON.parse(data);
            resolve();

        });

    })
}



function getAllPosts() {
    return new Promise((resolve, reject) => {
        if (posts.length === 0) {
            reject("no results returned");
        }
        resolve(posts);
    });
}

function getPublishedPosts() {
    return new Promise((resolve, reject) => {
        posts.forEach((post) => {
            if (post.published === true) {
                publishedPosts.push(post);
            }
        })
        if (publishedPosts.length === 0) {
            reject("no results returned"
            );

        }
        resolve(publishedPosts);


    })
}


function getCategories() {
    return new Promise((resolve, reject) => {
        if (categories.length === 0) {
            reject("no results returned");
        }
        resolve(categories);
    })
}


module.exports = { initialize, getPublishedPosts, getAllPosts, getCategories };
