


const express = require("express");
const app = express();


const HTTP_PORT = process.env.PORT || 8080;

const path = require("path");

app.use(express.static('public')); 

const blog= require("./blog-service.js");


// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}




//About redirect 
app.get("/", (req,res) => {
    res.redirect("/about");
  });

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "about.html"));
})


// ========== Blog Page Route ==========
app.get("/blog", (req, res) => {
    res.send("TODO: get all posts who have published==true");
  })

app.get("/categories", (req,res)=> {
    res.send("Todo: ");
})


app.get("/categories", (req,res)=>{
    req.send("todo: ");
})


app.get("/posts", (req,res)=>{res.send("TODO: ")})


app.use((req, res) => {
    res.status(404).send("Sorry, Page Not Found");
  });


// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);