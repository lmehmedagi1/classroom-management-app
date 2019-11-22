let assert = chai.assert;
describe('Kalendar', function() {
    describe('obojiZauzeca()', function() {

        it("Test 1 - Ne treba obojati niti jedan dan kada podaci nisu ucitani", function() {

            Kalendar.obojiZauzeca(document.getElementById("kalendar"), (new Date).getMonth(), "0-01", "12:00", "15:00");
            var dani = document.getElementById("kalendar").querySelector(".dani");

            var tvrdnja = true;

            var i;
            for (i = 1; i <= dani.childElementCount; i++) {
                var dan = dani.querySelector("div:nth-child(" + i + ")");
                if (dan.style.display !== 'none' && dan.style.backgroundColor === "red") {
                    tvrdnja = false;
                }
            }

            assert(tvrdnja, true, "Ne treba obojati niti jedan dan kada podaci nisu ucitani");
        });

        it("Test 2 - Boja ostaje ista nakon dva uzastopna poziva", function() {
            var periodicna = [];
            var vanredna = [
                {datum:"21.11.2019", pocetak:"09:00", kraj:"12:00", naziv:"0-01", predavac:"V. prof. dr Vensada Okanovic"}
            ];
            
            Kalendar.ucitajPodatke(periodicna, vanredna);
            Kalendar.obojiZauzeca(document.getElementById("kalendar"), 10, "0-01", "09:00", "12:00");
            Kalendar.obojiZauzeca(document.getElementById("kalendar"), 10, "0-01", "09:00", "12:00");
        
            var dani = document.getElementById("kalendar").querySelector(".dani");
            var dan = dani.querySelector("div:nth-child(21)");

            assert.equal(dan.style.backgroundColor, "red", "Boja ostaje ista nakon dva uzastopna poziva");
        });


        it("Test 3 - Stari podaci se brisu kada ucitamo nove", function() {
            var periodicna = [];
            var vanredna = [
                {datum:"21.11.2019", pocetak:"09:00", kraj:"12:00", naziv:"0-01", predavac:"V. prof. dr Vensada Okanovic"}
            ];
            
            Kalendar.ucitajPodatke(periodicna, vanredna);
            Kalendar.obojiZauzeca(document.getElementById("kalendar"), 10, "0-01", "09:00", "12:00");

            var vanredna = [
                {datum:"20.11.2019", pocetak:"09:00", kraj:"12:00", naziv:"0-01", predavac:"V. prof. dr Vensada Okanovic"}
            ];
            
            Kalendar.ucitajPodatke(periodicna, vanredna);
            Kalendar.obojiZauzeca(document.getElementById("kalendar"), 10, "0-01", "09:00", "12:00");

            var dani = document.getElementById("kalendar").querySelector(".dani");
            var dan1 = dani.querySelector("div:nth-child(20)");
            var dan2 = dani.querySelector("div:nth-child(21)");

            assert.equal(dan1.style.backgroundColor === "red" && dan2.style.backgroundColor === "green", true, "Stari podaci se brisu kada ucitamo nove");
        });


        it("Test 4 - Periodicna zauzeca boje svaki utorak", function() {
            var periodicna = [
                {dan:2, semestar:"zimski", pocetak:"09:00", kraj:"12:00", naziv:"0-01", predavac:"V. prof. dr Vensada Okanovic"}
            ];
            var vanredna = [];
            
            Kalendar.ucitajPodatke(periodicna, vanredna);
            Kalendar.obojiZauzeca(document.getElementById("kalendar"), 10, "0-01", "09:00", "12:00");

            var tvrdnja = true;
            var dani = document.getElementById("kalendar").querySelector(".dani");

            var i;
            for (i=5; i<dani.childElementCount; i+=7) {
                var dan = dani.querySelector("div:nth-child(" + i + ")");
                if (dan.style.display !== 'none' && dan.backgroundColor === "green") {
                    tvrdnja = false;
                }
            }

            assert.equal(tvrdnja, true, "Periodicna zauzeca boje svaki utorak");
        });


        it("Test 5 - Sala je slobodna u drugim terminima", function() {
            var periodicna = [];
            var vanredna = [
                {datum:"21.11.2019", pocetak:"09:00", kraj:"12:00", naziv:"0-01", predavac:"V. prof. dr Vensada Okanovic"}
            ];
            
            Kalendar.ucitajPodatke(periodicna, vanredna);
            var tvrdnja = true;
            var dani = document.getElementById("kalendar").querySelector(".dani");
            var dan = dani.querySelector("div:nth-child(21)");

            Kalendar.obojiZauzeca(document.getElementById("kalendar"), 10, "0-01", "09:00", "12:00");

            tvrdnja = dan.style.backgroundColor === "red";

            Kalendar.obojiZauzeca(document.getElementById("kalendar"), 10, "0-01", "12:00", "15:00");

            tvrdnja = dan.style.backgroundColor === "green";

            assert.equal(tvrdnja, true, "Sala je slobodna u drugim terminima");
        });

        it("Test 6 - Neispravni podaci", function() {
            var periodicna = [];
            var vanredna = [
                {datum:"21.11.2019", pocetak:"55:00", kraj:"12:87", naziv:"0-01", predavac:"V. prof. dr Vensada Okanovic"}
            ];

            Kalendar.ucitajPodatke(periodicna, vanredna);
            var dani = document.getElementById("kalendar").querySelector(".dani");
            var dan = dani.querySelector("div:nth-child(21)");

            Kalendar.obojiZauzeca(document.getElementById("kalendar"), 10, "0-01", "55:00", "12:87");

            assert.equal(dan.style.backgroundColor, "green", "Neispravni podaci ne mijenjaju nista");
        })

    });


    describe('ucitajPodatke()', function() {
        it("Test 1 - Dan se treba obojati iako postoje duple vrijednosti", function() {
            var periodicna = [];
            var vanredna = [
                {datum:"21.11.2019", pocetak:"12:00", kraj:"15:00", naziv:"EE1", predavac:"V. prof. dr Vensada Okanovic"},
                {datum:"21.11.2019", pocetak:"12:00", kraj:"15:00", naziv:"EE1", predavac:"V. prof. dr Vensada Okanovic"}
            ];
            
            Kalendar.ucitajPodatke(periodicna, vanredna);

            Kalendar.obojiZauzeca(document.getElementById("kalendar"), 10, "EE1", "12:00", "15:00");
            var dani = document.getElementById("kalendar").querySelector(".dani");
            var dan = dani.querySelector("div:nth-child(21)");

            assert.equal(dan.style.backgroundColor, "red", "Dan se treba obojati iako postoje duple vrijednosti");
        });

 
        it("Test 2 - Ne boji se zauzece ako nije odredjeno za zimski semestar", function() {
            var periodicna = [
                {dan:2, semestar:"ljetni", pocetak:"12:00", kraj:"15:00", naziv:"0-01", predavac:"V. prof. dr Vensada Okanovic"},
            ];
            var vanredna = [];
            
            Kalendar.ucitajPodatke(periodicna, vanredna);

            var dani = document.getElementById("kalendar").querySelector(".dani");
            var dan = dani.querySelector("div:nth-child(6)");

            assert.equal(dan.style.backgroundColor, "green", "Ne boji se zauzece ako nije odredjeno za zimski semestar");
        });


        it("Test 3 - Ne boje se zauzeca iz drugog mjeseca", function() {
            var periodicna = [];
            var vanredna = [
                {datum:"21.10.2019", pocetak:"12:00", kraj:"15:00", naziv:"EE1", predavac:"V. prof. dr Vensada Okanovic"},
            ];
            
            Kalendar.ucitajPodatke(periodicna, vanredna);

            var dani = document.getElementById("kalendar").querySelector(".dani");
            var dan = dani.querySelector("div:nth-child(21)");

            assert.equal(dan.style.backgroundColor, "green", "Ne boje se zauzeca iz drugog mjeseca");
        });



        it("Test 4 - Svi termini u mjesecu zauzeti", function() {
            var periodicna = [
                {dan:0, semestar:"zimski", pocetak:"00:00", kraj:"24:00", naziv:"0-01", predavac:"V. prof. dr Vensada Okanovic"},
                {dan:1, semestar:"zimski", pocetak:"00:00", kraj:"24:00", naziv:"0-01", predavac:"V. prof. dr Vensada Okanovic"},
                {dan:2, semestar:"zimski", pocetak:"00:00", kraj:"24:00", naziv:"0-01", predavac:"V. prof. dr Vensada Okanovic"},
                {dan:3, semestar:"zimski", pocetak:"00:00", kraj:"24:00", naziv:"0-01", predavac:"V. prof. dr Vensada Okanovic"},
                {dan:4, semestar:"zimski", pocetak:"00:00", kraj:"24:00", naziv:"0-01", predavac:"V. prof. dr Vensada Okanovic"},
                {dan:5, semestar:"zimski", pocetak:"00:00", kraj:"24:00", naziv:"0-01", predavac:"V. prof. dr Vensada Okanovic"},
                {dan:6, semestar:"zimski", pocetak:"00:00", kraj:"24:00", naziv:"0-01", predavac:"V. prof. dr Vensada Okanovic"}
            ];
            var vanredna = [];
            
            Kalendar.ucitajPodatke(periodicna, vanredna);

            var dani = document.getElementById("kalendar").querySelector(".dani");
            var tvrdnja = true;

            var i;
            for (i = 1; i<dani.childElementCount; i++) {
                var dan = dani.querySelector("div:nth-child(" + i + ")");
                if (dan.style.display !== 'none' && dan.backgroundColor === "green") {
                    tvrdnja = false;
                }
            }

            assert.equal(tvrdnja, true, "Svi termini u mjesecu zauzeti");
        });
    });


    describe('iscrtajKalendar()', function() {

        it('Test 1 - U novembru se prikazuje samo 30 dana', function() {
            Kalendar.iscrtajKalendar(document.getElementById("kalendar"), 10);
            var dani = document.getElementById("kalendar").querySelector(".dani");
            var zadnjiDan = dani.querySelector("div:nth-child(31)");

            assert.equal(zadnjiDan.style.display, "none", "Novembar ima 30 dana");
        });


        it("Test 2 - U decembru se prikazuje 31 dan", function() {
            Kalendar.iscrtajKalendar(document.getElementById("kalendar"), 11);
            var dani = document.getElementById("kalendar").querySelector(".dani");
            var zadnjiDan = dani.querySelector("div:nth-child(31)");

            assert.equal(zadnjiDan.style.display, "block", "Decembar ima 31 dan");
        });


        it("Test 3 - Prvi dan u novembru 2019. godine je petak", function() {
            Kalendar.iscrtajKalendar(document.getElementById("kalendar"), 10);
            var dani = document.getElementById("kalendar").querySelector(".dani");
            var novembar = window.getComputedStyle(dani.firstElementChild);
            var prviDan = novembar.gridColumnStart;
            assert.equal(prviDan, 5, "Prvi dan u novembru 2019. godine je petak");
        });


        it("Test 4 - Zadnji dan u novembru 2019. godine je subota", function() {
            Kalendar.iscrtajKalendar(document.getElementById("kalendar"), 10);
            var dani = document.getElementById("kalendar").querySelector(".dani");
            var novembar = window.getComputedStyle(dani.firstElementChild);
            var prviDan = novembar.gridColumnStart;

            var i;
            for (i = 1; i <= dani.childElementCount; i++) {
                var dan = dani.querySelector("div:nth-child(" + i + ")");
                if (dan.style.display === 'none') {
                    break;
                }
            }

            var zadnjiDan = ((i - 1 + parseInt(prviDan)) % 7 === 0 ? 6 : (i - 1 + parseInt(prviDan)) % 7 );

            assert.equal(zadnjiDan, 6, "Zadnji dan u novembru 2019. godine je subota");
        });


        it("Test 5 - U januaru su dani od 1 do 31 pocevsi od utorka", function() {
            Kalendar.iscrtajKalendar(document.getElementById("kalendar"), 0);
            var dani = document.getElementById("kalendar").querySelector(".dani");
            var tvrdnja = true;

            var januar = window.getComputedStyle(dani.firstElementChild);
            var prviDan = januar.gridColumnStart;

            tvrdnja = (prviDan === "2");

            var i;
            for (i = 1; i <= dani.childElementCount; i++) {
                var dan = dani.querySelector("div:nth-child(" + i + ")");
                if (dan.style.display !== 'none') {

                    var text = dan.textContent || dan.innerText;

                    if (text !== i.toString()) {
                        tvrdnja = false;
                    }
                }
            }
               
            if (i !== 32) {
                tvrdnja = false;
            }

            assert.equal(tvrdnja, true, "U januaru su dani od 1 do 31 pocevsi od utorka");
        });


        it("Test 6 - Moj rodjendan (21.11.) 2019. godine pada u cetvrtak", function() {
            Kalendar.iscrtajKalendar(document.getElementById("kalendar"), 10);
            var dani = document.getElementById("kalendar").querySelector(".dani");

            var novembar = window.getComputedStyle(dani.firstElementChild);
            var prviDan = novembar.gridColumnStart;

            var rodjendan = ((parseInt(prviDan) + 20) % 7);

            assert.equal(rodjendan, 4, "Moj rodjendan (21.11.) 2019. godine pada u cetvrtak");
        });


        it("Test 7 - Zadnji dan u junu ima text 30", function() {
            Kalendar.iscrtajKalendar(document.getElementById("kalendar"), 5);
            var dani = document.getElementById("kalendar").querySelector(".dani");

            var i;
            for (i = 1; i <= dani.childElementCount; i++) {
                var dan = dani.querySelector("div:nth-child(" + i + ")");
                if (dan.style.display === 'none') {
                    break;
                }
            }

            var zadnjiDan = dani.querySelector("div:nth-child(" + (i-1) + ")");
            var text = zadnjiDan.textContent || zadnjiDan.innerText;

            assert.equal(text, "30", "Zadnji dan u junu ima text 30");
        });
    });
});