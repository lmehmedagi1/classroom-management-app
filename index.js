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
app.listen(8080);