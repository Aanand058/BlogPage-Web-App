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


const express = require("express");
const app = express();
const path = require("path");
const blog = require("./blog-service.js");

//Additional work for A3
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');


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
  res.redirect("/about");
});

//About page
app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/about.html"));
});


//  Blog Page 
app.get("/blog", (req, res) => {
  blog.getPublishedPosts()
    .then((data) => {
      res.send({ data })
    })
    .catch((err) => {
      res.send(err)
    });

})



//Cateories Page
app.get("/categories", (req, res) => {
  blog.getCategories().then((data) => {
    res.send({ data })
  })
    .catch((err) => {
      res.send(err)
    });
})



//Posts page (Updated A3)
app.get("/posts", (req, res) => {

  if (req.query.category) {                   //  /posts?catetogry=5
    blog.getPostsByCategory(req.query.category)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.send(err);
      });
  } else if (req.query.minDate) {              //  /posts?minDate=2020-12-01
    blog.getPostsByMinDate(req.query.minDate)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.send(err);
      });
  } else {
    blog.getAllPosts()
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.send(err);
      });
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


//Add post page redirect
app.get("/posts/add", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/addPost.html"));
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
      .catch(err =>  res.status(404).sendFile(__dirname + "/views/error.jpg"))

  }
});

//Error 404 Page
//Updated this part after class lec on feb 07 
app.use((req, res) => {
  res.status(404).sendFile(__dirname + "/views/error.jpg");
});



// setup http server to listen on HTTP_PORT with initialize() method
blog.initialize().then(() => {
  app.listen(HTTP_PORT, onHttpStart);
})
  .catch(() => {
    console.log("Error Starting the Server. ");
  });

