const fs = require('fs');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const port = 4000;

//Pull Depedencies
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cors());

//Check Server is Functioning
app.get('/', (req, res)=>{
    res.send("Welcome to your server")
});

//Handle Form Data
app.post('/json', (req, res)=>{
    var tokenMetadata = {
        "name": req.body.name, 
        "image": req.body.image,
        "description": req.body.description
    }
    var finalMeta = JSON.stringify(tokenMetadata);
    fs.writeFile(req.body.filepath, finalMeta, function(err, result){
        if(err){
            console.log("Error", err);
        } else {
            console.log("Successfully Uploaded");
        }
    }); 
});

//Specified Port
app.listen(port, ()=>{
    console.log(`Server is runing on port ${port}`)
});