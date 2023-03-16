/*********************************************************************************
* WEB322 – Assignment 04
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.

References: https://pressbooks.senecacollege.ca/web322/chapter/backend-core-development-node-js-express-module/
https://web322.ca/notes/week06
https://cloudinary.com/blog/node_js_file_upload_to_a_local_server_or_to_the_cloud 
https://codepen.io/ckroll17/pen/MzWgLo (404.hbs)
*
* Name: Aanand Aman Student ID: 166125211     Date: 2023/03/15
*
* Cyclic Web App URL: https://drab-ruby-caterpillar-tux.cyclic.app/about
*
* GitHub Repository URL: https://github.com/Aanand058/web322-app
*
********************************************************************************/


const express = require("express");
const app = express();
const path = require("path");
const blog = require("./blog-service.js");

//Additional work for A3
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');


//Additional work for A4
const exphbs = require('express-handlebars');
const stripJs = require('strip-js');




// Register handlebars as the rendering engine for views
app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');

//This will add the property "activeRoute" to "app.locals" whenever the route changes,
app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});


//Helper 
app.engine('.hbs', exphbs.engine({
  extname: '.hbs',
  helpers: {
    navLink: function (url, options) {
      return '<li' +
        ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
        '><a href="' + url + '">' + options.fn(this) + '</a></li>';
    },
    equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    },
    safeHTML: function (context) {
      return stripJs(context);
    }

  }
}));



//Cloudinary Config
cloudinary.config({
  cloud_name: "djrbzdre4",
  api_key: "838424883527942",
  api_secret: "TAPjsXQmU5wXg9kd7w3HqyMMQgQ",
  secure: true,
});

//Upload Variable
const upload = multer(); // no { storage: storage } since we are not using disk storage



//Port Config
const HTTP_PORT = process.env.PORT || 8080;
app.use(express.static('public'));

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}


//About redirect 
app.get("/", (req, res) => {
  res.redirect("/blog");
});


//About page
app.get("/about", (req, res) => {
  res.render("about");
});


//  Blog Page Updated for A4
app.get('/blog', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try {

    // declare empty array to hold "post" objects
    let posts = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await blog.getPublishedPostsByCategory(req.query.category);
    } else {
      // Obtain the published "posts"
      posts = await blog.getPublishedPosts();
    }

    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // get the latest post from the front of the list (element 0)
    let post = posts[0];

    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts;
    viewData.post = post;

  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await blog.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData })

});



//Cateories Page
app.get("/categories", (req, res) => {
  blog.getCategories()
    .then((data) => res.render("categories", { categories: data }))
    .catch((err) => res.render("categories", { message: "no results" }))
})



//Posts page (Updated A4)
//  /posts?catetogry=5
//  /posts?minDate=2020-12-01 

app.get("/posts", (req, res) => {    //Update needed
  if (req.query.category) {
    blog.getPostsByCategory(req.query.category)
      .then((data) => res.render("posts", { posts: data }))
      .catch((err) => res.render("posts", { message: "No results" }));
  }

  else if (req.query.minDate) {
    blog.getPostsByMinDate(req.query.minDate)
      .then((data) => res.render("posts", { posts: data }))
      .catch((err) => res.render("posts", { message: "No results" }));
  }

  else {
    blog.getAllPosts()
      .then((data) => res.render("posts", { posts: data }))
      .catch((err) => res.render("posts", { message: "No results" }));
  }
});






//getPostbyid                           //  /post/3
app.get("/post/:value", (req, res) => {
  blog.getPostById(req.params.value)
    .then((data) => {
      res.send(data)
    })
    .catch((err) => {
      res.send(err);
    });
})

app.get('/blog/:id', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try {

    // declare empty array to hold "post" objects
    let posts = [];

    // if there's a "category" query, filter the returned posts by category
    if (req.query.category) {
      // Obtain the published "posts" by category
      posts = await blog.getPublishedPostsByCategory(req.query.category);
    } else {
      // Obtain the published "posts"
      posts = await blog.getPublishedPosts();
    }

    // sort the published posts by postDate
    posts.sort((a, b) => new Date(b.postDate) - new Date(a.postDate));

    // store the "posts" and "post" data in the viewData object (to be passed to the view)
    viewData.posts = posts;

  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the post by "id"
    viewData.post = await blog.getPostById(req.params.id);
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await blog.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", { data: viewData })
});



//Add post page redirect
app.get("/posts/add", (req, res) => {
  res.render("addPost");
});


//Add post POST 
app.post("/posts/add", upload.single("featureImage"), (req, res, next) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };
    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }
    upload(req).then((uploaded) => {
      processPost(uploaded.url);
    });
  } else {
    processPost("");
  }
  function processPost(imageUrl) {
    req.body.featureImage = imageUrl;
    blog.addPost(req.body)
      .then(post => res.redirect("/posts"))
      .catch(err => res.status(404).sendFile(__dirname + "/views/error.jpg"))

  }
});

//Error 404 Page
//Updated this part after class lec on feb 07 
app.use((req, res) => {
  res.status(404);
  res.render("404");
});



// setup http server to listen on HTTP_PORT with initialize() method
blog.initialize().then(() => {
  app.listen(HTTP_PORT, onHttpStart);
})
  .catch(() => {
    console.log("Error Starting the Server. ");
  });

