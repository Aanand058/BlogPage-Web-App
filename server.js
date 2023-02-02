


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
  res.sendFile(path.join(__dirname, "views", "about.html"));
})


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


app.use((req, res) => {
  res.status(404).send("Sorry, Page Not Found");
});


// setup http server to listen on HTTP_PORT

blog.initialize().then(() => {
  app.listen(HTTP_PORT, onHttpStart);
})
  .catch(() => {
    console.log("Error Starting the Server. ");
  });

