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

            let x2 = parseInt(zauzece.pocetak.replace(':', ''));
            let y2 = parseInt(zauzece.kraj.replace(':', ''));

            let parts = zauzece.datum.split('.');
            let year  = parseInt(parts[2], 10);
            let month = parseInt(parts[1], 10); 
            let day   = parseInt(parts[0], 10);

            if (day === dan && mjesec === month && year === godina && Math.max(x1, x2) < Math.min(y1, y2) && naziv === zauzece.naziv) {
                console.log("\n\n *** Sala je vec zauzeta *** \n\n");
                res.status(400).send(zauzeca);
                return;
            }
        }
        for (let i = 0; i < zauzeca.periodicna.length; i++) {

            let zauzece = zauzeca.periodicna[i];

            let x2 = parseInt(zauzece.pocetak.replace(':', ''));
            let y2 = parseInt(zauzece.kraj.replace(':', ''));

            let day = (new Date(godina, mjesec-1, dan)).getDay() - 1;
            if (day === -1)
                day = 6;

            if (naziv === zauzece.naziv && Math.max(x1, x2) < Math.min(y1, y2) && zauzece.dan == day && ( (zauzece.semestar == "zimski" && [1,10,11,12].includes(mjesec))  || (zauzece.semestar == "ljetni" && [2,3,4,5,6].includes(mjesec)) )) {
                console.log("\n\n *** Sala je vec zauzeta *** \n\n");
                res.status(400).send(zauzeca);
                return;
            }
        }

        zauzeca.vanredna.push(novo);

        // Sve ok
        fs.writeFile("zauzeca.json", JSON.stringify(zauzeca), function(err) {
            if(err) throw err;
            console.log("\n *** Sve je ok *** \n");
            res.status(200).send(zauzeca);
        });
    });
    
});
app.post('/zauzeca-periodicna',function(req,res){

    var novo = "";
    var vrijemeRegex = new RegExp("^((2[0-3]|[0][0-9]|1[0-9]):([0-5][0-9]))$");
    var danRegex = new RegExp("^([0-6])$");
    var sale = ["0-01", "0-02", "0-03", "0-04", "0-05", "0-06", "0-07", "0-08", "0-09", "1-01", "1-02", "1-03", "1-04", "1-05", "1-06", "1-07", "1-08", "1-09", "VA1", "VA2", "MA", "EE1", "EE2"]; 

    fs.readFile("zauzeca.json", function (err, data) {
        if (err) throw err;

        zauzeca = JSON.parse(data);

        // Da li je validan JSON format
        try {
            novo = JSON.parse(JSON.stringify(req.body));
        } catch (e) {
            console.log("\n\n *** Nisam uopste mogao parsirati zahtjev *** \n\n");
            res.status(400).send(zauzeca);
            return;
        }

        // Da li sadrzi sve potrebne kljuceve
        if (!novo.dan || !novo.semestar || !novo.pocetak || !novo.kraj || !novo.naziv || !novo.predavac || (Object.keys(novo)).length != 6) {
            console.log("\n\n *** Zahtjev ne sadrzi sve potrebe kljuceve *** \n\n");
            res.status(400).send(zauzeca);
            return;
        }

        // Da li vrijednosti u ispravnom obliku
        if (!vrijemeRegex.test(novo.pocetak) || !vrijemeRegex.test(novo.kraj) || !sale.includes(novo.naziv) || (novo.semestar != "zimski" && novo.semestar != "ljetni") || !danRegex.test(novo.dan)) {
            console.log("\n\n *** Vrijednosti nisu u ispravnom obliku *** \n\n");
            console.log("Pocetak je ispravan: " + vrijemeRegex.test(novo.pocetak) + " jer je pocetak: " + novo.pocetak + "\n");
            console.log("Kraj je ispravan: "    + vrijemeRegex.test(novo.kraj)    + " jer je kraj: "    + novo.kraj + "\n");
            console.log("Sala je ispravan: "    + sale.includes(novo.naziv)       + " jer je sala: "    + novo.naziv + "\n");
            console.log("Dan je ispravan: "     + danRegex.test(novo.dan)  + " jer je dan: "     + novo.dan + "\n");
            console.log("Semestar je ispravan: "+ !(novo.semestar != "zimski" && novo.semestar != "ljetni")   + " jer je semestar: "     + novo.semestar + "\n");
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

            if (year == new Date().getFullYear() && naziv === zauzece.naziv && Math.max(x1, x2) < Math.min(y1, y2) && dan == day && ( (semestar == "zimski" && [1,10,11,12].includes(month))  || (semestar == "ljetni" && [2,3,4,5,6].includes(month)) )) {
                console.log("\n\n *** Vec postoji vanredna zauzeta sala *** \n\n");
                res.status(400).send(zauzeca);
                return;
            }
        }

        for (let i = 0; i<zauzeca.periodicna.length; i++) {
            let zauzece = zauzeca.periodicna[i];

            let x2 = parseInt(zauzece.pocetak.replace(':', ''));
            let y2 = parseInt(zauzece.kraj.replace(':', ''));

            if (semestar == zauzece.semestar && dan == zauzece.dan && naziv == zauzece.naziv && Math.max(x1, x2) < Math.min(y1, y2)) {
                console.log("\n\n *** Vec postoji periodicna zauzeta sala *** \n\n");
                res.status(400).send(zauzeca);
                return;
            }

        }

        zauzeca.periodicna.push(novo);

        // Sve ok
        fs.writeFile("zauzeca.json", JSON.stringify(zauzeca), function(err) {
            if(err) throw err;
            console.log("\n *** Sve je ok *** \n");
            res.status(200).send(zauzeca);
            return;
        });
    });
    
});
app.get('/slike',function(req,res) {
    
    let slike = "";
    let indexTrenutneSlike = req.query['trenutna'];

    for (let i = 0; i < 3; i++) {
        indexTrenutneSlike++;
        if (fs.existsSync("slike/slika" + indexTrenutneSlike + ".png")) {
            slike += "<div><img src=\"slike/slika" + indexTrenutneSlike + ".png\" alt=\"Slika\"></div>";
        }
        else {
            indexTrenutneSlike--;
            res.status(220).send(slike);
            return;
        }
    }

    indexTrenutneSlike++;
    if (!fs.existsSync("slike/slika" + indexTrenutneSlike + ".png")) {
        res.status(220).send(slike);
        return;
    }

    res.status(200).end(slike);
});
app.listen(8080);