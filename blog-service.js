/*********************************************************************************
* WEB322 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.

References: https://pressbooks.senecacollege.ca/web322/chapter/backend-core-development-node-js-express-module/
https://web322.ca/notes/week05 
https://cloudinary.com/blog/node_js_file_upload_to_a_local_server_or_to_the_cloud 
*
* Name: Aanand Aman Student ID: 166125211     Date: 2023/02/15
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


//****************Work A3 ***************************************
function addPost(postData) {     //Updated for A4
    return new Promise((resolve, reject) => {
        if (postData.published === undefined) {
            postData.published = false;

        } else { postData.published = true; }

        postData.id = posts.length + 1;
        postData.postDate = new Date().toISOString().slice(0,10);
        posts.push(postData);
        resolve(postData);
    })
}


function getPostsByCategory(category) {
    return new Promise((resolve, reject) => {
        const match = posts.filter(post => post.category == category);

        if (match.length == 0) {
            reject("No results returned");
        } else {
            resolve(match);
        }

    });

}


function getPostsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        const inputDate = posts.filter(post => new Date(post.postDate) >= new Date(minDateStr))

        if (inputDate.length == 0) {
            reject("No results returned");
        } else {
            resolve(inputDate);
        }
    });

}

function getPostById(id) {
    return new Promise((resolve, reject) => {
        const idValue = posts.find(post => post.id == id);

        if (idValue) {
            resolve(idValue);
        }
        else {
            reject("No result returned");
        }
    });
}




//**************** Work A4 ***************************************
function getPublishedPostsByCategory(category) {
    return new Promise((resolve, reject) => {
        const categoryId = parseInt(category);

        const publishedPostsByCategory = posts.filter(post => post.published === true && post.category === categoryId);

        if (publishedPostsByCategory.length > 0) {
            resolve(publishedPostsByCategory);
        }
        else { reject("no results returned"); }
    });
}


module.exports = { initialize, getPublishedPosts,getPublishedPostsByCategory, getAllPosts, getCategories, addPost, getPostsByCategory, getPostsByMinDate, getPostById };
