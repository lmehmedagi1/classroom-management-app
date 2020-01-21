const Sequelize = require("sequelize");
const sequelize = new Sequelize("DBWT19","root","root",{
    host:"127.0.0.1",
    dialect:"mysql",
    logging:false,
    define: {timestamps:false}
});
const db={};

db.Sequelize = Sequelize;  
db.sequelize = sequelize;

// Import modela
db.osoblje     = sequelize.import(__dirname+'/db/osoblje.js');
db.rezervacija = sequelize.import(__dirname+'/db/rezervacija.js');
db.termin      = sequelize.import(__dirname+'/db/termin.js');
db.sala        = sequelize.import(__dirname+'/db/sala.js');

// Relacije

// Veza 1-n (osoblje - rezervacija)
db.rezervacija.belongsTo(db.osoblje, {as: 'rezervacije', foreignKey: { name: 'osoba', allowNull: false }, onDelete: 'cascade'});
db.osoblje.hasMany(db.rezervacija, {as: 'rezervacije', foreignKey: { name: 'osoba', allowNull: false }, onDelete: 'cascade'});

// Veza 1-1 (rezervacija - termin)
db.rezervacija.belongsTo(db.termin, {as: 'termini', foreignKey: { name: 'termin', unique: true, allowNull: false }, onDelete: 'cascade'});
db.termin.hasOne(db.rezervacija, {foreignKey: { name: 'termin', unique: true, allowNull: false }, onDelete: 'cascade', as: 'termini'});

// Veza n-1 (rezervacija - sala)
db.rezervacija.belongsTo(db.sala, {as: 'rezervacijeSale', foreignKey: { name: 'sala', allowNull: false }, onDelete: 'cascade'});
db.sala.hasMany(db.rezervacija, {as: 'rezervacijeSale', foreignKey: { name: 'sala', allowNull: false }, onDelete: 'cascade'});

// Veza 1-1 (sala - osobe)
db.sala.belongsTo(db.osoblje, {as: 'zaduzeneOsobe', foreignKey: { name: 'zaduzenaOsoba', allowNull: true }, onDelete: 'cascade'});
db.osoblje.hasOne(db.sala, {as: 'zaduzeneOsobe', foreignKey: { name: 'zaduzenaOsoba', allowNull: true }, onDelete: 'cascade'});


// Pocetni podaci
/*
db.sequelize.sync({force:true}).then(function(){
    inicializacija().then(function(){
        console.log("Gotovo kreiranje tabela i ubacivanje pocetnih podataka!");
    });
});
*/

