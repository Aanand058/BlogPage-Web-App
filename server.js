
const express = require("express");
const app = express();
const path = require("path");
const blog = require("./blog-service.js");


const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');



const exphbs = require('express-handlebars');
const stripJs = require('strip-js');



const authData = require("./auth-service");
const clientSessions = require("client-sessions");



//Port Config
const HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}



//Upload Variable
const upload = multer(); // no { storage: storage } since we are not using disk storage

//Cloudinary Config
cloudinary.config({
  cloud_name: "djrbzdre4",
  api_key: "838424883527942",
  api_secret: "TAPjsXQmU5wXg9kd7w3HqyMMQgQ",
  secure: true,
});

app.use(express.static('public'));


//Setting up client sessions
app.use(clientSessions({
  cookieName: "session", // this is the object name that will be added to 'req'
  secret: "web322_A6_Aanand", // this should be a long un-guessable string.
  duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
  activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
}));


//Middleware 
app.use(function (req, res, next) {
  res.locals.session = req.session;
  next();
});


//Middleware checking authentication
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    next();
  }
}





app.use(express.urlencoded({ extended: true }));

// Register handlebars as the rendering engine for views
app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));



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
    },
    formatDate: function (dateObj) {
      let year = dateObj.getFullYear();
      let month = (dateObj.getMonth() + 1).toString();
      let day = dateObj.getDate().toString();
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }


  }
}));
app.set('view engine', '.hbs');


//This will add the property "activeRoute" to "app.locals" whenever the route changes,
app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
});



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
app.get("/categories", ensureLogin, (req, res) => {
  blog.getCategories()
    .then((data) => {
      data.length > 0 ? res.render("categories", { categories: data }) : res.render("categories", { message: "No results" });
    })
    .catch((err) =>
      res.render("categories", { message: "no results" }))
})



///categories/add
app.get("/categories/add", ensureLogin, (req, res) => {
  res.render("addCategory");
});


///categories/add (POST)
app.post("/categories/add", ensureLogin, (req, res) => {
  blog.addCategory(req.body)
    .then(() => {
      res.redirect('/categories');

    }).catch(console.log("Unable to Add category"))
});


///categories/delete/:id
app.get("/categories/delete/:id", ensureLogin, (req, res) => {
  blog.deleteCategoryById(req.params.id)
    .then(() => {
      res.redirect("/categories");
    })
    .catch(() => {

      res.status(500).send('Unable to Remove Category / Category not found');
    });
});



///posts/delete/:id
app.get("/posts/delete/:id", ensureLogin, (req, res) => {
  blog.deletePostById(req.params.id)
    .then(() => {
      res.redirect("/posts");
    })
    .catch(() => {

      res.status(500).send(' Category not found');
    });
});


//Posts page 
//  /posts?catetogry=5
//  /posts?minDate=2020-12-01 

app.get("/posts", ensureLogin, (req, res) => {
  if (req.query.category) {
    blog.getPostsByCategory(req.query.category)
      .then((data) => {
        data.length > 0 ? res.render("posts", { posts: data }) : res.render("posts", { message: "No results" });
      })
      .catch((err) =>
        res.render("posts", { message: "No results" }));
  }

  else if (req.query.minDate) {
    blog.getPostsByMinDate(req.query.minDate)
      .then((data) => {
        data.length > 0 ? res.render("posts", { posts: data }) : res.render("posts", { message: "No results" });
      })
      .catch((err) =>
        res.render("posts", { message: "No results" }));
  }

  else {
    blog.getAllPosts()
      .then((data) => {
        data.length > 0 ? res.render("posts", { posts: data }) : res.render("posts", { message: "No results" });
      })
      .catch((err) =>
        res.render("posts", { message: "No results" }));
  }
});





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



//getPostbyid                           //  /post/3
app.get("/post/:id", ensureLogin, (req, res) => {
  blog.getPostById(req.params.value)
    .then((data) => {
      res.send(data)
    })
    .catch((err) => {
      res.send(err);
    });
})


//Add post page redirect
app.get("/posts/add", ensureLogin, (req, res) => {
  blog.getCategories()
    .then((data) => {
      res.render('addPost', {
        categories: data
      });
    }).catch(() => {
      res.render('addPost'), { categories: [] }
    })
});


//Add post POST 
app.post("/posts/add", ensureLogin, upload.single("featureImage"), (req, res, next) => {
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





//GET/login
app.get("/login", (req, res) => {
  res.render("login");
});

//GET/register 
app.get("/register", (req, res) => {
  res.render("register");
});


//POST/register
app.post("/register", (req, res) => {
  authData.registerUser(req.body)
    .then(() => {
      res.render('register', { successMessage: 'User created' });
    })
    .catch((err) => {
      res.render('register', { errorMessage: err, userName: req.body.userName });
    });
});



//POST/login
app.post("/login", (req, res) => {
  req.body.userAgent = req.get('User-Agent');
  authData.checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory
      };
      res.redirect('/posts');
    })
    .catch((err) => {
      res.render('login', { errorMessage: err, userName: req.body.userName });
    });
});


// Get/logout
app.get("/logout", (req, res) =>{
  req.session.reset();
  res.redirect("/");
});


// GET/userHistory
app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory");
})


//Error 404 Page
//Updated for A4 (used custom HTML and CSS) 
app.use((req, res) => {
  res.status(404).render("404");
});


// setup http server to listen on HTTP_PORT with initialize() method 
blog.initialize()
  .then(authData.initialize)
  .then(function () {
    app.listen(HTTP_PORT, function () {
      console.log("app listening on: " + HTTP_PORT)
    });
  }).catch(function (err) {
    console.log("unable to start server: " + err);
  });