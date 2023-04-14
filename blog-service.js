/*********************************************************************************
* WEB322 – Assignment 06
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.

References: https://pressbooks.senecacollege.ca/web322/chapter/backend-core-development-node-js-express-module/
https://web322.ca/notes/week06
https://cloudinary.com/blog/node_js_file_upload_to_a_local_server_or_to_the_cloud 
https://web322.ca/notes/week07 
*
* Name: Aanand Aman       Student ID: 166125211     Date: 2023/04/14
*
* Cyclic Web App URL: https://drab-ruby-caterpillar-tux.cyclic.app/
* GitHub Repository URL: https://github.com/Aanand058/web322-app
*
********************************************************************************/

//Sequelize Update A5

const Sequelize = require('sequelize');
const { gte } = Sequelize.Op;

// set up sequelize to point to our postgres database
var sequelize = new Sequelize('nxqmjlfo', 'nxqmjlfo', 'RH6UrzNIF5uWU02-yEG74KyhE6hS5wCJ', {
    host: 'suleiman.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});


// Creating Data Models
//Post
const Post = sequelize.define("Post", {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
});


// Category 
const Category = sequelize.define("Category", {
    category: Sequelize.STRING,
});

//belongsTo Relationship
Post.belongsTo(Category, { foreignKey: 'category' });





function initialize() {


    return new Promise((resolve, reject) => {
        sequelize
            .sync()
            .then(() => {
                resolve();
            })
            .catch(() => {
                reject("unable to sync the database");
            });

    })
}



function getAllPosts() {
    return new Promise((resolve, reject) => {
        Post.findAll()
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no results returned");
            });
    });
}

function getPublishedPosts() {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                published: true,
            },
        })
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no results returned");
            });
    });
}


function getCategories() {
    return new Promise((resolve, reject) => {
        Category.findAll()
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no results returned");
            });
    });
}


function addPost(postData) {     //Updated for A5
    return new Promise((resolve, reject) => {
        postData.published = postData.published ? true : false;

        for (const i in postData) {
            if (postData[i] === "") {
                postData[i] = null;
            }
        }
        postData.postDate = new Date();
        Post.create(postData)
            .then(() => {
                resolve();
            })
            .catch((err) => {
                reject("unable to create post");
            });
    });
}


function getPostsByCategory(category) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                category: category,
            },
        })
            .then((data) => {
                console.log(category);
                resolve(data);
            })
            .catch(() => {
                reject("no results returned");
            });
    });

}


function getPostsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                postDate: {
                    [gte]: new Date(minDateStr),
                },
            },
        })
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no results returned");
            });
    });

}

function getPostById(id) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                id: id,
            },
        })
            .then((data) => {
                resolve(data[0]);
            })
            .catch(() => {
                reject("No results returned");
            });
    });
}


//**************** Work A5 Updated... ***************************************
function getPublishedPostsByCategory(category) {
    return new Promise((resolve, reject) => {
        Post.findAll({
            where: {
                category: category,
                published: true,
            },
        })
            .then((data) => {
                resolve(data);
            })
            .catch(() => {
                reject("no results returned");
            });
    });
}



function addCategory(categoryData) {
    return new Promise((resolve, reject) => {

        if (categoryData.category == "") {
            categoryData.category = null;
        }

        Category.create(categoryData)
            .then((category) => {
                resolve("Operation was a success");
            })
            .catch(() => {
                reject("unable to create category");
            });
    });
}




function deleteCategoryById(id) {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: { id: id }
        }).then(resolve("Destroyed"));
    })
        .catch(() => {
            reject("Rejected");
        });
}


function deletePostById(id) {
    return new Promise((resolve, reject) => {
        Post.destroy({
            where: { id: id }
        }).then(resolve("Destroyed"));
    })
        .catch(() => {
            reject("Rejected");
        })
}

module.exports = { initialize, getPublishedPosts, addCategory, deletePostById, deleteCategoryById, getPublishedPostsByCategory, getAllPosts, getCategories, addPost, getPostsByCategory, getPostsByMinDate, getPostById };
