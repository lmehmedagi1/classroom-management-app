const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const db = require('./db.js');
const Op = db.Sequelize.Op

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/',function(req,res){
    res.sendFile(__dirname + "/pocetna.html");
});
app.get('/zauzeca',function(req,res){
    db.sequelize.query("SELECT o.ime as \"ime\", o.prezime as \"prezime\", o.uloga as \"uloga\", s.naziv as \"naziv\", t.redovni as \"redovni\", t.dan as \"dan\", t.datum as \"datum\", t.semestar as \"semestar\", TIME_FORMAT(t.pocetak, '%H:%i') as \"pocetak\", TIME_FORMAT(t.kraj, '%H:%i') as \"kraj\" " +
                       "FROM osobljes o, salas s, termins t, rezervacijas r " +
                       "WHERE r.termin = t.id and r.sala = s.id and r.osoba = o.id ", { type: db.sequelize.QueryTypes.SELECT})
        .then(rezervacije => {
            res.send(rezervacije);
            return new Promise(function(resolve,reject) {resolve(rezervacije);});
    });
});
app.get('/sale', function(req,res) {
    db.sala.findAll().then(function (user) {
        res.send(user);
        return new Promise(function(resolve,reject) {resolve(user);});
    }).error(function (err) {
        console.log("Error:" + err);
        throw err;
    });
});
app.get('/osoblje', function(req,res) {
    db.osoblje.findAll().then(function (user) {
        res.send(user);
        return new Promise(function(resolve,reject) {resolve(user);});
    }).error(function (err) {
        console.log("Error:" + err);
        throw err;
    });
});
app.get('/osobe-i-rezervacije', function(req,res) {
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes();
    var trenutnoVrijeme = parseInt(time.replace(':', ''));
    var trenutniDan = today.getDay() - 1;
    if (trenutniDan === -1) 
        trenutniDan = 6;
    var trenutniDatum =  today.getDate()+'.'+(today.getMonth()+1)+'.'+today.getFullYear();

    db.sequelize.query("SELECT o.ime as \"ime\", o.prezime as \"prezime\", o.uloga as \"uloga\", s.naziv as \"naziv\" " +
                       "FROM osobljes o, salas s, termins t, rezervacijas r " +
                       "WHERE r.termin = t.id and r.sala = s.id and r.osoba = o.id and TIME_FORMAT(t.pocetak, '%H%i') <= ? and TIME_FORMAT(t.kraj, '%H%i') >= ? and (datum <=> ? or dan <=> ?) ", 
                       { replacements: [trenutnoVrijeme, trenutnoVrijeme, trenutniDatum, trenutniDan], type: db.sequelize.QueryTypes.SELECT})
    .then(data => {

        db.sequelize.query("SELECT ime as \"ime\", prezime as \"prezime\", uloga as \"uloga\", \"kancelarija\" as \"naziv\" FROM osobljes", 
                          { type: db.sequelize.QueryTypes.SELECT})
        .then(sveOsobe => {

            osobe = JSON.parse(JSON.stringify(sveOsobe));
            osobeKojeSuRezervisale = JSON.parse(JSON.stringify(data));

            for (let i = 0; i < osobe.length; i++) {

                x = osobe[i];
                let osobaX = x.uloga + " " + x.ime + " " + x.prezime;
    
                for (let j = 0; j < osobeKojeSuRezervisale.length; j++) {

                    y = osobeKojeSuRezervisale[j];
                    let osobaY = y.uloga + " " + y.ime + " " + y.prezime;

                    if (osobaX == osobaY)
                        osobe[i].naziv = y.naziv;
                }
            }
            //console.log(osobe);
            //res.send(JSON.stringify(osobe));
            res.send(osobe);
        });

    });
});


