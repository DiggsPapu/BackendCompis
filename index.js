var express = require('express');
var cors = require('cors');

var app = express();
app.use(cors());

const port = process.env.PORT || 4000;
app.listen(port, ()=>
    console.log("App listening on port 4000")
    );