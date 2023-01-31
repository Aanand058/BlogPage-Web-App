


var express = require("express");
var app = express();

var HTTP_PORT = process.env.PORT || 8080;



// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}


app.use(express.static('public'));

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname + "/views/about.html"));
});  


