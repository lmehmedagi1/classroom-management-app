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

        var ajaxPOST = new XMLHttpRequest();
        ajaxPOST.onreadystatechange = function() {
                        
            if (this.readyState == 4 && this.status == 200) {
                zauzecaJson = JSON.parse(ajaxPOST.responseText);
                Kalendar.ucitajPodatke(zauzecaJson.periodicna, zauzecaJson.vanredna);
            }
            else if (this.readyState == 4 && this.status == 400) {
                zauzecaJson = JSON.parse(ajaxPOST.responseText);
                Kalendar.ucitajPodatke(zauzecaJson.periodicna, zauzecaJson.vanredna);
                alert("Nije moguce rezervisati salu " + periodicno.naziv + " za navedeni dan " + periodicno.dan + " i termin od " + periodicno.pocetak + " do " + periodicno.kraj + "!");
            }
        };
        ajaxPOST.open("POST", "http://localhost:8080/zauzeca-periodicna", true);
        ajaxPOST.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        ajaxPOST.send(JSON.stringify(periodicno));
    }

    function upisiNovoVanrednoZauzeceImpl(vanredno) {

        console.log("\n\n*** POCINJEM AJAX ***\n\n")

        var ajaxPOST = new XMLHttpRequest();
        ajaxPOST.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                zauzecaJson = JSON.parse(ajaxPOST.responseText);
                Kalendar.ucitajPodatke(zauzecaJson.periodicna, zauzecaJson.vanredna);
            }
            else if (this.readyState == 4 && this.status == 400) {
                zauzecaJson = JSON.parse(ajaxPOST.responseText);
                Kalendar.ucitajPodatke(zauzecaJson.periodicna, zauzecaJson.vanredna);
                alert("Nije moguce rezervisati salu " + vanredno.naziv + " za navedeni datum " + vanredno.datum + " i termin od " + vanredno.pocetak + " do " + vanredno.kraj + "!");
            }
        };
        ajaxPOST.open("POST", "http://localhost:8080/zauzeca-vanredna", true);
        ajaxPOST.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        ajaxPOST.send(JSON.stringify(vanredno));
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