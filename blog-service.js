/*********************************************************************************
* WEB322 – Assignment 02
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.


    For better implementation and understanding I took reference from these sites:

    https://expressjs.com/en/starter/static-files.html

    https://www.youtube.com/watch?v=7H_QH9nipNs&t=2878s&ab_channel=CodeWithHarry 


*
* Name: Aanand Aman Student ID: 166125211 Date: 2023/02/03
*
* Cyclic Web App URL: https://drab-ruby-caterpillar-tux.cyclic.app/about
*
* GitHub Repository URL: https://github.com/Aanand058/web322-app
*
********************************************************************************/


const fs = require("fs");
const { resolve } = require("path");
const path = require("path");

//Global arrays holding json data
var posts = [];
var categories = [];




function initialize() {


    return new Promise((resolve, reject) => {
        //reading the posts.json 
        fs.readFile(path.join(__dirname, "/data/posts.json"), 'utf8', (err, data) => {
            if (err) { reject("Unable to read file"); }

            posts = JSON.parse(data);

        });


        //reading the categories.json
        fs.readFile(path.join(__dirname, "/data/categories.json"), 'utf8', (err, data) => {
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

        const publishedPosts = posts.filter(post => post.published === true);

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


//Work A3
function addPost(postData) {
    return new Promise((resolve, reject) => {
        if (postData.published === undefined) {
            postData.published = false;

        } else { postData.published = true; }

        postData.id = posts.length +1;

        posts.push(postData);
        resolve(postData);
    })

}

module.exports = { initialize, getPublishedPosts, getAllPosts, getCategories, addPost };