app.post('/zauzeca-vanredna',function(req,res) {
    var novo = "";
    var datumRegex   = new RegExp("^((3[01]|[2][0-9]|1\\d|0\\d|\\d)\\.(1[0-2]|0[1-9]|[1-9])\\.\\d{4})$");
    var vrijemeRegex = new RegExp("^((2[0-3]|[0][0-9]|1[0-9]):([0-5][0-9]))$");
    var sale = ["0-01", "0-02", "0-03", "0-04", "0-05", "0-06", "0-07", "0-08", "0-09", "1-01", "1-02", "1-03", "1-04", "1-05", "1-06", "1-07", "1-08", "1-09", "1-11", "1-15", "VA1", "VA2", "MA", "EE1", "EE2"]; 

    db.sequelize.query("SELECT o.ime as \"ime\", o.prezime as \"prezime\", o.uloga as \"uloga\", s.naziv as \"naziv\", t.redovni as \"redovni\", t.dan as \"dan\", t.datum as \"datum\", t.semestar as \"semestar\", TIME_FORMAT(t.pocetak, '%H:%i') as \"pocetak\", TIME_FORMAT(t.kraj, '%H:%i') as \"kraj\" " +
                       "FROM osobljes o, salas s, termins t, rezervacijas r " +
                       "WHERE r.termin = t.id and r.sala = s.id and r.osoba = o.id ", { type: db.sequelize.QueryTypes.SELECT})
    .then(data => {
        zauzeca = JSON.parse(JSON.stringify(data));

        var periodicna = [];
        var vanredna = [];

        for (let i = 0; i < zauzeca.length; i++) {

            x = zauzeca[i];

            let osoba = x.uloga + " " + x.ime + " " + x.prezime;

            if (x.redovni) 
                periodicna.push({dan: x.dan, semestar: x.semestar, pocetak: x.pocetak, kraj: x.kraj, naziv: x.naziv, predavac: osoba});
            else
                vanredna.push({datum: x.datum, pocetak: x.pocetak, kraj: x.kraj, naziv: x.naziv, predavac: osoba});
        }

        var zauzecaSva = {periodicna: periodicna, vanredna: vanredna};


        // Da li je validan JSON format
        try {
            novo = JSON.parse(JSON.stringify(req.body)); 
        } catch (e) {
            console.log("\n\n *** Nisam uopste mogao parsirati zahtjev *** \n\n");
            res.status(400).send(zauzecaSva);
            return;
        }

        // Da li sadrzi sve potrebne kljuceve
        if (!novo.datum || !novo.pocetak || !novo.kraj || !novo.naziv || !novo.predavac || (Object.keys(novo)).length != 5) {
            res.status(400).send(zauzecaSva);
            return;
        }

        // Da li vrijednosti u ispravnom obliku
        if (!datumRegex.test(novo.datum) || !vrijemeRegex.test(novo.pocetak) || !vrijemeRegex.test(novo.kraj) || !sale.includes(novo.naziv) || novo.predavac.split(' ').length != 3) {
            res.status(400).send(zauzecaSva);
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
        for (let i = 0; i < vanredna.length; i++) {

            let zauzece = vanredna[i];

            let x2 = parseInt(zauzece.pocetak.replace(':', ''));
            let y2 = parseInt(zauzece.kraj.replace(':', ''));

            let parts = zauzece.datum.split('.');
            let year  = parseInt(parts[2], 10);
            let month = parseInt(parts[1], 10); 
            let day   = parseInt(parts[0], 10);

            if (day === dan && mjesec === month && year === godina && Math.max(x1, x2) < Math.min(y1, y2) && naziv === zauzece.naziv) {
                let odgovor = [zauzecaSva, zauzece.predavac];
                res.status(401).send(odgovor);
                return;
            }
        }
        for (let i = 0; i < periodicna.length; i++) {

            let zauzece = periodicna[i];

            let x2 = parseInt(zauzece.pocetak.replace(':', ''));
            let y2 = parseInt(zauzece.kraj.replace(':', ''));

            let day = (new Date(godina, mjesec-1, dan)).getDay() - 1;
            if (day === -1)
                day = 6;

            if (naziv === zauzece.naziv && Math.max(x1, x2) < Math.min(y1, y2) && zauzece.dan == day && ( (zauzece.semestar == "zimski" && [1,10,11,12].includes(mjesec))  || (zauzece.semestar == "ljetni" && [2,3,4,5,6].includes(mjesec)) )) {
                console.log("\n\n *** Sala je vec zauzeta periodicno *** \n\n");
                let odgovor = [zauzecaSva, zauzece.predavac];
                res.status(401).send(odgovor);
                return;
            }
        }

        // ubacivanje novog zauzeca u bazu
        zauzecaSva.vanredna.push(novo);
        let predavac = novo.predavac.split(" ");

        db.osoblje.findOrCreate({where: {uloga: predavac[0], ime: predavac[1], prezime: predavac[2]}})
        .then(function([osoba, created]) {
            idOsobe = osoba.id;

            db.termin.findOrCreate({where: {redovni: false, dan: null, datum: novo.datum, semestar: null, pocetak: novo.pocetak, kraj: novo.kraj}})
            .then(function([termin, created]) {
                idTermina = termin.id;

                db.sala.findOrCreate({where: {naziv: novo.naziv}})
                .then(function([sala, created]) {
                    idSale = sala.id;

                    db.rezervacija.findOrCreate({where: {termin: idTermina, sala: idSale, osoba: idOsobe}})
                    .then(function([rezervacija, created]) {
                        res.status(200).send(zauzecaSva);
                    }) 
                })
            })
        }, function(error) {
            console.log("Greška pri ubacivanju novog zauzeca u bazu: " + error);
            throw error;
        });
    });
});
app.post('/zauzeca-periodicna',function(req,res){

    var novo = "";
    var vrijemeRegex = new RegExp("^((2[0-3]|[0][0-9]|1[0-9]):([0-5][0-9]))$");
    var danRegex = new RegExp("^([0-6])$");
    var sale = ["0-01", "0-02", "0-03", "0-04", "0-05", "0-06", "0-07", "0-08", "0-09", "1-01", "1-02", "1-03", "1-04", "1-05", "1-06", "1-07", "1-08", "1-09", "1-11", "1-15", "VA1", "VA2", "MA", "EE1", "EE2"]; 

    db.sequelize.query("SELECT o.ime as \"ime\", o.prezime as \"prezime\", o.uloga as \"uloga\", s.naziv as \"naziv\", t.redovni as \"redovni\", t.dan as \"dan\", t.datum as \"datum\", t.semestar as \"semestar\", TIME_FORMAT(t.pocetak, '%H:%i') as \"pocetak\", TIME_FORMAT(t.kraj, '%H:%i') as \"kraj\" " +
                       "FROM osobljes o, salas s, termins t, rezervacijas r " +
                       "WHERE r.termin = t.id and r.sala = s.id and r.osoba = o.id ", { type: db.sequelize.QueryTypes.SELECT})
    .then(data => {
        zauzeca = JSON.parse(JSON.stringify(data));

        var periodicna = [];
        var vanredna = [];

        for (let i = 0; i < zauzeca.length; i++) {

            x = zauzeca[i];

            let osoba = x.uloga + " " + x.ime + " " + x.prezime;

            if (x.redovni) 
                periodicna.push({dan: x.dan, semestar: x.semestar, pocetak: x.pocetak, kraj: x.kraj, naziv: x.naziv, predavac: osoba});
            else
                vanredna.push({datum: x.datum, pocetak: x.pocetak, kraj: x.kraj, naziv: x.naziv, predavac: osoba});
        }

        var zauzecaSva = {periodicna: periodicna, vanredna: vanredna};

        // Da li je validan JSON format
        try {
            novo = JSON.parse(JSON.stringify(req.body));
        } catch (e) {
            console.log("\n\n *** Nisam uopste mogao parsirati zahtjev *** \n\n");
            res.status(400).send(zauzecaSva);
            return;
        }

        // Da li sadrzi sve potrebne kljuceve
        if (!novo.dan || !novo.semestar || !novo.pocetak || !novo.kraj || !novo.naziv || !novo.predavac || (Object.keys(novo)).length != 6) {
            console.log("\n\n *** Zahtjev ne sadrzi sve potrebe kljuceve *** \n\n");
            res.status(400).send(zauzecaSva);
            return;
        }

        // Da li vrijednosti u ispravnom obliku
        if (!vrijemeRegex.test(novo.pocetak) || !vrijemeRegex.test(novo.kraj) || !sale.includes(novo.naziv) || (novo.semestar != "zimski" && novo.semestar != "ljetni") || !danRegex.test(novo.dan) || novo.predavac.split(' ').length != 3) {
            res.status(400).send(zauzecaSva);
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
        for (let i = 0; i < vanredna.length; i++) {

            let zauzece = vanredna[i];

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
                let odgovor = [zauzecaSva, zauzece.predavac];
                res.status(401).send(odgovor);
                return;
            }
        }

        for (let i = 0; i<periodicna.length; i++) {
            let zauzece = periodicna[i];

            let x2 = parseInt(zauzece.pocetak.replace(':', ''));
            let y2 = parseInt(zauzece.kraj.replace(':', ''));

            if (semestar == zauzece.semestar && dan == zauzece.dan && naziv == zauzece.naziv && Math.max(x1, x2) < Math.min(y1, y2)) {
                console.log("\n\n *** Vec postoji periodicna zauzeta sala *** \n\n");
                let odgovor = [zauzecaSva, zauzece.predavac];
                res.status(402).send(odgovor);
                return;
            }

        }

        // ubacivanje novog zauzeca u bazu
        zauzecaSva.periodicna.push(novo);
        let predavac = novo.predavac.split(" ");

        db.osoblje.findOrCreate({where: {uloga: predavac[0], ime: predavac[1], prezime: predavac[2]}})
        .then(function([osoba, created]) {
            idOsobe = osoba.id;

            db.termin.findOrCreate({where: {redovni: true, dan: novo.dan, datum: null, semestar: novo.semestar, pocetak: novo.pocetak, kraj: novo.kraj}})
            .then(function([termin, created]) {
                idTermina = termin.id;

                db.sala.findOrCreate({where: {naziv: novo.naziv}})
                .then(function([sala, created]) {
                    idSale = sala.id;

                    db.rezervacija.findOrCreate({where: {termin: idTermina, sala: idSale, osoba: idOsobe}})
                    .then(function([rezervacija, created]) {
                        res.status(200).send(zauzecaSva);
                    }) 
                })
            })
        }, function(error) {
            console.log("Greška pri ubacivanju novog zauzeca u bazu: " + error);
            throw error;
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
//app.listen(8080);

db.sequelize.sync({force:true}).then(function(){
    db.inicijalizacija().then(function(){
        console.log("Gotovo kreiranje tabela i ubacivanje pocetnih podataka!");
        app.listen(8080, 'localhost', function () {
            console.log('App has started');
            app.emit("appStarted");
        });
    });
});

module.exports = app;