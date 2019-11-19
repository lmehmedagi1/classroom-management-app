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
    var ljetniMjeseci = [1, 2, 3, 4, 5];
    var zimskiMjeseci = [9, 10, 11, 0];
    var datum = new Date();
    var lista = document.getElementsByTagName("select")[0];
    
    // Pocetni podaci - trenutni mjesec i default vrijednosti
    var trenutniMjesec = datum.getMonth();
    var trenutnaSala = lista.options[lista.selectedIndex].text;
    var trenutniPocetak = document.getElementsByName("pocetak")[0].value;
    var trenutniKraj = document.getElementsByName("kraj")[0].value;

    // Nizovi zauzeca za sve sale
    var periodicnaZauzeca = [];
    var vanrednaZauzeca = [];


    function obojiZauzecaImpl(kalendarRef, mjesec, sala, pocetak, kraj) {  
        
        iscrtajKalendarImpl(kalendarRef, mjesec); 

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
                    
                    var dan = ((new Date(2019, mjesec, 1).getDay() + 6) % 7) +1;

                    var zauzetiDani = document.querySelectorAll(".dani div:nth-child(7n +" + ((zauzece.dan + 9 - dan)%7) + ")");
                    
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
        periodicnaZauzeca = periodicna;
        vanrednaZauzeca = vanredna;
        
        obojiZauzecaImpl(document.getElementById("kalendar"), trenutniMjesec, trenutnaSala, trenutniPocetak, trenutniKraj);   
    }    
    function iscrtajKalendarImpl(kalendarRef, mjesec) {    

        var brojDanaUMjesecu = (new Date(2019, mjesec + 1, 0)).getDate();

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

        var dan = ((new Date(2019, mjesec, 1).getDay() + 6) % 7) +1;
        
        document.getElementsByClassName("mjesec")[0].innerHTML = mjeseci[mjesec];
        document.getElementsByClassName("dani")[0].children[0].style.gridColumnStart = dan;
    }

    // Triggeri kada se promijeni neka od vrijednosti
    document.getElementById("prethodni").addEventListener("click", function(){
        
        trenutniMjesec = trenutniMjesec - 1;
        obojiZauzecaImpl(document.getElementById("kalendar"), trenutniMjesec, trenutnaSala, trenutniPocetak, trenutniKraj);

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
        obojiZauzecaImpl(document.getElementById("kalendar"), trenutniMjesec, trenutnaSala, trenutniPocetak, trenutniKraj);
        
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
        obojiZauzecaImpl(document.getElementById("kalendar"), trenutniMjesec, trenutnaSala, trenutniPocetak, trenutniKraj);
    });

    document.getElementsByName("pocetak")[0].addEventListener("change", function() {
        trenutniPocetak = document.getElementsByName("pocetak")[0].value;
        obojiZauzecaImpl(document.getElementById("kalendar"), trenutniMjesec, trenutnaSala, trenutniPocetak, trenutniKraj);
    });

    document.getElementsByName("kraj")[0].addEventListener("change", function() {
        trenutniKraj = document.getElementsByName("kraj")[0].value;
        obojiZauzecaImpl(document.getElementById("kalendar"), trenutniMjesec, trenutnaSala, trenutniPocetak, trenutniKraj);
    });

    return {        
        obojiZauzeca: obojiZauzecaImpl,        
        ucitajPodatke: ucitajPodatkeImpl,        
        iscrtajKalendar: iscrtajKalendarImpl    
    }
}());

var element = document.getElementsByClassName("meni"); 
if (element.length > 0) {
    Kalendar.ucitajPodatke(periodicnaPocetni, vanrednaPocetni);
}
