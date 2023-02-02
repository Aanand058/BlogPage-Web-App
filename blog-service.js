


const fs = require("fs");
const path = require("path");

//Global Variables 
let posts = [];
let categories = [];
let published = [];

function initialize() {


    return new Promise((resolve, reject) => {
        //reading the posts.json 
        fs.readFile(path.join(__dirname + "/data/posts.json"), 'utf8', (err, data) => {
            if (err) { reject("Unable to read file"); }

            posts = JSON.parse(data);

        });


        //reading the categories.json
        fs.readFile(path.join(__dirname + "/data/categories.json"), 'utf8', (err, data) =>{
            if(err){reject("Unable to read file");}

            categories = JSON.parse(data);
            resolve();

        });
    
    })
}



function getAllPosts(){
    return new Promise((resolve,reject) => {
        if(posts.length === 0){
            reject("no results returned");
        }
        resolve(posts);
    });
}

function getPublishedPosts(){
    return new Promise((resolve,reject)=>{
        posts.forEach((post)=>{
            if(post.published === true){
                published.push(post);
            }
        })
        if(published.length === 0){
            reject("no results returned"
            );

        }
        resolve(published);


    })
}


function getCategories(){
    return new Promise((resolve,reject)=>{
        if(categories.length ===0){
            reject("no results returned");
        }
        resolve(categories);
    })
}


module.exports = { initialize, getPublishedPosts, getAllPosts, getCategories };
