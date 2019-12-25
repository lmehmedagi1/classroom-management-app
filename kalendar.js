// Pocetni podaci, hardkodirani

var periodicnaPocetni = [
    {dan:1, semestar:"zimski", pocetak:"12:00", kraj:"15:00", naziv:"0-01", predavac:"V. prof. dr Vensada Okanovic"},
    {dan:3, semestar:"ljetni", pocetak:"09:00", kraj:"12:00", naziv:"0-03", predavac:"V. prof. dr Vensada Okanovic"},
    {dan:0, semestar:"zimski", pocetak:"09:00", kraj:"12:00", naziv:"VA1", predavac:"V. prof. dr Vensada Okanovic"}
];
var vanrednaPocetni = [
    {datum:"21.11.2019", pocetak:"12:00", kraj:"15:00", naziv:"0-01", predavac:"V. prof. dr Vensada Okanovic"},
    {datum:"25.12.2019", pocetak:"12:00", kraj:"15:00", naziv:"EE1", predavac:"V. prof. dr Vensada Okanovic"},
    {datum:"12.03.2019", pocetak:"12:00", kraj:"15:00", naziv:"EE2", predavac:"V. prof. dr Vensada Okanovic"}
];


let Kalendar = (function() {    

    // Pomocne varijable
    var mjeseci = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni', 'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'];   
    var sale = ["0-01", "0-02", "0-03", "0-04", "0-05", "0-06", "0-07", "0-08", "0-09", "1-01", "1-02", "1-03", "1-04", "1-05", "1-06", "1-07", "1-08", "1-09", "VA1", "VA2", "MA", "EE1", "EE2"]; 
    var ljetniMjeseci = [1, 2, 3, 4, 5];
    var zimskiMjeseci = [9, 10, 11, 0];
    var datum = new Date();
    var lista = document.getElementsByTagName("select")[0];
    var vrijemeRegex = new RegExp("^((2[0-3]|[0][0-9]|1[0-9]):([0-5][0-9]))$");
    var datumRegex = new RegExp("^((3[01]|[2][0-9]|1\d|0\d)\.(1[0-2]|0[1-9])\.\d{4})$");
    
    // Pocetni podaci - trenutni mjesec i default vrijednosti
    var trenutniMjesec = datum.getMonth();
    console.log("Trenutni mjesec je " + trenutniMjesec);
    var trenutnaSala = lista.options[lista.selectedIndex].text;
    var trenutniPocetak = document.getElementsByName("pocetak")[0].value;
    var trenutniKraj = document.getElementsByName("kraj")[0].value;

    // Nizovi zauzeca za sve sale
    var periodicnaZauzeca = [];
    var vanrednaZauzeca = [];


    function obojiZauzecaImpl(kalendarRef, mjesec, sala, pocetak, kraj) {  

        // Ukoliko su pogresni podaci, ne radi nista
        if (kalendarRef === null || mjesec < 0 || mjesec > 11 || !sale.includes(sala) || !vrijemeRegex.test(pocetak) || !vrijemeRegex.test(kraj)) {
            return;
        }

        var x1 = parseInt(pocetak.replace(':', ''));
        var y1 = parseInt(kraj.replace(':', ''));

        // Resetujemo prethodno obojene sale:
        var sviDani = document.querySelectorAll(".dani div");
        sviDani.forEach(function (jedanDan) {
            jedanDan.style.backgroundColor = "green";
        });


        if (Array.isArray(periodicnaZauzeca) && periodicnaZauzeca.length) {

            periodicnaZauzeca.forEach(function (zauzece) {

                var x2 = parseInt(zauzece.pocetak.replace(':', ''));
                var y2 = parseInt(zauzece.kraj.replace(':', ''));

                if (sala === zauzece.naziv && Math.max(x1, x2) < Math.min(y1, y2)) {


                    var dan = new Date(new Date().getFullYear(), mjesec, 1).getDay() -1;
                    if (dan === -1)
                        dan = 6;


                    var zauzetiDani = document.querySelectorAll(".dani div:nth-child(7n +" + (8 - dan + parseInt(zauzece.dan,10)) % 7 + ")");
                    
                    if ((zauzece.semestar === "zimski" && zimskiMjeseci.includes(mjesec)) || (zauzece.semestar === "ljetni" && ljetniMjeseci.includes(mjesec))) {
                        zauzetiDani.forEach(function (x) {
                            x.style.backgroundColor = "red";
                        });
                    }
    
                }
            });
        }

        if (Array.isArray(vanrednaZauzeca) && vanrednaZauzeca.length) {

            vanrednaZauzeca.forEach(function (zauzece) {

                var parts = zauzece.datum.split('.');
                var month = parseInt(parts[1], 10) - 1; 
                var day = parseInt(parts[0], 10);

                var x2 = parseInt(zauzece.pocetak.replace(':', ''));
                var y2 = parseInt(zauzece.kraj.replace(':', ''));
    
                if (mjesec === month && Math.max(x1, x2) < Math.min(y1, y2) && sala === zauzece.naziv) {
    
                    var zauzetiDan = document.querySelector(".dani div:nth-child(" + day + ")");
                    zauzetiDan.style.backgroundColor = "red";
                }
            });
        }
    }    

    function ucitajPodatkeImpl(periodicna, vanredna) { 

        // Ukoliko su pogresni podaci, ne radi nista
        if (!validirajPeriodnica(periodicna) || !validirajVanredna(vanredna)) {
            return;
        }

        periodicnaZauzeca = periodicna;
        vanrednaZauzeca = vanredna;
        
        iscrtajKalendarImpl(document.getElementById("kalendar"), trenutniMjesec);
    }    


    function iscrtajKalendarImpl(kalendarRef, mjesec) {    

        // Ukoliko su pogresni podaci, ne radi nista
        if (kalendarRef === null || mjesec < 0 || mjesec > 11) {
            return;
        }

        var brojDanaUMjesecu = (new Date(new Date().getFullYear(), mjesec + 1, 0)).getDate();

        // Skrivamo sve dane
        var sviDani = document.querySelectorAll(".dani div");
        sviDani.forEach(function (jedanDan) {
            jedanDan.style.display = "none";
        });

        // Postavljamo samo odgovarajuci broj dana
        var sviDani = document.querySelectorAll(".dani div:nth-child(-n+" + brojDanaUMjesecu + ")");
        sviDani.forEach(function (jedanDan) {
            jedanDan.style.display = "block";
        });

        var dan = ((new Date(new Date().getFullYear(), mjesec, 1).getDay() + 6) % 7) +1;
        
        document.getElementsByClassName("mjesec")[0].innerHTML = mjeseci[mjesec];
        document.getElementsByClassName("dani")[0].children[0].style.gridColumnStart = dan;

        obojiZauzecaImpl(kalendarRef, trenutniMjesec, trenutnaSala, trenutniPocetak, trenutniKraj);  
    }

    // Funkcija za rezervaciju sale, poziva se kada se klikne dan na kalendaru
    window.onclick = e => {
        var dan = parseInt(e.target.innerHTML, 10);
        
        if (!isFinite(dan) || dan < 1 || dan > 31)
            return;

        // PROVJERI JEL KRAJ PRIJE POCETKA I JEL ZIMSKI IL LJETNI MJESEC

        var daniUSedmici = [" svaki ponedjeljak", " svaki utorak", " svaku srijedu", " svaki cetvrtak", " svaki petak", " svaku subotu", " svaku nedjelju"];
        var semestarZauzeca = ljetniMjeseci.includes(trenutniMjesec) ? "ljetnom" : "zimskom";
        var predavacZauzeca = "V. prof. dr Vensada Okanovic";
        var datumZauzeca = dan + "." + (trenutniMjesec + 1) + "." + new Date().getFullYear();
        var poruka = "";
        
        var prviDan = parseInt(document.getElementById("kalendar").querySelector(".dani").firstElementChild.style.gridColumnStart) - 1;

        dan = (dan % 7) + prviDan - 1;
        if (dan === -1) 
            dan = 6;

        if (dan >= prviDan)
            dan = (dan % 7);

        var odabranaPeriodicnaBox = document.getElementById("periodicnaBox").checked;

        if (odabranaPeriodicnaBox)
            poruka = "Želite li rezervisati salu " + trenutnaSala + daniUSedmici[dan] + " u " + semestarZauzeca + " semestru u periodu od " + trenutniPocetak + " do " + trenutniKraj + "?";
        else 
            poruka = "Želite li rezervisati salu " + trenutnaSala + " na datum " + datumZauzeca + " u periodu od " + trenutniPocetak + " do " + trenutniKraj + "?";

        var result = confirm(poruka); 
        if (result != true)
            return;

        // salji zahtjev 
        if (odabranaPeriodicnaBox) {
            semestarZauzeca = semestarZauzeca[0] === "l" ? "ljetni" : "zimski";
            periodicnoZauzece = {dan: dan.toString(), semestar: semestarZauzeca, pocetak: trenutniPocetak, kraj: trenutniKraj, naziv: trenutnaSala, predavac: predavacZauzeca};
            rezervisiPeriodicno(periodicnoZauzece);
        }
        else {
            vanrednoZauzece = {datum: datumZauzeca, pocetak: trenutniPocetak, kraj: trenutniKraj, naziv: trenutnaSala, predavac: predavacZauzeca};
            rezervisiVanredno(vanrednoZauzece);
        }
    }

    // Funckije za validaciju podataka
    function validirajPeriodnica(periodicna) {
        periodicna.forEach(function (x) {
            if (x.dan < 0 || x.dan > 6 || (x.semestar !== "zimski" && x.semestar !== "ljetni") || !vrijemeRegex.test(x.pocetak) || !vrijemeRegex.test(x.kraj) || !sale.includes(x.naziv)) {
                return false;
            }
        });
        return true;
    }

    function validirajVanredna(vanredna) {
        vanredna.forEach(function (x) {
            if (!datumRegex.test(x.datum) || !vrijemeRegex.test(x.pocetak) || !vrijemeRegex.test(x.kraj) || !sale.includes(x.naziv)) {
                return false;
            }
        });
        return true;
    }


    // Triggeri kada se promijeni neka od vrijednosti
    document.getElementById("prethodni").addEventListener("click", function(){
        
        trenutniMjesec = trenutniMjesec - 1;
        iscrtajKalendarImpl(document.getElementById("kalendar"), trenutniMjesec);

        // Ako smo dosli do januara ili se vratili na novembar
        if (trenutniMjesec === 0) {
            document.getElementById("prethodni").disabled = true;
        }
        if (trenutniMjesec === 10) {
            document.getElementById("sljedeci").disabled = false;
        } 
    });

    document.getElementById("sljedeci").addEventListener("click", function(){
        trenutniMjesec = trenutniMjesec + 1;
        iscrtajKalendarImpl(document.getElementById("kalendar"), trenutniMjesec);
        
        // Ako smo dosli do decembra ili se vratili na februar
        if (trenutniMjesec === 11) {
            document.getElementById("sljedeci").disabled = true;
        }
        if (trenutniMjesec === 1) {
            document.getElementById("prethodni").disabled = false;
        } 
    });

    lista.addEventListener("change", function() {
        trenutnaSala = lista.options[lista.selectedIndex].text;
        iscrtajKalendarImpl(document.getElementById("kalendar"), trenutniMjesec);
    });

    document.getElementsByName("pocetak")[0].addEventListener("change", function() {
        trenutniPocetak = document.getElementsByName("pocetak")[0].value;
        iscrtajKalendarImpl(document.getElementById("kalendar"), trenutniMjesec);
    });

    document.getElementsByName("kraj")[0].addEventListener("change", function() {
        trenutniKraj = document.getElementsByName("kraj")[0].value;
        iscrtajKalendarImpl(document.getElementById("kalendar"), trenutniMjesec);
    });

    return {        
        obojiZauzeca: obojiZauzecaImpl,        
        ucitajPodatke: ucitajPodatkeImpl,        
        iscrtajKalendar: iscrtajKalendarImpl    
    }
}());