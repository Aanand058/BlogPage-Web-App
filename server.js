/*********************************************************************************
* WEB322 – Assignment 02
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.


    For better implementation and understanding I took reference from these sites:

    https://expressjs.com/en/starter/static-files.html

    https://www.youtube.com/watch?v=7H_QH9nipNs&t=2878s&ab_channel=CodeWithHarry 

    https://www.freepik.com/free-vector/hand-drawn-404-error_1587422.htm#query=404%20not%20found&position=3&from_view=keyword 


*
* Name: Aanand Aman Student ID: 166125211 Date: 2023/02/02
*
* Cyclic Web App URL: https://drab-ruby-caterpillar-tux.cyclic.app/about
*
* GitHub Repository URL: ______________________________________________________
*
********************************************************************************/ 


const express = require("express");
const app = express();
const path = require("path");
const blog = require("./blog-service.js");


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


app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname , "/views/about.html"));
});


//  Blog Page 
app.get("/blog", (req, res) => {
  blog.getPublishedPosts()
  .then((data)=>{
    res.send({data})
  })
  .catch((err)=>{
    res.send(err)
  });
 
})



//Cateories Page
app.get("/categories", (req, res) => {
  blog.getCategories().then((data)=>{
    res.send({data})
  })
  .catch((err)=>{
    res.send(err)
  });
})



//Posts page
app.get("/posts", (req, res) => { 
  blog.getAllPosts().then((data)=>{
    res.send({data})
  })
  .catch((err)=>{
    res.send(err)
  });
 })


//Error 404 Page
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname , "/views/about.html"));
});


// setup http server to listen on HTTP_PORT
blog.initialize().then(() => {
  app.listen(HTTP_PORT, onHttpStart);
})
  .catch(() => {
    console.log("Error Starting the Server. ");
  });

