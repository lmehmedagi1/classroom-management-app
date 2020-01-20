const supertest = require("supertest");
const assert = require('assert');
const app = require("../index");


describe("Server", function() {

    let novoZauzece = {datum: "20.01.2020", pocetak: "09:00", kraj: "13:00", naziv: "0-01", predavac: "profesor Vensada Okanovic"};
    let novoZauzeceDrugiProfesor = {datum: "20.01.2020", pocetak: "09:00", kraj: "13:00", naziv: "0-01", predavac: "profesor Selma Rizvic"};
    let novoPeriodicnoZauzece = {dan: "0", semestar: "zimski", pocetak: "09:00", kraj: "13:00", naziv: "0-01", predavac: "profesor Vensada Okanovic"};
    let novoPeriodicnoZauzeceUtorak = {dan: "1", semestar: "zimski", pocetak: "09:00", kraj: "13:00", naziv: "0-01", predavac: "profesor Vensada Okanovic"};

    before(done => {
        app.on('appStarted', () => {
          done();
        });
    });

    it("Inicijalno su u bazi sale 1-11 i 1-15", function(done) {
        supertest(app).get('/sale')
            .set('Accept', 'application/json')
            .expect(200)
            .expect(function(res) {
                let salaRegex   = new RegExp("^(1-1[1,5])$");
                assert.equal(res.body.length, 2);
                assert.ok(salaRegex.test(res.body[0].naziv));
                assert.ok(salaRegex.test(res.body[1].naziv));
            })
            .then(response => {
                done();
            }).catch(err => {
                done(err);
            })
    });

    it("Ruta GET /osoblje treba vratiti status kod 200", function (done) {
        supertest(app).get('/osoblje')
            .set('Accept', 'application/json')
            .expect(200)
            .then(response => {
                done();
            }).catch(err => {
                done(err);
            })
    });

   it("Ruta GET /zauzeca treba vratiti status kod 200", function (done) {
        supertest(app).get('/zauzeca')
            .set('Accept', 'application/json')
            .expect(200)
            .expect(function(res) {
                zauzeca = res.body;
                assert.equal(res.statusCode, 200);
                assert.equal(res.body.length, 2); // treba vratiti niz od dva zauzeca
            })
            .then(response => {
                done();
            }).catch(err => {
                done(err);
            })
    });

    it("Novo vanredno zauzece se treba ispravno dodati i azurirati prethodna zauzeca", function(done) {
        supertest(app)
            .post("/zauzeca-vanredna")
            .send(novoZauzece)
            .expect(200)
            .expect(function(res) {
                assert.equal(res.body.vanredna.length, 2); // trebaju biti 2 vanredna zauzeca
            })
            .then(response => {
                done();
            }).catch(err => {
                done(err);
            })
    });

    it("Ne moze se ponovo zauzeti isto zauzece", function(done) {
        supertest(app)
            .post("/zauzeca-vanredna")
            .send(novoZauzece)
            .expect(401)
            .expect(function(res) {
                assert.equal(res.body[0].vanredna.length, 2); // ostala su 2 vanredna zauzeca
                assert.equal(res.body[1], "profesor Vensada Okanovic"); // salu je zauzela prof. Vensada
            })
            .then(response => {
                done();
            }).catch(err => {
                done(err);
            })
    });

    it("Drugi profesor ne moze zauzeti vec postojece zauzece", function(done) {
        supertest(app)
            .post("/zauzeca-vanredna")
            .send(novoZauzeceDrugiProfesor)
            .expect(401)
            .expect(function(res) {
                assert.equal(res.body[0].vanredna.length, 2); // ostala su 2 vanredna zauzeca
                assert.equal(res.body[1], "profesor Vensada Okanovic"); // salu je zauzela prof. Vensada
            })
            .then(response => {
                done();
            }).catch(err => {
                done(err);
            })
    });

    it("Novo zauzece je dodalo novu salu u bazu, salu 0-01", function(done) {
        supertest(app).get('/sale')
            .set('Accept', 'application/json')
            .expect(200)
            .expect(function(res) {
                let salaRegex = new RegExp("^((1-1[1,5])|(0-01))$");
                assert.equal(res.body.length, 3);
                assert.ok(salaRegex.test(res.body[0].naziv));
                assert.ok(salaRegex.test(res.body[1].naziv));
                assert.ok(salaRegex.test(res.body[2].naziv));
            })
            .then(response => {
                done();
            }).catch(err => {
                done(err);
            })
    });

    it("Novo zauzece je dodalo novog profesora u bazu, prof. Vensadu Okanovic", function(done) {
        supertest(app).get('/osoblje')
            .set('Accept', 'application/json')
            .expect(200)
            .expect(function(res) {
                assert.equal(res.body.length, 4);
                assert.equal(res.body[3].ime, "Vensada");
                assert.equal(res.body[3].prezime, "Okanovic");
                assert.equal(res.body[3].uloga, "profesor");
            })
            .then(response => {
                done();
            }).catch(err => {
                done(err);
            })
    });

    it("Prof. Vensadu Okanovic se trenutno nalazi u kancelariji", function(done) {
        supertest(app).get('/osobe-i-rezervacije')
            .set('Accept', 'application/json')
            .expect(200)
            .expect(function(res) {
                assert.equal(res.body.length, 4);
                assert.equal(res.body[3].naziv, "kancelarija");
            })
            .then(response => {
                done();
            }).catch(err => {
                done(err);
            })
    });

    it("Ne mozemo dodati periodicno zauzece ponedjeljkom jer je ta sala zauzeta 20.01. u tom terminu", function(done) {
        supertest(app)
            .post("/zauzeca-periodicna")
            .send(novoPeriodicnoZauzece)
            .expect(401)
            .expect(function(res) {
                assert.equal(res.body[0].periodicna.length, 1); // treba biti samo jedno periodicno
            })
            .then(response => {
                done();
            }).catch(err => {
                done(err);
            })
    });

    it("Novo periodicno zauzece utorkom se ispravno dodaje", function(done) {
        supertest(app)
            .post("/zauzeca-periodicna")
            .send(novoPeriodicnoZauzeceUtorak)
            .expect(200)
            .expect(function(res) {
                assert.equal(res.body.periodicna.length, 2); // dodali smo novu periodicnu
            })
            .then(response => {
                done();
            }).catch(err => {
                done(err);
            })
    });

    it("Profesor vec postoji u bazi, zauzece nije dodalo novog", function(done) {
        supertest(app).get('/osoblje')
            .set('Accept', 'application/json')
            .expect(200)
            .expect(function(res) {
                assert.equal(res.body.length, 4); // ostalo je 4 profesora u bazi
            })
            .then(response => {
                done();
            }).catch(err => {
                done(err);
            })
    });
    

});