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
app.post('/zauzeca-vanredna',function(req,res) {
    var novo = "";
    var datumRegex   = new RegExp("^((3[01]|[2][0-9]|1\\d|0\\d|\\d)\\.(1[0-2]|0[1-9]|[1-9])\\.\\d{4})$");
    var vrijemeRegex = new RegExp("^((2[0-3]|[0][0-9]|1[0-9]):([0-5][0-9]))$");
    var sale = ["0-01", "0-02", "0-03", "0-04", "0-05", "0-06", "0-07", "0-08", "0-09", "1-01", "1-02", "1-03", "1-04", "1-05", "1-06", "1-07", "1-08", "1-09", "VA1", "VA2", "MA", "EE1", "EE2"]; 


    fs.readFile("zauzeca.json", function (err, data) {
        if (err) throw err;

        zauzeca = JSON.parse(data);
        

        // Da li je validan JSON format
        try {
            console.log("Zahtjev: " + JSON.parse(JSON.stringify(req.body)));
            novo = JSON.parse(JSON.stringify(req.body));
            
        } catch (e) {
            console.log("\n\n *** Nisam uopste mogao parsirati zahtjev *** \n\n");
            res.status(400).send(zauzeca);
            return;
        }
        
        // Da li sadrzi sve potrebne kljuceve
        if (!novo.datum || !novo.pocetak || !novo.kraj || !novo.naziv || !novo.predavac || (Object.keys(novo)).length != 5) {
            console.log("\n\n *** Zahtjev ne sadrzi sve potrebne kljuceve *** \n\n");
            console.log("Zahtjev sadrzi datum: "    + novo.datum + "\n");
            console.log("Zahtjev sadrzi pocetak: "  + novo.pocetak + "\n");
            console.log("Zahtjev sadrzi kraj: "     + novo.kraj + "\n");
            console.log("Zahtjev sadrzi predavac: " + novo.predavac + "\n");
            console.log("Duzina: " + (Object.keys(novo)).length + "\n");
            console.log("Zahtjev: " + JSON.stringify(novo));
            res.status(400).send(zauzeca);
            return;
        }

        // Da li vrijednosti u ispravnom obliku
        if (!datumRegex.test(novo.datum) || !vrijemeRegex.test(novo.pocetak) || !vrijemeRegex.test(novo.kraj) || !sale.includes(novo.naziv)) {
            console.log("\n\n *** Vrijednosti nisu u ispravnom obliku *** \n\n");
            console.log("Datum je ispravan: "   + datumRegex.test(novo.datum)     + " jer je datum: "   + novo.datum + "\n");
            console.log("Pocetak je ispravan: " + vrijemeRegex.test(novo.pocetak) + " jer je pocetak: " + novo.pocetak + "\n");
            console.log("Kraj je ispravan: "    + vrijemeRegex.test(novo.kraj)    + " jer je kraj: "    + novo.kraj + "\n");
            console.log("Sala je ispravan: "    + sale.includes(novo.naziv)       + " jer je sala: "    + novo.naziv + "\n");
            res.status(400).send(zauzeca);
            return;
        }

        var datum   = novo.datum;
        var pocetak = novo.pocetak;
        var kraj    = novo.kraj;
        var naziv   = novo.naziv;
        
        var parts  = datum.split('.');
        var godina = parseInt(parts[2], 10);
        var mjesec = parseInt(parts[1], 10); 
        var dan    = parseInt(parts[0], 10);

        var x1 = parseInt(pocetak.replace(':', ''));
        var y1 = parseInt(kraj.replace(':', ''));

        // Da li je sala vec zauzeta
        for (let i = 0; i < zauzeca.vanredna.length; i++) {

            let zauzece = zauzeca.vanredna[i];

            var x2 = parseInt(zauzece.pocetak.replace(':', ''));
            var y2 = parseInt(zauzece.kraj.replace(':', ''));

            var parts = zauzece.datum.split('.');
            var year  = parseInt(parts[2], 10);
            var month = parseInt(parts[1], 10); 
            var day   = parseInt(parts[0], 10);

            if (day === dan && mjesec === month && year === godina && Math.max(x1, x2) < Math.min(y1, y2) && naziv === zauzece.naziv) {
                console.log("\n\n *** Sala je vec zauzeta *** \n\n");
                res.status(400).send(zauzeca);
                return;
            }
        }

        zauzeca.vanredna.push(novo);

        // Sve ok
        fs.writeFile("zauzeca.json", JSON.stringify(zauzeca), function(err) {
            if(err) throw err;
            res.status(200).send(zauzeca);
        });
    });
    
});
app.post('/zauzeca-periodicna',function(req,res){
    console.log("DA LI OVDJE UDJE IKAD I ZASTO NE" + JSON.stringify(req.body));
    console.dir(req.body);

    var novo = "";
    var vrijemeRegex = new RegExp("^((2[0-3]|[0][0-9]|1[0-9]):([0-5][0-9]))$");
    var sale = ["0-01", "0-02", "0-03", "0-04", "0-05", "0-06", "0-07", "0-08", "0-09", "1-01", "1-02", "1-03", "1-04", "1-05", "1-06", "1-07", "1-08", "1-09", "VA1", "VA2", "MA", "EE1", "EE2"]; 

    fs.readFile("zauzeca.json", function (err, data) {
        if (err) throw err;

        zauzeca = JSON.parse(data);

        // Da li je validan JSON format
        try {
            novo = JSON.parse(JSON.stringify(req.body));
        } catch (e) {
            res.status(400).send(zauzeca);
            return;
        }

        // Da li sadrzi sve potrebne kljuceve
        if (!novo.dan || !novo.semestar || !novo.pocetak || !novo.kraj || !novo.naziv || !novo.predavac || (Object.keys(novo)).length != 6) {
            res.status(400).send(zauzeca);
            return;
        }

        // Da li vrijednosti u ispravnom obliku
        if (!vrijemeRegex.test(novo.pocetak) || !vrijemeRegex.test(novo.kraj) || !sale.includes(novo.naziv) || (novo.semestar != "zimski" && novo.semestar != "ljetni") || !novo.dan.match("^\d{[1-99]$")) {
            res.status(400).send(zauzeca);
            return;
        }

        var dan      = novo.dan;
        var pocetak  = novo.pocetak;
        var kraj     = novo.kraj;
        var naziv    = novo.naziv;
        var semestar = novo.semestar;

        var x1 = parseInt(pocetak.replace(':', ''));
        var y1 = parseInt(kraj.replace(':', ''));

        // Da li je sala vec zauzeta
        for (let i = 0; i < zauzeca.vanredna.length; i++) {

            let zauzece = zauzeca.vanredna[i];

            let x2 = parseInt(zauzece.pocetak.replace(':', ''));
            let y2 = parseInt(zauzece.kraj.replace(':', ''));

            var parts = zauzece.datum.split('.');
            var year  = parseInt(parts[2], 10);
            var month = parseInt(parts[1], 10); 
            var day   = parseInt(parts[0], 10);

            datum = new Date(year, month-1, day);
            day   = datum.getDay() - 1;
            if (day === -1)
                day = 6;

            if (naziv === zauzece.naziv && Math.max(x1, x2) < Math.min(y1, y2) && dan == day) {
                res.status(400).send(zauzeca);
                return;
            }
        }

        for (let i = 0; i<zauzeca.periodicna.length; i++) {
            let zauzece = zauzeca.periodicna[i];

            let x2 = parseInt(zauzece.pocetak.replace(':', ''));
            let y2 = parseInt(zauzece.kraj.replace(':', ''));

            if (semestar == zauzece.semestar && dan == zauzece.dan && naziv == zauzece.naziv && Math.max(x1, x2) < Math.min(y1, y2)) {
                res.status(400).send(zauzeca);
                return;
            }

        }

        zauzeca.periodicna.push(novo);

        // Sve ok
        fs.writeFile("zauzeca.json", JSON.stringify(zauzeca), function(err) {
            if(err) throw err;
            res.status(200).send(zauzeca);
        });
    });
    
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