let inicijalizacija = function inicializacija() {
    var listaOsoba = [];
    var listaSala = [];
    var listaTermina = [];
    var listaRezervacija = [];


    return new Promise(function (resolve, reject) {
        listaOsoba.push(db.osoblje.create({ ime: 'Neko', prezime: 'Nekic', uloga: 'profesor' }));
        listaOsoba.push(db.osoblje.create({ ime: 'Drugi', prezime: 'Neko', uloga: 'asistent' }));
        listaOsoba.push(db.osoblje.create({ ime: 'Test', prezime: 'Test', uloga: 'asistent' }));


        Promise.all(listaOsoba).then(function (osobe) {
            listaSala.push(db.sala.create({ naziv: '1-11', zaduzenaOsoba: '1' }));
            listaSala.push(db.sala.create({ naziv: '1-15', zaduzenaOsoba: '2' }));

            Promise.all(listaSala).then(function (sale) {
                listaTermina.push(db.termin.create({ redovni: false, dan: null, datum: "01.01.2020", semestar: null, pocetak: '12:00', kraj: '13:00' }));
                listaTermina.push(db.termin.create({ redovni: true, dan: 0, datum: null, semestar: "zimski", pocetak: '13:00', kraj: '14:00' }));

                Promise.all(listaTermina).then(function (termini) {
                    listaRezervacija.push(db.rezervacija.create({ termin: '1', sala: '1', osoba: '1' }));
                    listaRezervacija.push(db.rezervacija.create({ termin: '2', sala: '1', osoba: '3' }));

                    Promise.all(listaRezervacija).then(function (rezervacije) {
                        resolve(rezervacije);
                    }).catch(function (err) { console.log("Rezervacije error: " + err); });
                }).catch(function (err) { console.log("Termini error: " + err); });
            }).catch(function (err) { console.log("Sale error: " + err); });
        }).catch(function (err) { console.log("Osoblje error: " + err); });
    });

    /*
    return new Promise(function(resolve, reject) {

        listaTermina.push(db.termin.create({redovni: false, dan: null, datum: "01.01.2020", semestar: "null", pocetak: "12:00", kraj: "13:00"}));
        listaTermina.push(db.termin.create({redovni: true, dan: 0, datum: null, semestar: "zimski", pocetak: "13:00", kraj: "14:00"}));

        listaOsoba.push(db.osoblje.create({ime: 'Neko', prezime:'Nekic', uloga: 'profesor'}));
        listaOsoba.push(db.osoblje.create({ime: 'Drugi', prezime:'Neko', uloga: 'asistent'}));
        listaOsoba.push(db.osoblje.create({ime: 'Test', prezime:'Test', uloga: 'asistent'}));

        listaSala.push(db.sala.create({naziv:'1-11', setZaduzenaOsoba: '1'}));
        listaSala.push(db.sala.create({naziv:'1-15', setZaduzenaOsoba: '2'}));

        listaRezervacija.push(db.rezervacija.create({termin: '1', sala: '1', osoba: '1'}));
        listaRezervacija.push(db.rezervacija.create({termin: '2', sala: '1', osoba: '3'}));

        /*

        listaTermina.push(
            db.termin.create({redovni: true, dan: 0, datum: null, semestar: "zimski", pocetak: "13:00", kraj: "14:00"}).then(function(k) {
                //k.setTermini([vanredni]);

                return new Promise(function(resolve,reject) {resolve(k);});
            })
        );

        Promise.all(listaTermina).then(function(termini) {
            var vanredni = termini.filter(function(a) {return a.redovni === false})[0];
            var redovni = termini.filter(function(a) {return a.redovni === true})[0];

            console.log(redovni);

            listaRezervacija.push(
                db.rezervacija.create().then(function(k) {
                    k.setTermini([vanredni]);
                    return new Promise(function(resolve,reject) {resolve(k);});
                })
            );

            listaRezervacija.push(
                db.rezervacija.create().then(function(k) {
                    k.setTermini([redovni]);
                    return new Promise(function(resolve,reject) {resolve(k);});
                })
            );

            Promise.all(listaRezervacija).then(function(rezervacije) {
                var prvaRezervacija = rezervacije.filter(function(a) {return a.id === 1})[0];
                var drugaRezervacija = rezervacije.filter(function(a) {return a.id === 2})[0];

                

                //prvaRezervacija.setTermini([vanredni]);
                //drugaRezervacija.setTermini([redovni]);


                listaOsoba.push(
                    db.osoblje.create({ime: 'Neko', prezime:'Nekic', uloga: 'profesor'}).then(function(k) {
                        k.setRezervacije([prvaRezervacija]);
                        return new Promise(function(resolve,reject) {resolve(k);});
                    })
                );

                listaOsoba.push(db.osoblje.create({ime: 'Drugi', prezime:'Neko', uloga: 'asistent'}));

                listaOsoba.push(
                    db.osoblje.create({ime: 'Test', prezime:'Test', uloga: 'asistent'}).then(function(k) {
                        k.setRezervacije([drugaRezervacija]);
                        console.log(k.getRezervacije()[0]);
                        return new Promise(function(resolve,reject) {resolve(k);});
                    })
                );


                Promise.all(listaOsoba).then(function(osobe) {
                    var neko = osobe.filter(function(a) {return a.ime === 'Neko'})[0];
                    var drugi = osobe.filter(function(a) {return a.ime === 'Drugi'})[0];
                    var test = osobe.filter(function(a) {return a.ime === 'Test'})[0];

                    drugi.setRezervacije([prvaRezervacija]);

                    listaSala.push(
                        db.sala.create({naziv:'1-11'}).then(function(k) {
                            k.setRezervacijeSale([prvaRezervacija, drugaRezervacija]);
                            k.setZaduzeneOsobe([neko]);
                            return new Promise(function(resolve,reject) {resolve(k);});
                        })
                    );

                    listaSala.push(
                        db.sala.create({naziv:'1-15'}).then(function(k) {
                            k.setZaduzeneOsobe([drugi]);
                            return new Promise(function(resolve,reject) {resolve(k);});
                        })
                    );

                    Promise.all(listaSala).then(function(b){resolve(b);}).catch(function(err){console.log("Sale greska: " + err);});
                }).catch(function(err){console.log("Osobe greska: " + err);});
                
            }).catch(function(err){console.log("Rezervacije greska: " + err);});
            
        }).catch(function(err){console.log("Termini greska: " + err);});
    });
    */
}


module.exports=db;
module.exports.inicijalizacija = inicijalizacija;