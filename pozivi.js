let Pozivi = (function() {   
    
    // ucitava podatke sa servera u modul Kalendar kad se otvori rezervacije.html
    function ucitajPodatkeSaServeraImpl(zauzeca) {
        var xhttp;
        xhttp=new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                zauzecaJson = JSON.parse(xhttp.responseText);
                Kalendar.ucitajPodatke(zauzecaJson.periodicna, zauzecaJson.vanredna);
            }
        };
        xhttp.open("GET", zauzeca, true);
        xhttp.send();
    }

    // upisuje novo zauzece na server
    function upisiNovoPeriodicnoZauzeceImpl(periodicno) {


        

        //Kalendar.periodicnaZauzeca 


        //ajax.open("POST", "http://localhost:8085/forma", true);
        //ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        //ajax.send("ime=" + ime + "&prezime=" + prezime);

    }

    function upisiNovoVanrednoZauzeceImpl(vanredno) {

        var xhttp;
        xhttp=new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                zauzecaJson = JSON.parse(xhttp.responseText);
                Kalendar.ucitajPodatke(zauzecaJson.periodicna, zauzecaJson.vanredna);

                var parts = vanredno.datum.split('.');
                var day = parseInt(parts[0], 10);

                var dan = document.getElementById("kalendar").querySelector(".dani").querySelector("div:nth-child(" + day + ")");
                if (dan.style.backgroundColor === "red") 
                    ispisiGresku(vanredno);
                else {
                    dodajVanrednoZauzece(vanredno);
                    
                }
                
            }
        };
        xhttp.open("GET", zauzeca, true);
        xhttp.send();

    }
    

    function validirajPeriodicno(zauzece, periodicna) {

    }

    return {    
        ucitajPodatkeSaServera: ucitajPodatkeSaServeraImpl,
        upisiNovoVanrednoZauzece: upisiNovoVanrednoZauzeceImpl,
        upisiNovoPeriodicnoZauzece: upisiNovoPeriodicnoZauzeceImpl 
    }
}());