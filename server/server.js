const fs = require('fs');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const port = 3000;

//Pull Depedencies & Allow Static Elements
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cors());
app.use('/staticScript', express.static('../client/js'));
app.use('/staticImg', express.static('../client/img'));
app.use('/staticCss', express.static('../client/css'));
app.use('/staticBuild', express.static('../blockchain/build/contracts'));
app.use("/staticJson", express.static('./json'));

//Serve WebApplication Page(s)
app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, '../client/index.html'));
});
app.get('/market.html', (req, res)=>{
    res.sendFile(path.join(__dirname, '../client/market.html'));
});

//Handle POST Form Data
app.post('/staticJson', (req, res)=>{
    var tokenMetadata = {
        "name": req.body.name, 
        "image": req.body.image,
        "description": req.body.description
    }
    var finalMeta = JSON.stringify(tokenMetadata);
    var filename = req.body.filename;
    var filepath = "./json/" + filename;
    fs.writeFile(filepath, finalMeta, function(err, result){
        if(err){
            console.log("Error", err);
        } else {
            console.log("Successfully Uploaded");
        }
    }); 
});

//Set Port Listener
app.listen(port, ()=>{
    console.log(`Server is runing on port ${port}`)
});