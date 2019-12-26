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

        var xhttp;
        xhttp=new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                zauzecaJson = JSON.parse(xhttp.responseText);
                Kalendar.ucitajPodatke(zauzecaJson.periodicna, zauzecaJson.vanredna);

                if (validirajPeriodicno(periodicno, zauzecaJson.periodicna, zauzecaJson.vanredna)) {
                    zauzecaJson.periodicna.push(periodicno);

                    var ajaxPOST = new XMLHttpRequest();
                    ajaxPOST.onreadystatechange = function() {
                        
                        if (this.readyState == 4 && this.status == 200) {
                            Kalendar.ucitajPodatke(zauzecaJson.periodicna, zauzecaJson.vanredna);
                        }
                    };
                    ajaxPOST.open("POST", "http://localhost:8080/zauzeca", true);
                    ajaxPOST.setRequestHeader("Content-Type", "application/json; charset=utf-8");
                    ajaxPOST.send(JSON.stringify(zauzecaJson));
                }
                else {
                    alert("Nije moguce rezervisati salu " + periodicno.naziv + " za navedeni dan " + periodicno.dan + " i termin od " + periodicno.pocetak + " do " + periodicno.kraj + "!");
                }
                    
            }
        };
        xhttp.open("GET", "/zauzeca.json", true);
        xhttp.send();
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
                    alert("Nije moguce rezervisati salu " + vanredno.naziv + " za navedeni datum " + vanredno.datum + " i termin od " + vanredno.pocetak + " do " + vanredno.kraj + "!");
                else {
                    zauzecaJson.vanredna.push(vanredno);

                    var ajaxPOST = new XMLHttpRequest();
                    ajaxPOST.onreadystatechange = function() {
                        
                        if (this.readyState == 4 && this.status == 200) {
                            Kalendar.ucitajPodatke(zauzecaJson.periodicna, zauzecaJson.vanredna);
                        }
                    };
                    ajaxPOST.open("POST", "http://localhost:8080/zauzeca", true);
                    ajaxPOST.setRequestHeader("Content-Type", "application/json; charset=utf-8");
                    ajaxPOST.send(JSON.stringify(zauzecaJson));
                }
                
            }
        };
        xhttp.open("GET", "/zauzeca.json", true);
        xhttp.send();
    }
    

    function validirajPeriodicno(novo, periodicna, vanredna) {


        var x1 = parseInt(novo.pocetak.replace(':', ''));
        var y1 = parseInt(novo.kraj.replace(':', ''));

        // Ima li vec periodicno na taj dan u tom semestru
        if (Array.isArray(periodicna) && periodicna.length) {

            
            for (let i = 0; i<periodicna.length; i++) {
                let zauzece = periodicna[i];

                var x2 = parseInt(zauzece.pocetak.replace(':', ''));
                var y2 = parseInt(zauzece.kraj.replace(':', ''));

                if (novo.semestar == zauzece.semestar && novo.dan == zauzece.dan && novo.naziv == zauzece.naziv && Math.max(x1, x2) < Math.min(y1, y2))
                    return false;

            }
        }

        // Ima li vec vanredno na bilo koji ___ (dan u sedmici) u tom semestru
        if (Array.isArray(vanredna) && vanredna.length) {

            
            for (let i = 0; i < vanredna.length; i++) {

                let zauzece = vanredna[i];

                var x2 = parseInt(zauzece.pocetak.replace(':', ''));
                var y2 = parseInt(zauzece.kraj.replace(':', ''));

                var parts = zauzece.datum.split('.');
                var year = parseInt(parts[2], 10);
                var month = parseInt(parts[1], 10); 
                var day = parseInt(parts[0], 10);
                
                datum = new Date(year, month-1, day);
                day = datum.getDay() - 1;
                if (day === -1)
                    day = 6;

                if (novo.naziv === zauzece.naziv && Math.max(x1, x2) < Math.min(y1, y2) && novo.dan == day) 
                    return false;
            }
        }
        return true;
    }

    function dohvatiSlikeImpl(url) {
        console.log("ovdje ga " + url);
        var xhttpSlike;
        xhttpSlike=new XMLHttpRequest();
        xhttpSlike.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log("Da li ikad");
                console.log(xhttpSlike.responseText + " da li ikad");
                document.getElementById("sadrzaj").innerHTML = xhttpSlike.responseText;
            }
        };
        xhttpSlike.open("GET", url, true);
        xhttpSlike.send();
    }

    return {    
        ucitajPodatkeSaServera: ucitajPodatkeSaServeraImpl,
        upisiNovoVanrednoZauzece: upisiNovoVanrednoZauzeceImpl,
        upisiNovoPeriodicnoZauzece: upisiNovoPeriodicnoZauzeceImpl,
        dohvatiSlike: dohvatiSlikeImpl 
    }
}());