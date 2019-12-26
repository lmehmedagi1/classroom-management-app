const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/',function(req,res){
    res.sendFile(__dirname + "/pocetna.html");
});
app.get('/pocetna',function(req,res){
    res.sendFile(__dirname + "/pocetna.html");
});
app.get('/sale',function(req,res){
    res.sendFile(__dirname + "/sale.html");
});
app.get('/unos',function(req,res){
    res.sendFile(__dirname + "/unos.html");
});
app.get('/rezervacija',function(req,res){
    res.sendFile(__dirname + "/rezervacija.html");
});
app.get('/zauzeca',function(req,res){
    res.sendFile(__dirname + "/zauzeca.json");
});
app.post('/zauzeca',function(req,res){
    console.log("DA LI OVDJE UDJE IKAD I ZASTO NE" + JSON.stringify(req.body));
    console.dir(req.body);

    fs.writeFile("zauzeca.json", JSON.stringify(req.body), function(err) {
        if(err) throw err;
        console.log("Novi red uspješno dodan!");
    });
    
    res.sendStatus(200);
    
});
app.get('/slike1',function(req,res){
    let slike = "";
    for (let i = 1; i < 4; i++) {
        slike += "<div><img src=\"slike/slika" + i + ".png\" alt=\"Slika\"></div>";
    }
    res.end(slike);
});
app.get('/slike2',function(req,res){

    let slike = "";
    for (let i = 4; i < 7; i++) {
        slike += "<div><img src=\"slike/slika" + i + ".png\" alt=\"Slika\"></div>";
    }
    res.end(slike);
});
app.get('/slike3',function(req,res){

    let slike = "";
    for (let i = 7; i < 10; i++) {
        slike += "<div><img src=\"slike/slika" + i + ".png\" alt=\"Slika\"></div>";
    }
    res.end(slike);
});
app.get('/slike4',function(req,res){
    let slike = "<div><img src=\"slike/slika10.png\" alt=\"Slika\"></div>";
    res.end(slike);
});
app.listen(8080);